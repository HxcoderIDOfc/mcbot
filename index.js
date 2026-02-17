const mineflayer = require('mineflayer')

const host = process.env.MC_HOST
const port = process.env.MC_PORT || 25565
const username = process.env.MC_USER || 'BotUptime'
const version = process.env.MC_VERSION || false

function createBot() {
  const bot = mineflayer.createBot({
    host,
    port,
    username,
    version
  })
  bot.on('spawn', () => {
    console.log('✅ Bot connected!')

    setInterval(() => {
      const actions = ['forward', 'back', 'left', 'right']
      const randomAction = actions[Math.floor(Math.random() * actions.length)]

      bot.setControlState(randomAction, true)

      setTimeout(() => {
        bot.setControlState(randomAction, false)
      }, Math.random() * 1000 + 500)

      // Random jump
      if (Math.random() > 0.7) {
        bot.setControlState('jump', true)
        setTimeout(() => bot.setControlState('jump', false), 300)
      }

      // Random look
      bot.look(
        bot.entity.yaw + (Math.random() - 0.5),
        bot.entity.pitch + (Math.random() - 0.5),
        true
      )

    }, 4000)
  })

  bot.on('end', () => {
    console.log('❌ Disconnected. Reconnecting in 5s...')
    setTimeout(createBot, 5000)
  })

  bot.on('error', (err) => {
    console.log('⚠️ Error:', err.message)
  })
}

createBot()
