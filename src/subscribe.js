const { PubSub } = require('@google-cloud/pubsub')

;(async () => {
  const pubsub = new PubSub({
    apiEndpoint: process.env.APP_PUBSUB_ENDPOINT,
    projectId: process.env.APP_PUBSUB_PROJECT
  })
  const topic = pubsub.topic(process.env.APP_PUBSUB_TOPIC)
  const [topicExists] = await topic.exists()
  if (!topicExists) {
    await topic.create()
  }
  await topic.createSubscription('admin-bot-visit', {
    pushEndpoint: 'http://localhost:8081'
  })
})()
