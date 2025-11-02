COMPOSE_ARGS ?=

.PHONY: start
start:
	docker compose $(COMPOSE_ARGS) up --build

.PHONY: start_detached
start_detached:
	docker compose $(COMPOSE_ARGS) up -d --build
	$(MAKE) -C promtail start_detached

.PHONY: clean
clean:
	docker compose $(COMPOSE_ARGS) down -v

.PHONY: stop
stop: 
	docker compose $(COMPOSE_ARGS) stop
	$(MAKE) -C promtail stop

.PHONY: build
build:
	docker compose $(COMPOSE_ARGS) build $(c)

.PHONY: up
up:
	docker compose $(COMPOSE_ARGS) up $(c)

.PHONY: ci_up_abort
ci_up_abort:
	docker compose $(COMPOSE_ARGS) up --abort-on-container-exit $(c)

.PHONY: logs
logs:
	docker compose $(COMPOSE_ARGS) logs
