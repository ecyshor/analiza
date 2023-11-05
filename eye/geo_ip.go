package main

import (
	"log"
	"net"

	"github.com/oschwald/geoip2-golang"
)

type GeoReader struct {
	geoDb *geoip2.Reader
}

func NewGeoReader() *GeoReader {
	geoDb, err := geoip2.Open("/geo.mmdb")
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
	solvedIp := net.ParseIP(ip)
	if solvedIp == nil {
		log.Printf("Solved empty ip for %s", ip)
	}
	country, err := r.geoDb.Country(solvedIp)
	if err != nil {
		log.Printf("Failed to determine country %s", err)
		return ""
	} else {
		return country.Country.IsoCode
	}
}
