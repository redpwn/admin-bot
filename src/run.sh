#!/bin/sh

set -eu

if [ "$APP_SERVICE" = visit ]; then
  exec node --unhandled-rejections=strict visit.js
elif [ "$APP_SERVICE" = submit ]; then
  exec node --unhandled-rejections=strict submit.js
else
  exit 1
fi
