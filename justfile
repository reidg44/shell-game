# Platform recipes, owned by the all-apps template: take changes with
# `copier update`, not by hand. The App's own recipes live in app.just (imported
# at the end); their names must not collide with these. deploy.yml runs check,
# build, deploy and smoke; from the Mac, run them with AWS_PROFILE=household.
# Rules: docs/platform.md.

set shell := ["bash", "-euo", "pipefail", "-c"]

# List recipes
default:
    @just --list

# The App's lint and tests, then terraform fmt and validate (no backend; needs read access to the module bucket)
check:
    bun run lint && bunx tsc -b && bunx vitest run
    terraform fmt -check
    terraform init -backend=false -input=false >/dev/null
    terraform validate

# Build the site into dist/
build:
    bun run build
    test -f dist/index.html

# terraform apply, then publish dist/ and invalidate the CDN (run build first)
deploy:
    terraform init -input=false
    terraform apply -auto-approve -input=false
    aws s3 sync --delete dist/ "s3://$(terraform output -raw bucket_name)/"
    aws cloudfront create-invalidation --distribution-id "$(terraform output -raw distribution_id)" --paths '/*' >/dev/null

# The App URL answers 200
smoke:
    curl -fsSI "$(terraform output -raw url)" >/dev/null
    @echo "ok: $(terraform output -raw url)"

# Local dev server
dev:
    bun run dev

# Tail a Part's logs (none in a static UI: its access logs are in s3://pennyhunt-logs-<account id>/)
logs part="" since="1h":
    @echo "no Parts with logs in this shape" >&2
    @exit 1

import? 'app.just'
