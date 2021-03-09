terraform {
  required_providers {
    google = {
      source = "hashicorp/google"
      version = "3.58.0"
    }
  }
}

variable "project" {}
variable "region" {
  default = "us-east1"
}
variable "image" {
  default = "us-east1-docker.pkg.dev/redpwn/admin-bot/example"
}
variable "recaptcha" {
  default = {
    site = "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
    secret = "6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe"
  }
}
output "submit_url" {
  value = module.admin-bot.submit_url
}

provider "google" {
  project = var.project
  region = var.region
}

module "admin-bot" {
  source = "redpwn/admin-bot/google"
  image = var.image
  recaptcha = var.recaptcha
}
