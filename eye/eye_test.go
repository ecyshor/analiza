package main

import (
	"encoding/hex"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"testing"
	"time"

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

const testSeedHex = "f308a5663791e49baa095c4c8a2bc046dbd79f07065f59c713817c5443b46d86"

func newTestServer(eventBuffer int) *Server {
	seed, err := hex.DecodeString(testSeedHex)
	if err != nil {
		panic(err)
	}
	return &Server{
		events: make(chan Event, eventBuffer),
		seed:   seed,
	}
}

const validEventBody = `{"t":"view","p":"https://example.com/pricing","u":"123e4567-e89b-12d3-a456-426614174000","r":"https://referrer.example/"}`

func doEyeRequest(s *Server, method, body string) *httptest.ResponseRecorder {
	req := httptest.NewRequest(method, "/eye", strings.NewReader(body))
	req.Header.Set("Origin", "https://example.com")
	req.Header.Set("User-Agent", "test-agent")
	rec := httptest.NewRecorder()
	s.handleEye(rec, req)
	return rec
}

func TestReadConfigHashSeed(t *testing.T) {
	t.Run("default seed is valid", func(t *testing.T) {
		os.Unsetenv("ANALIZA_HASH_SEED")
		config, err := ReadConfig()
		require.NoError(t, err)
		require.Len(t, config.hashSeed, hashSeedBytes)
		require.Equal(t, defaultHashSeed, hex.EncodeToString(config.hashSeed))
	})

	t.Run("valid override is accepted", func(t *testing.T) {
		t.Setenv("ANALIZA_HASH_SEED", strings.Repeat("ab", hashSeedBytes))
		config, err := ReadConfig()
		require.NoError(t, err)
		require.Len(t, config.hashSeed, hashSeedBytes)
	})

	t.Run("non-hex seed is rejected", func(t *testing.T) {
		t.Setenv("ANALIZA_HASH_SEED", "not-hex-at-all")
		_, err := ReadConfig()
		require.Error(t, err)
		require.Contains(t, err.Error(), "ANALIZA_HASH_SEED")
	})

	t.Run("wrong length seed is rejected", func(t *testing.T) {
		t.Setenv("ANALIZA_HASH_SEED", "abcd")
		_, err := ReadConfig()
		require.Error(t, err)
		require.Contains(t, err.Error(), "ANALIZA_HASH_SEED")
	})
}

func TestHandleEyeAllowedMethods(t *testing.T) {
	s := newTestServer(10)

	require.Equal(t, http.StatusOK, doEyeRequest(s, http.MethodPost, validEventBody).Code)
	require.Equal(t, http.StatusOK, doEyeRequest(s, http.MethodOptions, "").Code)

	for _, method := range []string{http.MethodGet, http.MethodPut, http.MethodDelete, http.MethodPatch} {
		rec := doEyeRequest(s, method, validEventBody)
		require.Equal(t, http.StatusMethodNotAllowed, rec.Code, "method %s", method)
		require.Equal(t, "POST, OPTIONS", rec.Header().Get("Allow"))
	}
}

func TestHandleEyeRejectsInvalidJSON(t *testing.T) {
	s := newTestServer(10)
	rec := doEyeRequest(s, http.MethodPost, "{not json")
	require.Equal(t, http.StatusBadRequest, rec.Code)
}

func TestHandleEyeBodyTooLarge(t *testing.T) {
	s := newTestServer(10)
	bigBody := `{"t":"view","p":"` + strings.Repeat("a", maxEventBodyBytes) + `","u":"123e4567-e89b-12d3-a456-426614174000","r":""}`
	rec := doEyeRequest(s, http.MethodPost, bigBody)
	require.Equal(t, http.StatusRequestEntityTooLarge, rec.Code)

	// a body just under the limit still parses
	okBody := `{"t":"view","p":"` + strings.Repeat("a", maxEventBodyBytes-200) + `","u":"123e4567-e89b-12d3-a456-426614174000","r":""}`
	require.Equal(t, http.StatusOK, doEyeRequest(s, http.MethodPost, okBody).Code)
}

func TestHandleEyeFullChannelReturns503(t *testing.T) {
	s := newTestServer(1)

	require.Equal(t, http.StatusOK, doEyeRequest(s, http.MethodPost, validEventBody).Code)
	require.Len(t, s.events, 1)

	rec := doEyeRequest(s, http.MethodPost, validEventBody)
	require.Equal(t, http.StatusServiceUnavailable, rec.Code)
	require.Equal(t, 1, s.droppedCount())
	require.Len(t, s.events, 1, "full channel must not be overfilled")
}

func TestNoteDroppedEventLogsAtMostOncePerInterval(t *testing.T) {
	s := newTestServer(1)

	s.noteDroppedEvent()
	firstLog := s.lastDropLog
	require.False(t, firstLog.IsZero())

	s.noteDroppedEvent()
	s.noteDroppedEvent()
	require.Equal(t, firstLog, s.lastDropLog, "log timestamp must not advance within the interval")
	require.Equal(t, 3, s.droppedCount())
}

func TestVisitorIdentifierUsesYearAndMonth(t *testing.T) {
	s := newTestServer(1)

	jan2025 := s.visitorIdentifier(time.Date(2025, time.January, 15, 12, 0, 0, 0, time.UTC), "ua", "en-US", "1.2.3.4")
	jan2026 := s.visitorIdentifier(time.Date(2026, time.January, 15, 12, 0, 0, 0, time.UTC), "ua", "en-US", "1.2.3.4")
	jan2026Later := s.visitorIdentifier(time.Date(2026, time.January, 28, 23, 0, 0, 0, time.UTC), "ua", "en-US", "1.2.3.4")
	feb2026 := s.visitorIdentifier(time.Date(2026, time.February, 1, 0, 0, 0, 0, time.UTC), "ua", "en-US", "1.2.3.4")

	require.NotEqual(t, jan2025, jan2026, "the same month name in different years must not collide")
	require.Equal(t, jan2026, jan2026Later, "same year-month must hash identically")
	require.NotEqual(t, jan2026, feb2026, "different months must differ")
	require.Len(t, jan2026, 64, "highwayhash-256 hex digest")
}

func TestHandleEyeRejectsUnknownEventType(t *testing.T) {
	s := newTestServer(10)

	for _, body := range []string{
		`{"t":"scroll","p":"https://example.com/","u":"123e4567-e89b-12d3-a456-426614174000","r":""}`,
		`{"t":"","p":"https://example.com/","u":"123e4567-e89b-12d3-a456-426614174000","r":""}`,
		`{"p":"https://example.com/","u":"123e4567-e89b-12d3-a456-426614174000","r":""}`,
	} {
		rec := doEyeRequest(s, http.MethodPost, body)
		require.Equal(t, http.StatusBadRequest, rec.Code, "body %s", body)
		require.Contains(t, rec.Body.String(), "Unknown event type")
	}
	require.Len(t, s.events, 0, "unknown event types must not be enqueued")
}

func TestHandleEyeClickEventEnqueuedWithSanitizedFields(t *testing.T) {
	s := newTestServer(10)

	body := `{"t":"click","p":"https://example.com/pricing","u":"123e4567-e89b-12d3-a456-426614174000","r":"",` +
		`"n":"  signup-cta  ","h":"https://external.example/landing?token=secret#top"}`
	rec := doEyeRequest(s, http.MethodPost, body)
	require.Equal(t, http.StatusOK, rec.Code)
	require.Len(t, s.events, 1)

	event := <-s.events
	require.Equal(t, Click, event.EventType)
	require.Equal(t, "click", event.EventType.String())
	require.Equal(t, "signup-cta", event.ClickName)
	require.Equal(t, "https://external.example/landing", event.ClickTarget)
}

func TestHandleEyeClickWithoutAnyFieldIsRejected(t *testing.T) {
	s := newTestServer(10)

	for _, body := range []string{
		`{"t":"click","p":"https://example.com/","u":"123e4567-e89b-12d3-a456-426614174000","r":"","n":"","h":""}`,
		`{"t":"click","p":"https://example.com/","u":"123e4567-e89b-12d3-a456-426614174000","r":""}`,
		`{"t":"click","p":"https://example.com/","u":"123e4567-e89b-12d3-a456-426614174000","r":"","n":"   ","h":"javascript:void(0)"}`,
	} {
		rec := doEyeRequest(s, http.MethodPost, body)
		require.Equal(t, http.StatusBadRequest, rec.Code, "body %s", body)
	}
	require.Len(t, s.events, 0, "meaningless click events must not be enqueued")
}

func TestHandleEyeViewIgnoresClickFields(t *testing.T) {
	s := newTestServer(10)

	body := `{"t":"view","p":"https://example.com/","u":"123e4567-e89b-12d3-a456-426614174000","r":"",` +
		`"n":"signup-cta","h":"https://external.example/"}`
	rec := doEyeRequest(s, http.MethodPost, body)
	require.Equal(t, http.StatusOK, rec.Code)
	require.Len(t, s.events, 1)

	event := <-s.events
	require.Equal(t, View, event.EventType)
	require.Equal(t, "", event.ClickName)
	require.Equal(t, "", event.ClickTarget)
}

func TestSanitizeClickName(t *testing.T) {
	require.Equal(t, "", sanitizeClickName("   "))
	require.Equal(t, "cta", sanitizeClickName("  cta  "))
	require.Equal(t, strings.Repeat("é", 128), sanitizeClickName(strings.Repeat("é", 200)),
		"truncation must be rune-safe with multibyte characters")
	require.Equal(t, strings.Repeat("a", 128), sanitizeClickName(strings.Repeat("a", 128)))
}

func TestSanitizeClickTarget(t *testing.T) {
	tests := []struct {
		name string
		in   string
		want string
	}{
		{"empty", "", ""},
		{"whitespace only", "   ", ""},
		{"http url with query and hash stripped", "http://other.example/page?a=1&b=2#frag", "http://other.example/page"},
		{"https download keeps origin and path only", "https://cdn.example.com/files/report.pdf?token=abc", "https://cdn.example.com/files/report.pdf"},
		{"https url without path", "https://other.example", "https://other.example"},
		{"host with port is kept", "https://other.example:8443/x?y=1", "https://other.example:8443/x"},
		{"mailto keeps scheme only", "mailto:someone@example.com?subject=hi", "mailto:"},
		{"tel keeps scheme only", "tel:+1-555-0100", "tel:"},
		{"javascript is dropped", "javascript:alert(1)", ""},
		{"data is dropped", "data:text/html;base64,PHNjcmlwdD4=", ""},
		{"relative url is dropped", "/local/page?x=1", ""},
		{"unparseable is dropped", "://missing-scheme", ""},
		{"http without host is dropped", "http:///just-a-path", ""},
		{"long url truncated to 512 runes", "https://other.example/" + strings.Repeat("a", 600) + "?q=1", "https://other.example/" + strings.Repeat("a", 512-len("https://other.example/"))},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			require.Equal(t, tt.want, sanitizeClickTarget(tt.in))
		})
	}

	t.Run("truncation is rune-safe", func(t *testing.T) {
		in := "https://other.example/" + strings.Repeat("é", 600)
		got := sanitizeClickTarget(in)
		require.Equal(t, "https://other.example/"+strings.Repeat("é", 512-len("https://other.example/")), got)
		require.Len(t, []rune(got), 512)
	})
}
