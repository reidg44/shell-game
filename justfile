# Penny Hunt — common commands (bun)

default:
    @just --list

# Install dependencies (and Playwright's Chromium)
setup:
    bun install
    bunx playwright install chromium

# Dev server on http://localhost:5173
dev:
    bun run dev

# Typecheck + production build into dist/
build:
    bun run build

# Build with the GitHub Pages base path (what the deploy workflow does)
build-pages:
    BASE_PATH=/shell-game/ bun run build

# Serve the production build
preview:
    bun run preview

# Lint (oxlint) + typecheck
lint:
    bun run lint
    bunx tsc -b

# Unit tests (vitest)
test:
    bunx vitest run

# Browser e2e tests (playwright)
e2e:
    bunx playwright test

# Everything CI would run
check: lint test e2e
