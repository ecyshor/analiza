.PHONY: start
start:
	docker compose up -f docker-compose-promtail.yml --build

.PHONY: start_detached
start_detached:
	docker compose up -d --build -f docker-compose-promtail.yml

.PHONY: clean
clean:
	docker compose -f docker-compose-promtail.yml down

.PHONY: stop
stop: 
	docker compose -f docker-compose-promtail.yml stop
