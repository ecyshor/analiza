#!/bin/bash

set -eo pipefail

echo "Starting clickhouse init"

clickhouse client --user "$CLICKHOUSE_ADMIN_USER" --password "$CLICKHOUSE_ADMIN_PASSWORD" -n <<-EOSQL
  CREATE DATABASE IF NOT EXISTS eye;
  CREATE USER IF NOT EXISTS eye IDENTIFIED BY 'eye_super_password';
  GRANT ALL PRIVILEGES ON eye.* TO eye;
EOSQL
