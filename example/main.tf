terraform {
  required_providers {
    google = {
      source = "hashicorp/google"
      version = "3.58.0"
    }
  }
}

variable "project" {
  type = string
}
variable "region" {
  type = string
}
variable "image" {
  type = string
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
  recaptcha = {
    site = "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
    secret = "6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe"
  }
}
