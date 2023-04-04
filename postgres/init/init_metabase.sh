#!/bin/bash

# Set the database name, schema name, and username
DB_NAME="metabase"
SCHEMA_NAME="public"
USERNAME="metabase"
export PGUSER=$POSTGRES_USER
export PGPASSWORD=$POSTGRES_PASSWORD

# Create the database
psql -c "CREATE DATABASE $DB_NAME;"

# Create the user and grant permissions on the schema
psql -d $DB_NAME -c "CREATE USER $USERNAME WITH PASSWORD 'metabase_super_password';"
psql -d $DB_NAME -c "GRANT ALL PRIVILEGES ON SCHEMA $SCHEMA_NAME TO $USERNAME;"
