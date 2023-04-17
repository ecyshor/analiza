package main

import (
	"context"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"github.com/google/uuid"
	"log"
	"net/http"
	"net/url"
	"time"
)
import "github.com/ClickHouse/clickhouse-go/v2"
import (
	"github.com/minio/highwayhash"
)

const (
	seedConstant = "currently_constant_seed"
)

type UserEventType string

func (e UserEventType) String() string {
	switch e {
	case View:
		return "view"
	case Gone:
		return "gone"
	default:
		return fmt.Sprintf("%s", string(e))
	}
}

const (
	View UserEventType = "view"
	Gone UserEventType = "gone"
)

type UserEvent struct {
	EventType UserEventType `json:"type"`
	Path      string        `json:"path"`
	Tenant    uuid.UUID     `json:"tenant"`
}

type Event struct {
	Tenant         uuid.UUID     `json:"tenant_id"`
	Domain         string        `json:"domain"`
	UserIdentifier string        `json:"user_id"`
	EventType      UserEventType `json:"type"`
	Referral       string        `json:"referral"`
	UtmSource      string        `json:"utm_source"`
	UtmMedium      string        `json:"utm_medium"`
	UtmCampaign    string        `json:"utm_campaign"`
	UtmTerm        string        `json:"utm_term"`
	UtmContent     string        `json:"utm_content"`
	UserAgent      string        `json:"user_agent"`
	InsertTime     time.Time     `json:"insert_time"`
	Path           string        `json:"path"`
}

type Server struct {
	conn   clickhouse.Conn
	events chan Event
	seed   []byte
}

func main() {
	config := ReadConfig()
	// Create the ClickHouse connection pool with the given options
	conn, err := clickhouse.Open(&clickhouse.Options{
		Addr: []string{fmt.Sprintf("%s:9000", config.clickhouse.host)},
		Auth: clickhouse.Auth{
			Database: config.clickhouse.database,
			Username: config.clickhouse.user,
			Password: config.clickhouse.password,
		},
		Settings: clickhouse.Settings{
			"max_execution_time": 60,
		},
		Compression: &clickhouse.Compression{
			Method: clickhouse.CompressionLZ4,
		},
		DialTimeout:          time.Second * 30,
		MaxOpenConns:         5,
		MaxIdleConns:         20,
		ConnMaxLifetime:      time.Duration(10) * time.Minute,
		ConnOpenStrategy:     clickhouse.ConnOpenInOrder,
		BlockBufferSize:      10,
		MaxCompressionBuffer: 10240,
	})
	if err != nil {
		log.Printf("Error connecting to clickhouse: %s", err)
		panic(err)
	}
	serverVersion, err := conn.ServerVersion()
	if err != nil {
		log.Printf("Cannot query server version: %s", err)
		panic(err)
	}
	log.Printf("Connected to clickhouse %s", serverVersion)
	initTables(conn)
	// Create the HTTP server with the connection pool as part of the state
	eventChannel := make(chan Event, 100)
	seedHash, err := hex.DecodeString("f308a5663791e49baa095c4c8a2bc046dbd79f07065f59c713817c5443b46d86")
	if err != nil {
		log.Printf("Failed to decode seed: %s", err)
		panic(err)
	}
	server := &Server{
		conn:   conn,
		events: eventChannel,
		seed:   seedHash,
	}
	// Create a channel to queue the rows for batch inserts

	// Start a goroutine to batch insert the queued rows
	checker, err := NewDbDomainChecker(fmt.Sprintf("postgres://%s:%s@%s:5432/%s",
		config.postgres.user, config.postgres.password, config.postgres.host, config.postgres.database))
	if err != nil {
		log.Printf("Failed to start the domain checker %s", err)
		panic(err)
	}
	go server.batchInsertRows(eventChannel, checker)
	http.HandleFunc("/eye", server.handleEye)
	http.HandleFunc("/health", server.health)

	// Start the HTTP server
	log.Println("Starting HTTP server on port 8080...")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		panic(err)
	}
}

func (s *Server) health(w http.ResponseWriter, request *http.Request) {
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write([]byte("OK"))
}

