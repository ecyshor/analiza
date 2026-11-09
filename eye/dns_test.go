package main

import (
	"context"
	"fmt"
	"github.com/stretchr/testify/require"
	"testing"
)

type TestDomainFetcher struct {
	Domains map[string][]string
	calls   int32
}

func (f *TestDomainFetcher) GetDomains(ctx context.Context, tenantID string) (map[string]struct{}, error) {
	f.calls = f.calls + 1
	tenantDomains := make(map[string]struct{})

	// Add each element of the slice to the map with a value of nil
	for _, v := range f.Domains[tenantID] {
		tenantDomains[v] = struct{}{}
	}
	return tenantDomains, nil
}

func TestCheckDomainForTenantUsesCachingForTheTenant(t *testing.T) {
	fetcher := &TestDomainFetcher{Domains: map[string][]string{
		"ten1": {"example.com"},
		"ten2": {"sub4.example.com", "root.com"},
	}, calls: 0}
	dc := NewDomainChecker(fetcher)

	// Test various domain inputs
	tests := []struct {
		tenant   string
		domain   string
		expected bool
		cached   bool
	}{
		{"ten1", "sub1.example.com", true, false},
		{"ten1", "sub2.example.com", true, true},
		{"ten1", "sub3.example.com", true, true},
		{"ten1", "example.com", true, true},
		{"ten2", "nsub.sub4.example.com", true, false},
		{"ten2", "sub4.example.com", true, true},
		{"ten2", "example.com", false, true},
		{"ten2", ".com", false, true},
		{"ten2", "example.net", false, true},
		{"ten2", "root.com", true, true},
	}
	expectedCached := 0
	for _, test := range tests {
		t.Run(fmt.Sprintf("%s for tenant %s", test.domain, test.tenant), func(t *testing.T) {
			actual, err := dc.CheckDomainForTenant(context.Background(), test.tenant, test.domain)
			require.NoErrorf(t, err, "Check domain failed")
			require.Equal(t, test.expected, actual, "Domain check")
			if !test.cached {
				expectedCached += 1
			}
			require.EqualValues(t, fetcher.calls, expectedCached, "Unexpected cache call")
		})
	}
}

type flakyDomainFetcher struct {
	Domains map[string][]string
	err     error
	calls   int32
}

func (f *flakyDomainFetcher) GetDomains(ctx context.Context, tenantID string) (map[string]struct{}, error) {
	f.calls = f.calls + 1
	if f.err != nil {
		return nil, f.err
	}
	tenantDomains := make(map[string]struct{})
	for _, v := range f.Domains[tenantID] {
		tenantDomains[v] = struct{}{}
	}
	return tenantDomains, nil
}

func TestCheckDomainForTenantCachesSuccessfulResults(t *testing.T) {
	fetcher := &flakyDomainFetcher{Domains: map[string][]string{
		"ten1": {"example.com"},
	}}
	dc := NewDomainChecker(fetcher)

	actual, err := dc.CheckDomainForTenant(context.Background(), "ten1", "sub.example.com")
	require.NoError(t, err)
	require.True(t, actual)
	require.EqualValues(t, 1, fetcher.calls)

	// The successful per-domain result is cached.
	cached, ok := dc.checkCache.Get("ten1:sub.example.com")
	require.True(t, ok, "successful check must be cached")
	require.Equal(t, true, cached)

	// Serving it again does not touch the fetcher, even if the database is now down.
	fetcher.err = fmt.Errorf("database is down")
	actual, err = dc.CheckDomainForTenant(context.Background(), "ten1", "sub.example.com")
	require.NoError(t, err)
	require.True(t, actual)
	require.EqualValues(t, 1, fetcher.calls, "successful check must be served from the cache")
}

func TestCheckDomainForTenantNeverCachesErrors(t *testing.T) {
	fetcher := &flakyDomainFetcher{
		Domains: map[string][]string{"ten1": {"example.com"}},
		err:     fmt.Errorf("database is down"),
	}
	dc := NewDomainChecker(fetcher)

	actual, err := dc.CheckDomainForTenant(context.Background(), "ten1", "example.com")
	require.Error(t, err)
	require.False(t, actual)

	_, ok := dc.checkCache.Get("ten1:example.com")
	require.False(t, ok, "errors must never be cached")

	// The error must not be cached: once the database recovers, the same
	// check succeeds.
	fetcher.err = nil
	actual, err = dc.CheckDomainForTenant(context.Background(), "ten1", "example.com")
	require.NoError(t, err)
	require.True(t, actual)
	require.EqualValues(t, 2, fetcher.calls, "errored check must be retried, not served from the cache")
}
