# [redpwn/admin-bot](https://hub.docker.com/r/redpwn/admin-bot)

A scalable service for client-side web CTF challenges

## Quick Start

In [`example`](https://github.com/redpwn/admin-bot/tree/master/example), run:

```sh
gcloud auth application-default login
terraform init
terraform apply --var "project=$(gcloud config get-value project)"
```

After applying, Terraform outputs a `submit_url`. To submit a URL to the admin bot, visit `<submit_url>/one`.

## Deployment

* Create a [`config.js` file](#challenge-configuration).
* Make a [`Dockerfile`](https://github.com/redpwn/admin-bot/blob/master/example/Dockerfile).
* Build and push the image to [`gcr.io`](https://cloud.google.com/container-registry) or [`pkg.dev`](https://cloud.google.com/artifact-registry).
* Use the [Terraform module](https://registry.terraform.io/modules/redpwn/admin-bot/google/latest) to deploy to Cloud Run.

## Challenge Configuration

The [`config.js` file](https://github.com/redpwn/admin-bot/blob/master/example/config.js) must export a `Map` named `challenges`.

The key of each entry is its challenge ID. To submit a URL to the admin bot, visit `/<challenge id>`.

The value of each entry is an object with properties:

* `name`: the display name of the challenge
* `timeout`: the timeout in milliseconds for each admin bot visit
* `handler`: a function which returns a `Promise` and accepts the submitted URL and a [Puppeteer `BrowserContext`](https://pptr.dev/#?show=api-class-browsercontext)

## Terraform Configuration

See [registry.terraform.io/modules/redpwn/admin-bot/google/latest](https://registry.terraform.io/modules/redpwn/admin-bot/google/latest).

Example configuration: [`example/main.tf`](https://github.com/redpwn/admin-bot/blob/master/example/main.tf).
