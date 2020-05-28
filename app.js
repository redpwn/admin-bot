require('dotenv/config')
const fs = require('fs')
const http = require('http')
const getRawBody = require('raw-body')
const mustache = require('mustache')
const got = require('got')
const getChallenges = require('./challenges')

;(async () => {
  const recaptchaSite = process.env.APP_RECAPTCHA_SITE
  const recaptchaSecret = process.env.APP_RECAPTCHA_SECRET
  const port = parseInt(process.env.PORT)

  const timeout = time => new Promise((_, reject) => setTimeout(reject, time))
  const uri = (parts, ...rest) => parts
    .map((part, i) => part + encodeURIComponent(i < parts.length - 1 ? rest[i] : ''))
    .join('')

  const submitPage = (await fs.promises.readFile('submit.html')).toString()
  const challenges = await getChallenges()

  http.createServer(async (req, res) => {
    const [pathname, query] = req.url.split('?', 2)
    if (pathname === '/submit' && req.method === 'GET') {
      const qs = new URLSearchParams(query)
      const challId = qs.get('challenge')
      const chall = challenges.get(challId)
      if (chall === undefined) {
        res.writeHead(404).end()
        return
      }

      const page = mustache.render(submitPage, {
        message: qs.get('message'),
        url: qs.get('url'),
        challenge_name: chall.name,
        challenge_id: challId,
        recaptcha_site: recaptchaSite
      })
      res.writeHead(200, { 'content-type': 'text/html' }).end(page)
    } else if (pathname === '/submit' && req.method === 'POST') {
      let rawBody
      try {
        rawBody = await getRawBody(req, {
          length: req.headers['content-length'],
          limit: '10kb',
          encoding: true
        })
      } catch (e) {
        res.writeHead(400).end()
        return
      }

      const body = new URLSearchParams(rawBody)
      const recaptchaCode = body.get('g-recaptcha-response')
      const url = body.get('url')
      const challId = body.get('challenge')

      const recaptchaRes = await got({
        url: 'https://www.google.com/recaptcha/api/siteverify',
        method: 'POST',
        responseType: 'json',
        form: {
          secret: recaptchaSecret,
          response: recaptchaCode
        }
      })
      if (!recaptchaRes.body.success) {
        res.writeHead(302, {
          location: uri `/submit?challenge=${challId}&url=${url}&message=${'The recaptcha is invalid.'}`
        }).end()
        return
      }

      const chall = challenges.get(challId)
      if (!url || !chall) {
        res.writeHead(400).end()
        return
      }

      try {
        await Promise.race([chall.handler(url), timeout(15000)])
      } catch (e) {
        res.writeHead(302, {
          location: uri`/submit?challenge=${challId}&url=${url}&message=${'An error occurred while visiting the URL.'}`
        }).end()
        return
      }

      res.writeHead(302, {
        location: uri`/submit?challenge=${challId}&url=${url}&message=${'The admin has visited the URL!'}`
      }).end()
    } else {
      res.writeHead(404).end()
    }
  }).listen(port, () => console.log('listening'))
})()
