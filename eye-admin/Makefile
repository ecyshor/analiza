#!make
ifneq ("$(wildcard .env.private)","")
	include .env.private
	export $(shell sed 's/=.*//' .env.private)
endif

.PHONY: build 
build: 
	yarn build
.PHONY: start
start: 
	yarn dev