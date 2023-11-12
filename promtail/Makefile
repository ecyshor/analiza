.PHONY: start
start:
	docker compose -f docker-compose-promtail.yml up --build

.PHONY: start_detached
start_detached:
	docker compose -f docker-compose-promtail.yml up -d --build 

.PHONY: clean
clean:
	docker compose -f docker-compose-promtail.yml down

.PHONY: stop
stop: 
	docker compose -f docker-compose-promtail.yml stop
