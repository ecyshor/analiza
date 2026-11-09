COMPOSE_ARGS ?=

.PHONY: start
start:
	docker compose $(COMPOSE_ARGS) --profile dev up --build

.PHONY: start_detached
start_detached:
	docker compose $(COMPOSE_ARGS) --profile dev up -d --build
	$(MAKE) -C promtail start_detached

.PHONY: clean
clean:
	docker compose $(COMPOSE_ARGS) --profile dev down -v

.PHONY: stop
stop: 
	docker compose $(COMPOSE_ARGS) --profile dev stop
	$(MAKE) -C promtail stop

.PHONY: build
build:
	docker compose $(COMPOSE_ARGS) --profile dev build $(c)

.PHONY: up
up:
	docker compose $(COMPOSE_ARGS) --profile dev up $(c)

.PHONY: ci_up_abort
ci_up_abort:
	docker compose $(COMPOSE_ARGS) --profile dev up --abort-on-container-exit $(c)

.PHONY: logs
logs:
	docker compose $(COMPOSE_ARGS) --profile dev logs
