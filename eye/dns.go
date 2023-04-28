package main

import (
	"context"
	_ "database/sql"
	_ "errors"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/patrickmn/go-cache"
)

const cacheExpiry = 5 * time.Minute

type DomainFetcher interface {
	GetDomains(ctx context.Context, tenantID string) (map[string]struct{}, error)
}

type DBDomainFetcher struct {
	db *pgxpool.Pool
}

type DomainChecker struct {
	fetcher     DomainFetcher
	domainCache *cache.Cache
	checkCache  *cache.Cache
}

func NewDomainChecker(fetcher DomainFetcher) *DomainChecker {
	return &DomainChecker{
		fetcher:     fetcher,
		domainCache: cache.New(5*time.Minute, 10*time.Minute),
		checkCache:  cache.New(5*time.Minute, 10*time.Minute),
	}
}

func NewDbDomainChecker(dbURL string) (*DomainChecker, error) {
	dbpool, err := pgxpool.New(context.Background(), dbURL)
	if err != nil {
		return nil, fmt.Errorf("error creating database connection pool: %w", err)
	}
	log.Print("Created new database domain checker")

	return NewDomainChecker(&DBDomainFetcher{db: dbpool}), nil
}

func (dc *DomainChecker) CheckDomainForTenant(ctx context.Context, tenantID, domain string) (bool, error) {
	cacheKey := tenantID + ":" + domain
	domainResult, ok := dc.domainCache.Get(cacheKey)
	if !ok {
		result, err := dc.checkTenantDomainFromData(ctx, tenantID, domain)
		if err != nil {
			dc.domainCache.Set(cacheKey, result, cacheExpiry)
		}
		return result, err
	} else {
		return domainResult.(bool), nil
	}
}

func (dc *DomainChecker) checkTenantDomainFromData(ctx context.Context, tenantID, domain string) (bool, error) {
	// get domainCache for tenant ID
	cachedDomains, ok := dc.domainCache.Get(tenantID)
	if !ok {
		// domainCache not found, create new domainCache for tenant ID with constant expiry
		// get domains for tenant from database
		domains, err := dc.fetcher.GetDomains(ctx, tenantID)
		if err != nil {
			return false, err
		}
		log.Printf("For tenant %s got domains %s", tenantID, domains)
		dc.domainCache.Set(tenantID, domains, cacheExpiry)
		cachedDomains = domains
	}

	// Check each subdomain, all the way up to the root domain
	subdomains := strings.Split(domain, ".")
	for subdomainIndex := len(subdomains) - 1; subdomainIndex >= 0; subdomainIndex-- {
		subdomain := strings.Join(subdomains[subdomainIndex:], ".")
		_, ok = cachedDomains.(map[string]struct{})[subdomain]
		if ok {
			return true, nil
		}
	}

	return false, nil
}

func (db *DBDomainFetcher) GetDomains(ctx context.Context, tenantID string) (map[string]struct{}, error) {
	log.Printf("Querying domains for tenant %s", tenantID)
	rows, err := db.db.Query(ctx, "SELECT domain FROM api.domains WHERE tenant_id = $1", tenantID)
	if err != nil {
		return nil, fmt.Errorf("error querying domains for tenant %s: %w", tenantID, err)
	}
	defer rows.Close()

	domains := make(map[string]struct{})
	for rows.Next() {
		var domain string
		err := rows.Scan(&domain)
		if err != nil {
			return nil, fmt.Errorf("error scanning domain for tenant %s: %w", tenantID, err)
		}
		log.Printf("Read domain %s for tenant %s", domain, tenantID)
		domains[domain] = struct{}{}
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating over rows for tenant %s: %w", tenantID, err)
	}

	return domains, nil
}
