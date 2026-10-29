# Penny Hunt's own recipes (bun). The Platform's justfile imports this file;
# check, build, deploy, smoke, dev and logs belong to the template.
#
# `just check` runs lint, tsc and vitest (check_cmd in .copier-answers.yml) but
# not e2e: Playwright's Chromium install is slow in CI. Run `just e2e` locally.

# Install dependencies (and Playwright's Chromium)
setup:
    bun install
    bunx playwright install chromium

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

# Browser e2e tests (playwright); PLAYWRIGHT_BASE_URL=https://... runs them against a deployed site
e2e:
    bunx playwright test
