package main

import (
	"log"
	"net/netip"
	"os"

	"github.com/oschwald/geoip2-golang/v2"
)

type GeoReader struct {
	geoDb *geoip2.Reader
}

func geoDbPath() string {
	if path := os.Getenv("GEO_DB_PATH"); path != "" {
		return path
	}
	return "/geo.mmdb"
}

func NewGeoReader() *GeoReader {
	geoDb, err := geoip2.Open(geoDbPath())
	if err != nil {
		log.Fatal(err)
	}
	return &GeoReader{
		geoDb: geoDb,
	}
}

func (reader *GeoReader) Close() {
	reader.geoDb.Close()
}

// use golang geo library to determine the country
func (r *GeoReader) ResolveCountry(ip string) string {
	if r == nil || r.geoDb == nil {
		return ""
	}
	solvedIp, err := netip.ParseAddr(ip)
	if err != nil {
		log.Printf("Solved empty ip for %s", ip)
		return ""
	}
	country, err := r.geoDb.Country(solvedIp)
	if err != nil {
		log.Printf("Failed to determine country %s", err)
		return ""
	}
	if !country.HasData() {
		return ""
	}
	return country.Country.ISOCode
}
