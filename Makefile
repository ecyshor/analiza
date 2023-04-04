.PHONY: start
start:
	docker compose up --build
.PHONY: clean
clean:
	docker compose down -v