func (s *Server) handleEye(w http.ResponseWriter, request *http.Request) {
	// Parse the JSON request body
	var userEvent UserEvent
	if err := json.NewDecoder(request.Body).Decode(&userEvent); err != nil {
		http.Error(w, "Invalid JSON request body", http.StatusBadRequest)
		return
	}
	var event Event
	event.Domain = request.Header.Get("Origin")

	event.Tenant = userEvent.Tenant
	event.EventType = userEvent.EventType
	// Get the referral, utm, and source query params from the HTTP request

	pageUrl, err := url.Parse(userEvent.Path)
	if err != nil {
		event.UtmContent = pageUrl.Query().Get("utm_content")
		event.UtmTerm = pageUrl.Query().Get("utm_term")
		event.UtmMedium = pageUrl.Query().Get("utm_medium")
		event.UtmSource = pageUrl.Query().Get("utm_source")
		event.UtmCampaign = pageUrl.Query().Get("utm_campaign")
	}

	event.Referral = request.Header.Get("Referer")
	event.Path = pageUrl.Path

	event.UserAgent = request.UserAgent()

	// Set the insertion time to the current time
	now := time.Now()
	event.InsertTime = now
	month := now.Format("January")

	idHash := highwayhash.Sum([]byte(month+request.UserAgent()+request.RemoteAddr), s.seed)
	idContent := hex.EncodeToString(idHash[:])

	event.UserIdentifier = idContent
	if event.Domain != "" {
		s.events <- event
	} else {
		log.Printf("Event with empty domain: %s", event)
	}

	// Write a response back to the client
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write([]byte("OK"))
}

func (s *Server) batchInsertRows(eventChan <-chan Event, checker *DomainChecker) {
	var rows []Event

	for {
		select {
		case event := <-eventChan:
			tenant, err := checker.CheckDomainForTenant(context.Background(), event.Tenant.String(), event.Domain)
			if err != nil {
				log.Printf("Failed to check domain %s", err)
				if tenant {
					rows = append(rows, event)
					if len(rows) == 100 {
						insertRows(s.conn, rows)
						rows = nil
					}
				}
			}

		case <-time.After(time.Second):
			if len(rows) > 0 {
				insertRows(s.conn, rows)
				rows = nil
			}
		}
	}
}

// insertRows inserts the given rows into ClickHouse using a prepared statement and a transaction
func insertRows(conn clickhouse.Conn, rows []Event) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	batch, err := conn.PrepareBatch(ctx, "INSERT INTO events (tenant_id, domain, user_id, type, referral, utm_source, utm_medium, utm_campaign, utm_term, utm_content, user_agent, insert_time, path) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
	if err != nil {
		log.Printf("Error getting ClickHouse batch: %s", err)
	}
	for _, event := range rows {
		err := batch.Append(
			event.Domain,
			event.UserIdentifier,
			event.EventType.String(),
			event.Referral,
			event.UtmSource,
			event.UtmMedium,
			event.UtmCampaign,
			event.UtmTerm,
			event.UtmContent,
			event.UserAgent,
			event.InsertTime,
			event.Path,
		)
		if err != nil {
			log.Printf("Failed to append batch: %s", err)
		}
	}
	err = batch.Send()
	if err != nil {
		log.Printf("Failed to send batch %s", err)
	}
}

func initTables(c clickhouse.Conn) {
	dropTable := `DROP TABLE IF EXISTS events`
	err := c.Exec(context.Background(), dropTable)
	if err != nil {
		log.Printf("Failed to drop table %s", err)
		panic(err)
	} else {
		log.Println("Clickhouse schema dropped")
	}
	createTable := `
		CREATE TABLE IF NOT EXISTS events (
		    tenant_id UUID,
		    domain String,
			user_id String,
			type Enum8('view' = 1, 'gone' = 2),
			referral String,
			utm_source String,
			utm_medium String,
			utm_campaign String,
			utm_term String,
			utm_content String,
			user_agent String,
			insert_time DateTime,
			path String
		) ENGINE = MergeTree
		ORDER BY (tenant_id, domain, insert_time);
	`
	err = c.Exec(context.Background(), createTable)
	if err != nil {
		log.Printf("Failed to create table %s", err)
		panic(err)
	} else {
		log.Println("Clickhouse schema initialized")
	}

}
