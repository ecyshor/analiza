package main

import "os"

type DatabaseConfig struct {
	host     string
	database string
	user     string
	password string
}

type Config struct {
	clickhouse DatabaseConfig
	postgres   DatabaseConfig
}

func ReadConfig() *Config {
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
	}
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}
