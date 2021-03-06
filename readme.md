# [redpwn/admin-bot](https://hub.docker.com/r/redpwn/admin-bot)

A scalable service for client-side web CTF challenges

## Quick Start

In [`example`](https://github.com/redpwn/admin-bot/tree/master/example), run:

```sh
gcloud auth application-default login
terraform init
terraform apply --var "project=$(gcloud config get-value project)"
```

## Deployment

* Create a [`config.js` file](#challenge-configuration)
* Make a [`Dockerfile`](https://github.com/redpwn/admin-bot/blob/master/example/Dockerfile)
* Build and push the image to [`gcr.io`](https://cloud.google.com/container-registry) or [`docker.pkg.dev`](https://cloud.google.com/artifact-registry).

## Challenge Configuration

The [`config.js` file](https://github.com/redpwn/admin-bot/blob/master/example/config.js) must export a `Map` called `challenges`.

The key of each entry is its challenge ID. To submit a URL to the admin bot, visit `/<challenge id>`.

The value of each entry is an object with properties:

* `name`: the display name of the challenge
* `timeout`: the timeout in milliseconds for each admin bot visit
* `handler`: a function which returns a `Promise` and accepts the submitted URL with a [Puppeteer `BrowserContext`](https://pptr.dev/#?show=api-class-browsercontext)

## Terraform Configuration

See [registry.terraform.io/modules/redpwn/admin-bot/google/latest](https://registry.terraform.io/modules/redpwn/admin-bot/google/latest).

Example configuration: [`example/main.tf`](https://github.com/redpwn/admin-bot/blob/master/example/main.tf).
