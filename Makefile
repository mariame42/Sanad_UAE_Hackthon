# Sanad — build & run. `make` lists the targets.

NPM        ?= npm
PORT       ?= 3000
SMOKE_PORT ?= 3123
NODE_MIN   := 20.9.0

.DEFAULT_GOAL := help
.PHONY: help check-node install env dev build start prod lint typecheck check smoke all clean distclean

help: ## Show this help
	@grep -E '^[a-z-]+:.*## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*## "} {printf "  \033[36m%-11s\033[0m %s\n", $$1, $$2}'

check-node: ## Verify Node.js >= 20.9 (required by Next.js 16)
	@node -e 'const [a,b]=process.versions.node.split(".").map(Number); if (a<20||(a===20&&b<9)) { console.error("Node $(NODE_MIN)+ required, found "+process.version); process.exit(1) }'

# Reinstall only when the lockfile changes.
node_modules/.package-lock.json: package-lock.json package.json
	$(NPM) ci
	@touch $@

install: check-node node_modules/.package-lock.json ## Install dependencies (npm ci)

env: ## Create .env.local from .env.example (LLM key is optional)
	@test -f .env.local || (cp .env.example .env.local && echo "Created .env.local — add LLM_API_KEY for live AI (optional).")

dev: install env ## Run the dev server on PORT (default 3000)
	$(NPM) run dev -- -p $(PORT)

build: install ## Production build
	$(NPM) run build

start: ## Serve the last production build on PORT
	@test -f .next/BUILD_ID || (echo "No build found — run 'make build' first." && exit 1)
	$(NPM) run start -- -p $(PORT)

prod: build start ## Build, then serve in production mode

lint: install ## ESLint
	$(NPM) run lint

typecheck: install ## TypeScript (generates Next route types first)
	npx next typegen
	npx tsc --noEmit

check: lint typecheck build ## Lint + typecheck + build (run before pushing)

smoke: build ## Start the production build and hit every page + the LLM API
	@PORT=$(SMOKE_PORT) sh scripts/smoke.sh

all: check smoke ## Everything: lint, typecheck, build, smoke test

clean: ## Remove build output
	rm -rf .next tsconfig.tsbuildinfo

distclean: clean ## Remove build output and node_modules
	rm -rf node_modules
