# Admin Bot
A scalable service for client-side CTF challenges

## Deployment
This project is deployed with Google App Engine.

* Copy `env.yaml.example` to `env.yaml` and place recaptcha credentials inside.
* Copy `challenges.js.example` to `challenges.js` and place handlers for each challenge inside.
* Run `gcloud app deploy` to deploy the app to Google App Engine.
