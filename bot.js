const Telegraf = require('telegraf')
const got = require('got')

const bot = new Telegraf(process.env.BOT_TOKEN)

bot.use(async (ctx, next) => {
  ctx.ms = new Date()
  next()
})

bot.use(async (ctx, next) => {
  await next(ctx)

  const ms = new Date() - ctx.ms

  console.log('Response time %sms', ms)
})

bot.start(async (ctx, next) => {
  ctx.replyWithHTML('Привет, я дополню твою историю. Нужно лишь написать её начало из нескольких предложений. Чем четче будет сформулировано начало, тем лучше будет результат.\n\n<b>GitHub бота:</b> github.com/LyoSU/history-ai-bot\n\nБот это лишь "обертка" для взаимодействия с API. Авторство принадлежит оригинальному автору проекта и все благодарности необходимо отправлять ему.\n\nGitHub проекта: github.com/mgrankin/ru_transformers\nВеб-версия проекта: text.skynet.center\n\n<b>Блог разработчика:</b> @LyBlog')
})

bot.use(async (ctx, next) => {
  const extend = got.extend({
    responseType: 'json',
    timeout: 10000,
    throwHttpErrors: false
  })

  if (ctx.message.text) {
    ctx.replyWithChatAction('typing')
    const text = ctx.message.text

    const mediumResult = await extend.post('https://models.dobro.ai/gpt2/medium/', {
      json: {
        prompt: text,
        length: 60,
        num_samples: 1
      }
    })

    if (mediumResult.body && mediumResult.body.replies && mediumResult.body.replies.length > 0) {
      const result = `<i>${text}</i>${mediumResult.body.replies[0]}`

      ctx.replyWithHTML(result, {
        reply_to_message_id: ctx.message.message_id
      })
    }
  }
})

bot.catch((err, ctx) => {
  console.log(`Ooops, ecountered an error for ${ctx.updateType}`, err)
})

bot.launch().then(() => {
  console.log('bot start polling')
})
