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
