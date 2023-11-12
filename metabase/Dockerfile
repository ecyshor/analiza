FROM metabase/metabase:v0.47.7

ENV METABASE_CLICKHOUSE_DRIVER_VERSION=1.2.3

RUN curl -L -o /plugins/clickhouse.jar https://github.com/ClickHouse/metabase-clickhouse-driver/releases/download/$METABASE_CLICKHOUSE_DRIVER_VERSION/clickhouse.metabase-driver.jar