#!/bin/sh

APP_PUBSUB_ENDPOINT=http://localhost:8085 \
APP_PUBSUB_PROJECT=ctf \
APP_PUBSUB_TOPIC=admin-bot \
APP_RECAPTCHA_SITE=6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI \
APP_RECAPTCHA_SECRET=6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe \
concurrently \
"nodemon -L src/submit.js" \
"nodemon -L src/visit.js" \
"gcloud beta emulators pubsub start --project ctf" \
"node src/subscribe.js"
