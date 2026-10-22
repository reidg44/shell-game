# Platform glue, owned by the all-apps template: take changes with `copier update`,
# not by hand. The App's own Terraform, if any, goes in other *.tf files.
terraform {
  # One exact version, here and in deploy.yml (ADR 0011).
  required_version = "1.16.6"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "6.69.1"
    }
  }

  backend "s3" {
    bucket       = "all-apps-tfstate-174309188893"
    key          = "apps/pennyhunt/terraform.tfstate"
    region       = "us-east-1"
    use_lockfile = true
  }
}

# Credentials come from the environment: the deploy role in CI, AWS_PROFILE=household on the Mac.
provider "aws" {
  region              = "us-east-1"
  allowed_account_ids = ["174309188893"]

  default_tags {
    tags = { app = "pennyhunt" }
  }
}

module "ui" {
  source       = "s3::https://s3.amazonaws.com/all-apps-modules-174309188893/modules/v0.1.0/static-ui.zip"
  slug         = "pennyhunt"
  spa_fallback = false
}

output "url" {
  value = module.ui.url
}

# For `just deploy`: the sync target and the invalidation.
output "bucket_name" {
  value = module.ui.bucket_name
}

output "distribution_id" {
  value = module.ui.distribution_id
}
