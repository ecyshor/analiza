#!make
include .env.private
export $(shell sed 's/=.*//' .env.private)

.PHONY: build 
build: 
	yarn build
.PHONY: start
start: 
	yarn dev