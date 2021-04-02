const puppeteer = require('puppeteer')
const config = require('./config')
const server = require('./server')

const sleep = time => new Promise(resolve => setTimeout(resolve, time))

const browser = puppeteer.launch({
  pipe: true,
  dumpio: true,
  args: server.runtime === 'aws' ? ['--no-sandbox'] : []
})

server.run({ subscribe: true }, async ({ message }) => {
  const { challengeId, url, args } = message
  const challenge = config.challenges.get(challengeId)

  let ctx
  try {
    ctx = await (await browser).createIncognitoBrowserContext()
    await Promise.race([
      challenge.handler(url, ctx),
      sleep(challenge.timeout)
    ])
  } catch (e) {
    console.error(e)
  }
  try {
    await ctx.close()
  } catch {}
})
