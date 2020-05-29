# Admin Bot
A scalable service for client-side CTF challenges

## Deployment
This project is deployed with Google App Engine.

* Copy `config.js.example` to `config.js`
* Place recaptcha credentials and handlers for each challenge in `config.js`.
* Run `gcloud app deploy`.
* Visit `https://project-id.appspot.com/submit?challenge=challenge-id`
