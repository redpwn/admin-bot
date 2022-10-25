# syntax=docker/dockerfile:1.4.3

FROM node:18.9.0-buster-slim AS build
WORKDIR /app
RUN apt-get update && apt-get install -y \
  g++ make cmake unzip libcurl4-openssl-dev autoconf libtool python3 curl
COPY package.json package-lock.json ./
RUN npm ci

FROM node:18.9.0-buster-slim
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends \
  libglib2.0-0 libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 \
  libxkbcommon0 libxcomposite1 libxdamage1 libxrandr2 libgbm1 libgtk-3-0 \
  libasound2 libxshmfence1 libx11-xcb1 && rm -rf /var/lib/apt/lists/*
COPY --link --from=build app/node_modules node_modules
COPY --link --from=build root/.cache/puppeteer /home/node/.cache/puppeteer
COPY --link src .
USER node
ENTRYPOINT ["node", "--unhandled-rejections=strict"]
