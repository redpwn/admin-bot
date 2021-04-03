terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "3.35.0"
    }
  }
}

output "submit_url" {
  value = module.admin_bot.submit_url
}

provider "aws" {
  region = "us-east-1"
}

module "admin_bot" {
  source = "redpwn/admin-bot/aws"
  image  = "345804057348.dkr.ecr.us-east-1.amazonaws.com/redpwn/admin-bot/example@sha256:5dda2e698c8e1930e5e4d1c9922244b697d0a6e47d5138deced1fa1865c700dc"
  recaptcha = {
    site   = "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
    secret = "6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe"
  }
}
