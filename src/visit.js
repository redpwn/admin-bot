const http = require('http')
const getRawBody = require('raw-body')
const puppeteer = require('puppeteer')
const config = require('./config')

const browser = puppeteer.launch({
  pipe: true,
  dumpio: true
})

const sleep = time => new Promise(resolve => setTimeout(resolve, time))

http.createServer(async (req, res) => {
  if (req.method !== 'POST') {
    res.writeHead(405).end()
    return
  }
  try {
    body = JSON.parse(await getRawBody(req, {
      length: req.headers['content-length'],
      limit: '20kb',
      encoding: 'utf8'
    }))
  } catch {
    res.writeHead(413).end()
    return
  }
  const message = Buffer.from(body.message.data, 'base64').toString()
  const { challengeId, url } = JSON.parse(message)
  const challenge = config.challenges.get(challengeId)

  let ctx
  try {
    ctx = await (await browser).createIncognitoBrowserContext()
    await Promise.race([challenge.handler(url, ctx), sleep(challenge.timeout)])
  } catch (e) {
    console.error(e)
  }
  try {
    await ctx.close()
  } catch {}

  res.writeHead(204).end()
}).listen(process.env.PORT ?? 8081, () => {
  console.log('listening')
})
