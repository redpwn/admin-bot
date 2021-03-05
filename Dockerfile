FROM node:14.16.0-buster-slim

WORKDIR /app
RUN apt-get update && apt-get install -y \
  libglib2.0-0 libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 \
  libxkbcommon0 libxcomposite1 libxdamage1 libxrandr2 libgbm1 libgtk-3-0 \
  libasound2 libxshmfence1 libx11-xcb1 --no-install-recommends && \
  rm -rf /var/lib/apt/lists/*
COPY package.json yarn.lock ./
ENV NODE_ENV production
RUN yarn --frozen-lockfile
COPY src .
USER node
CMD ["/app/run.sh"]
