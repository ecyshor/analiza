FROM golang:1.20.2 AS build

WORKDIR /app

COPY go.mod ./
COPY go.sum ./
RUN go mod download

COPY *.go ./

RUN go build -o /analiza
RUN wget https://github.com/P3TERX/GeoLite.mmdb/raw/download/GeoLite2-Country.mmdb -O /geo.mmdb

## Deploy
FROM gcr.io/distroless/base-debian10

WORKDIR /

COPY --from=build /analiza /analiza
COPY --from=build /geo.mmdb /geo.mmdb

EXPOSE 8080

USER nonroot:nonroot

ENTRYPOINT ["/analiza"]
