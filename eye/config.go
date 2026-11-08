package main

import (
	"encoding/hex"
	"fmt"
	"os"
)

// defaultHashSeed is the fallback for ANALIZA_HASH_SEED. It must stay valid:
// 64 hex characters decoding to the 32-byte highwayhash key.
const defaultHashSeed = "f308a5663791e49baa095c4c8a2bc046dbd79f07065f59c713817c5443b46d86"

// hashSeedBytes is the key size required by highwayhash (highwayhash.Size).
const hashSeedBytes = 32

type DatabaseConfig struct {
	host     string
	database string
	user     string
	password string
}

type Config struct {
	clickhouse DatabaseConfig
	postgres   DatabaseConfig
	hashSeed   []byte
}

func ReadConfig() (*Config, error) {
	seedHex := getEnv("ANALIZA_HASH_SEED", defaultHashSeed)
	seed, err := hex.DecodeString(seedHex)
	if err != nil {
		return nil, fmt.Errorf("ANALIZA_HASH_SEED is not valid hex: %w", err)
	}
	if len(seed) != hashSeedBytes {
		return nil, fmt.Errorf("ANALIZA_HASH_SEED must be %d hex characters (%d bytes), got %d bytes", hashSeedBytes*2, hashSeedBytes, len(seed))
	}
	return &Config{
		clickhouse: DatabaseConfig{
			host:     getEnv("CLICKHOUSE_HOST", "localhost"),
			database: getEnv("CLICKHOUSE_DB", "eye"),
			user:     getEnv("CLICKHOUSE_USER", "eye"),
			password: getEnv("CLICKHOUSE_PASSWORD", "eye_super_password"),
		},
		postgres: DatabaseConfig{
			host:     getEnv("POSTGRES_HOST", "localhost"),
			database: getEnv("POSTGRES_DB", "eye_admin"),
			user:     getEnv("POSTGRES_USER", "eye"),
			password: getEnv("POSTGRES_PASSWORD", "super_secret_password"),
		},
		hashSeed: seed,
	}, nil
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}
