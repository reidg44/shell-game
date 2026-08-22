# Penny Hunt — common commands

default:
    @just --list

# Install dependencies (and Playwright's Chromium)
setup:
    npm install
    npx playwright install chromium

# Dev server on http://localhost:5173
dev:
    npm run dev

# Typecheck + production build into dist/
build:
    npm run build

# Serve the production build
preview:
    npm run preview

# Lint (oxlint) + typecheck
lint:
    npm run lint
    npx tsc -b

# Unit tests (vitest)
test:
    npx vitest run

# Browser e2e tests (playwright)
e2e:
    npx playwright test

# Build with the GitHub Pages base path (what the deploy workflow does)
build-pages:
    BASE_PATH=/shell-game/ npm run build

# Everything CI would run
check: lint test e2e
