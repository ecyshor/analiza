# Project: analiza.dev

## Project Overview

`analiza.dev` is a simple, privacy-focused website analytics platform. It is designed to be low-cost and GDPR compliant, without using cookies. The project is structured as a monorepo containing multiple services that work together to provide the analytics functionality.

The core architecture consists of:
- A JavaScript tracker (`tracker`) to collect anonymous page view data from client websites.
- A Go backend (`eye`) to ingest and process the data.
- A React-based admin interface (`eye-admin`) for users to view their analytics and manage their domains.
- A Hugo-based landing page (`landing`) for the project's public website.
- Supporting infrastructure including PostgreSQL, ClickHouse, PostgREST, Metabase, and Traefik.

## Services

The project is composed of the following services:

- **`eye` (Go backend):** The main data ingestion service. It receives events from the `tracker`, enriches them with Geo-IP data, and stores them in ClickHouse and PostgreSQL.
- **`eye-admin` (React admin UI):** The frontend application for users to manage their domains and view analytics data. It is built with React Admin and uses PostgREST to communicate with the PostgreSQL database.
- **`tracker` (JavaScript client):** A small JavaScript snippet that website owners can embed on their pages to send analytics data to the `eye` service.
- **`landing` (Hugo site):** The public-facing website for `analiza.dev`, built with Hugo.
- **`postgrest` (PostgREST API):** Provides a RESTful API for the PostgreSQL database, which is used by the `eye-admin` UI.
- **`postgres` (PostgreSQL database):** The primary relational database for storing user and domain information.
- **`clickhouse` (ClickHouse database):** A column-oriented database used for storing and querying analytics events.
- **`metabase` (Metabase):** A business intelligence tool used for creating and displaying analytics dashboards, which are embedded in the `eye-admin` UI.
- **`traefik` (Traefik proxy):** A reverse proxy that routes traffic to the various services and manages CORS.

## Development Environment

The development environment is managed using Nix and direnv. The `nix/shell.nix` file defines all the necessary dependencies, and the `.envrc` file automatically loads them when you enter the project directory.

To set up the local development environment, you will need to have Nix and direnv installed. You will also need to add the following entries to your `/etc/hosts` file:

```
127.0.0.1 api.dev.analiza.lan
127.0.0.1 admin.dev.analiza.lan
127.0.0.1 metabase.dev.analiza.lan
127.0.0.1 openapi.dev.analiza.lan
```

## Building and Running

The project uses Docker Compose to orchestrate the services. The main commands are defined in the root `Makefile`:

- **`make start`:** Builds and starts all services in the foreground.
- **`make start_detached`:** Builds and starts all services in detached mode.
- **`make stop`:** Stops all running services.
- **`make clean`:** Stops and removes all services, volumes, and networks.

## Key Files

- **`docker-compose.yml`:** Defines all the services and their configurations for Docker Compose.
- **`Makefile`:** Contains the main build and run commands for the project.
- **`nix/shell.nix`:** Defines the development environment dependencies for Nix.
- **`eye/`:** Contains the source code for the Go backend service.
- **`eye-admin/`:** Contains the source code for the React admin UI.
- **`tracker/`:** Contains the source code for the JavaScript tracker.
- **`landing/`:** Contains the source code for the Hugo landing page.
- **`postgrest/`:** Contains the configuration and schema for the PostgREST service.
- **`postgres/`:** Contains the initialization scripts for the PostgreSQL database.
