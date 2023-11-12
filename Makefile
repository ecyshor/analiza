.PHONY: start
start:
	docker compose up --build

.PHONY: start_detached
start_detached:
	docker compose up -d --build
	$(MAKE) -C promtail start_detached

.PHONY: clean
clean:
	docker compose down -v

.PHONY: stop
stop: 
	docker compose stop
	$(MAKE) -C promtail stop
