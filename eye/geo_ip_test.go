package main

import (
	"testing"

	"github.com/stretchr/testify/require"
)

func TestCountryResolution(t *testing.T) {
	reader := NewGeoReader()
	country := reader.ResolveCountry("51.154.24.171")
	require.Equal(t, "CH", country, "Country check")
}

func TestCountryResolutionInvalidIp(t *testing.T) {
	reader := NewGeoReader()
	require.Equal(t, "", reader.ResolveCountry("not-an-ip"), "Invalid ip should resolve to empty country")
}

func TestCountryResolutionPrivateIp(t *testing.T) {
	reader := NewGeoReader()
	require.Equal(t, "", reader.ResolveCountry("10.0.0.1"), "Private ip should resolve to empty country")
}
