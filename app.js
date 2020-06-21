const fs = require('fs')
const http = require('http')
const getRawBody = require('raw-body')
const mustache = require('mustache')
const got = require('got')
const puppeteer = require('puppeteer')
const { challenges, recaptchaSite, recaptchaSecret } = require('./config')

;(async () => {
  const port = parseInt(process.env.PORT) || 3000

  const timeout = time => new Promise((_, reject) => setTimeout(reject, time))
  const uri = (parts, ...rest) => parts
    .map((part, i) => part + (i < parts.length - 1 ? encodeURIComponent(rest[i]) : ''))
    .join('')

  const submitPage = (await fs.promises.readFile('submit.html')).toString()
  const browser = await puppeteer.launch({ env: {} })

  browser.on('targetcreated', async (target) => {
    try {
      const page = await target.page()
      if (page === null) {
        return
      }
      const ctx = await target.browserContext()
      if (!ctx.isIncognito()) {
        await page.close()
      }
    } catch {}
  })

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

      const sendMsg = (msg) => {
        res.writeHead(302, {
          location: uri`/submit?challenge=${challId}&url=${url}&message=${msg}`
        })
        res.end()
      }

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
        sendMsg('The recaptcha is invalid.')
        return
      }

      const chall = challenges.get(challId)
      if (!url || !chall) {
        res.writeHead(400).end()
        return
      }

      let ctx
      try {
        ctx = await browser.createIncognitoBrowserContext()
        await Promise.race([chall.handler(url, ctx), timeout(chall.timeout)])
      } catch {
        sendMsg('An error occurred while visiting your URL.')
        return
      } finally {
        try {
          await ctx.close()
        } catch {}
      }

      sendMsg('The admin has visited your URL.')
    } else {
      res.writeHead(404).end()
    }
  }).listen(port, () => console.log('listening on port', port))
})()
