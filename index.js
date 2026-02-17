const mineflayer = require('mineflayer')
const http = require('http')

// HTTP dummy server supaya Koyeb Web Service tidak restart
http.createServer((req, res) => {
  res.writeHead(200)
  res.end("Bot is running")
}).listen(8000)

const host = process.env.MC_HOST
const port = process.env.MC_PORT || 25565
const username = process.env.MC_USER || 'BotUptime'
const version = '1.21.4' // FIX sesuai server kamu

function createBot() {
  console.log("Connecting to:", host, port)

  const bot = mineflayer.createBot({
    host: host,
    port: port,
    username: username,
    version: version
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

      // Random jump kadang-kadang
      if (Math.random() > 0.7) {
        bot.setControlState('jump', true)
        setTimeout(() => bot.setControlState('jump', false), 300)
      }

      // Random look biar natural
      if (bot.entity) {
        bot.look(
          bot.entity.yaw + (Math.random() - 0.5),
          bot.entity.pitch + (Math.random() - 0.5),
          true
        )
      }

    }, 4000)
  })

  bot.on('kicked', (reason) => {
    console.log('🚪 KICKED:', reason)
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
