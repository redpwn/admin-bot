const fs = require('fs')
const http = require('http')
const { PubSub } = require('@google-cloud/pubsub')
const getRawBody = require('raw-body')
const mustache = require('mustache')
const got = require('got')
const config = require('./config')

const submitPage = fs.readFileSync(__dirname + '/submit.html').toString()
const pubsub = new PubSub({
  apiEndpoint: process.env.APP_PUBSUB_ENDPOINT,
  projectId: process.env.APP_PUBSUB_PROJECT
})
const topic = pubsub.topic(process.env.APP_PUBSUB_TOPIC)

http.createServer(async (req, res) => {
  const [pathname, query] = req.url.split('?', 2)
  const qs = new URLSearchParams(query)
  const challengeId = pathname.slice(1)
  const challenge = config.challenges.get(challengeId)
  if (!challenge) {
    res.writeHead(404).end()
    return
  }
  if (req.method === 'GET') {
    const page = mustache.render(submitPage, {
      challenge_name: challenge.name,
      recaptcha_site: process.env.APP_RECAPTCHA_SITE,
      msg: qs.get('msg'),
      url: qs.get('url'),
    })
    res.writeHead(200, { 'content-type': 'text/html' }).end(page)
    return
  }
  if (req.method !== 'POST') {
    res.writeHead(405).end()
    return
  }
  let body
  const send = (msg) => {
    res.writeHead(302, {
      'location': `?url=${encodeURIComponent(body.get('url'))}&msg=${encodeURIComponent(msg)}`
    }).end()
    return
  }
  try {
    body = new URLSearchParams(await getRawBody(req, {
      length: req.headers['content-length'],
      limit: '10kb',
      encoding: 'utf8'
    }))
  } catch {
    res.writeHead(413).end()
    return
  }
  const recaptchaRes = await got({
    url: 'https://www.google.com/recaptcha/api/siteverify',
    method: 'POST',
    responseType: 'json',
    form: {
      secret: process.env.APP_RECAPTCHA_SECRET,
      response: body.get('recaptcha_code')
    }
  })
  if (!recaptchaRes.body.success) {
    send('The reCAPTCHA is invalid.')
    return
  }
  const url = body.get('url')
  if (!/^https?:\/\//.test(url)) {
    send('The URL is invalid.')
    return
  }
  await topic.publishJSON({
    challengeId,
    url
  })
  send('The admin will visit your URL.')
}).listen(process.env.PORT ?? 8080, () => {
  console.log('listening')
})
