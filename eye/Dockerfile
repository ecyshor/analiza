FROM golang:1.20.2 AS build

WORKDIR /app

COPY go.mod ./
COPY go.sum ./
RUN go mod download

COPY *.go ./

RUN go build -o /analiza

## Deploy
FROM gcr.io/distroless/base-debian10

WORKDIR /

COPY --from=build /analiza /analiza

EXPOSE 8080

USER nonroot:nonroot

ENTRYPOINT ["/analiza"]
