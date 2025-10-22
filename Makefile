.PHONY: help install dev build clean docker-up docker-down docker-build db-push db-migrate db-studio db-seed

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install dependencies
	pnpm install

dev: ## Start development servers
	pnpm dev

build: ## Build all applications
	pnpm build

clean: ## Clean build artifacts and dependencies
	rm -rf node_modules
	rm -rf apps/*/node_modules
	rm -rf packages/*/node_modules
	rm -rf apps/*/.next
	rm -rf apps/*/dist
	rm -rf .turbo

docker-up: ## Start Docker containers
	docker-compose up -d

docker-down: ## Stop Docker containers
	docker-compose down

docker-build: ## Build Docker images
	docker-compose build

docker-logs: ## Show Docker logs
	docker-compose logs -f

db-push: ## Push Prisma schema to database
	pnpm db:push

db-migrate: ## Run database migrations
	pnpm db:migrate

db-studio: ## Open Prisma Studio
	pnpm db:studio

db-seed: ## Seed the database
	pnpm --filter @rentify/db db:seed

setup: install db-push db-seed ## Complete initial setup
	@echo "✅ Setup complete! Run 'make dev' to start development servers."

