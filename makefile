.PHONY: help start stop logs rebuild frontend-shell backend-shell clean

# Define colors for better output
COLOR_RESET=\033[0m
COLOR_GREEN=\033[32m
COLOR_YELLOW=\033[33m
COLOR_BLUE=\033[34m

help: ## Display this help message
	@echo "$(COLOR_BLUE)OpenBudget Development Commands:$(COLOR_RESET)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "$(COLOR_GREEN)%-15s$(COLOR_RESET) %s\n", $$1, $$2}'

start: ## Start the development environment
	@echo "$(COLOR_BLUE)Starting OpenBudget development environment...$(COLOR_RESET)"
	docker-compose up -d
	@echo "$(COLOR_GREEN)Services started!$(COLOR_RESET)"
	@echo "Frontend: http://localhost:5173"
	@echo "Backend API: http://localhost:8000"
	@echo "API docs: http://localhost:8000/docs"

stop: ## Stop the development environment
	@echo "$(COLOR_BLUE)Stopping OpenBudget development environment...$(COLOR_RESET)"
	docker-compose down
	@echo "$(COLOR_GREEN)Services stopped!$(COLOR_RESET)"

logs: ## View logs from all containers
	docker-compose logs -f

frontend-logs: ## View frontend logs
	docker-compose logs -f frontend

backend-logs: ## View backend logs
	docker-compose logs -f backend

rebuild: ## Rebuild containers
	@echo "$(COLOR_BLUE)Rebuilding containers...$(COLOR_RESET)"
	docker-compose build
	docker-compose up -d
	@echo "$(COLOR_GREEN)Rebuild complete!$(COLOR_RESET)"

frontend-shell: ## Access shell in the frontend container
	docker-compose exec frontend /bin/sh

backend-shell: ## Access shell in the backend container
	docker-compose exec backend /bin/bash

clean: ## Remove all containers and volumes
	@echo "$(COLOR_YELLOW)Warning: This will remove all Docker containers and volumes!$(COLOR_RESET)"
	@read -p "Are you sure you want to continue? [y/N] " answer; \
	if [ "$$answer" = "y" ] || [ "$$answer" = "Y" ]; then \
		docker-compose down -v; \
		echo "$(COLOR_GREEN)Clean completed!$(COLOR_RESET)"; \
	else \
		echo "$(COLOR_BLUE)Clean aborted.$(COLOR_RESET)"; \
	fi