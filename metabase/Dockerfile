FROM metabase/metabase:v0.50.24

ENV METABASE_CLICKHOUSE_DRIVER_VERSION=1.50.6

RUN curl -L -o /plugins/clickhouse.jar https://github.com/ClickHouse/metabase-clickhouse-driver/releases/download/$METABASE_CLICKHOUSE_DRIVER_VERSION/clickhouse.metabase-driver.jar