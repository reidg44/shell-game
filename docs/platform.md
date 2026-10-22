# pennyhunt on the Platform

This App runs on the household Platform from [all-apps](https://github.com/reidg44/all-apps). The Platform's rules are in its [spec](https://github.com/reidg44/all-apps/blob/main/docs/platform-spec.md), and each rule links the ADR that gives its reasons. This page is the App-side summary. The all-apps template writes it, so take changes with `copier update`, not by hand.

- **Slug:** `pennyhunt`, claimed in all-apps's [`apps.yaml`](https://github.com/reidg44/all-apps/blob/main/apps.yaml). It is permanent once deployed.
- **URL:** https://pennyhunt.apps.geyers.net
- **Shape:** a static UI on S3 and CloudFront, with no Backend, Store or Jobs.

## What the template owns

These files are Platform glue. Don't edit them by hand; `copier update` rewrites them:

- `main.tf`: the Terraform root. It calls the Platform's `static-ui` module and keeps state at `apps/pennyhunt/terraform.tfstate` in the Platform state bucket. Put any Terraform of the App's own in other `*.tf` files.
- `justfile`: the Platform recipes. The App's own recipes go in `app.just`, which the justfile imports. A recipe there must not reuse a Platform recipe's name.
- `.github/workflows/deploy.yml`: the deploy workflow.
- `.pre-commit-config.yaml` and `.gitignore`: the App's own hooks and lines go below the Platform ones.
- `.copier-answers.yml`: the template version and the answers to its questions. Never edit it by hand.

`AGENTS.md`, `CLAUDE.md` and `.env.example` are written only if they don't exist yet. After that, the App owns them.

## How a deploy happens

A push to `main` is the deploy ([ADR 0011](https://github.com/reidg44/all-apps/blob/main/docs/adr/0011-one-deploy-workflow-per-app.md)). There are no preview deploys: `just dev` is the preview.

- **`check`** runs on every pull request and on `main`: `just check`. It needs read access to the Platform module bucket, so it assumes the read-only `platform-modules-read` role. It touches nothing else in AWS.
- **`deploy`** runs on `main` (and by hand from the Actions tab) after `check` passes: `just build`, `just deploy`, `just smoke`. It runs in the `production` environment and assumes the shared deploy role from the repo variable `DEPLOY_ROLE_ARN`, the only repo variable. The role trusts only this repo's `production` environment, and that environment deploys only from `main`.
- A run never cancels another one partway through an apply.
- A failed run sends GitHub's usual failure email. To roll back, revert on `main`, which redeploys. To fix a half-finished apply, rerun the workflow.
- Buckets and the distribution have `prevent_destroy` in the module, so an apply can't delete them.

## The recipes

| Recipe | What it does |
|---|---|
| `just check` | `bun run lint && bunx tsc -b && bunx vitest run`, then `terraform fmt -check` and `terraform validate` (no backend) |
| `just build` | `bun run build`, which must leave the site in `dist/` |
| `just deploy` | `terraform apply -auto-approve`, `aws s3 sync --delete dist/` to the UI bucket, then a CloudFront invalidation of `/*` |
| `just smoke` | checks that the App URL answers 200 |
| `just dev` | `bun run dev` |
| `just logs` | no Parts with logs in this shape; access logs are in the bucket `pennyhunt-logs-<account id>` for 30 days |

**When CI is down, or for a first deploy:** run the same recipes from Reid's Mac with `AWS_PROFILE=household just build deploy smoke`. This is the documented fallback, not a second way to deploy.

## Pins

- Terraform is pinned to 1.16.6 in `main.tf` and `deploy.yml`, and the AWS provider to 6.69.1. Commit `.terraform.lock.hcl`, which the first `just check` writes.
- Every action is pinned by commit SHA with a version comment. There is no Dependabot; `copier update` refreshes the pins.
- The runtime version comes from the App's own file `.bun-version`, which must exist.
- The Platform version lives only in `.copier-answers.yml` (`_commit`) and the module sources in `main.tf`.

## Taking a Platform update

`just doctor` in all-apps shows each App's template version next to the latest Platform tag. Updates are pulled, never pushed:

```bash
copier update --skip-answered     # newest Platform tag; answers kept, only new questions asked
git diff                          # review: module sources, pins, recipes
```

Resolve any conflicts, open a PR, and let `check` pass before you merge. Merging deploys.

## One-time repo setup

all-apps's `new-app` skill does this. Done by hand, it is:

- the repo variable `DEPLOY_ROLE_ARN`, set to the value of the Platform's `/platform/deploy-role-arn` parameter
- a `production` environment whose deployment branches are limited to `main`
- a ruleset on `main` that requires the `check` status before a merge, once the account is on GitHub Pro: Free gives private repos no rulesets, and only the environment gate holds ([ADR 0011](https://github.com/reidg44/all-apps/blob/main/docs/adr/0011-one-deploy-workflow-per-app.md))
