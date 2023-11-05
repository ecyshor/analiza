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
