package main

import (
	"testing"

	"github.com/stretchr/testify/require"
)

func TestParsePageUrl(t *testing.T) {
	t.Run("all utm params", func(t *testing.T) {
		path, utm, ok := parsePageUrl("https://x.dev/pricing?utm_source=newsletter&utm_medium=email&utm_campaign=launch&utm_term=running+shoes&utm_content=hero+banner")
		require.True(t, ok)
		require.Equal(t, "/pricing", path)
		require.Equal(t, utmParams{
			source:   "newsletter",
			medium:   "email",
			campaign: "launch",
			term:     "running shoes",
			content:  "hero banner",
		}, utm)
	})

	t.Run("no utm params", func(t *testing.T) {
		path, utm, ok := parsePageUrl("https://x.dev/blog/some-post?a=1")
		require.True(t, ok)
		require.Equal(t, "/blog/some-post", path)
		require.Equal(t, utmParams{}, utm)
	})

	t.Run("trailing slash is trimmed", func(t *testing.T) {
		path, _, ok := parsePageUrl("https://x.dev/docs/")
		require.True(t, ok)
		require.Equal(t, "/docs", path)
	})

	t.Run("root url has empty path", func(t *testing.T) {
		path, utm, ok := parsePageUrl("https://x.dev/")
		require.True(t, ok)
		require.Equal(t, "", path)
		require.Equal(t, utmParams{}, utm)
	})

	t.Run("unparsable url", func(t *testing.T) {
		path, utm, ok := parsePageUrl("://missing-scheme")
		require.False(t, ok)
		require.Equal(t, "", path)
		require.Equal(t, utmParams{}, utm)
	})
}
