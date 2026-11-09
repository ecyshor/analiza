#!/bin/bash

set -eo pipefail

echo "Starting clickhouse init"

clickhouse-client --user "$CLICKHOUSE_USER" --password "$CLICKHOUSE_PASSWORD" -n <<-EOSQL
  CREATE DATABASE IF NOT EXISTS eye;
  CREATE USER IF NOT EXISTS eye IDENTIFIED BY '${ANALIZA_EYE_CH_PASSWORD:-eye_super_password}';
  GRANT ALL PRIVILEGES ON eye.* TO eye;
EOSQL
