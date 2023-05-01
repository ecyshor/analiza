FROM metabase/metabase:v0.46.2

ENV METABASE_CLICKHOUSE_DRIVER_VERSION=1.1.3

RUN curl -L -o /plugins/clickhouse.jar https://github.com/ClickHouse/metabase-clickhouse-driver/releases/download/$METABASE_CLICKHOUSE_DRIVER_VERSION/clickhouse.metabase-driver.jar