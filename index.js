const mineflayer = require('mineflayer')
const http = require('http')

// Dummy HTTP server biar Koyeb gak restart
http.createServer((req, res) => {
  res.writeHead(200)
  res.end("Iprime Bot Rotation Running")
}).listen(8000)

const host = process.env.MC_HOST
const port = process.env.MC_PORT || 25565
const version = '1.21.4'

const botNames = [
  'IprimeBotA',
  'IprimeBotB',
  'IprimeBotC',
  'IprimeBotD',
  'IprimeBotE'
]

const ROTATE_TIME = 3 * 60 * 60 * 1000
const PREPARE_TIME = 10 * 60 * 1000

let activeBot = null
let currentIndex = 0

function randomDelay() {
  return (5 + Math.random()) * 60 * 1000 // 5–6 menit
}

function antiAFK(bot) {
  setInterval(() => {
    const actions = ['forward', 'back', 'left', 'right']
    const action = actions[Math.floor(Math.random() * actions.length)]

    bot.setControlState(action, true)

    setTimeout(() => {
      bot.setControlState(action, false)
    }, Math.random() * 1000 + 500)

    if (Math.random() > 0.6) {
      bot.setControlState('jump', true)
      setTimeout(() => bot.setControlState('jump', false), 300)
    }

    if (bot.entity) {
      bot.look(
        bot.entity.yaw + (Math.random() - 0.5),
        bot.entity.pitch + (Math.random() - 0.5),
        true
      )
    }

  }, 4000)
}

function createBot(name, callback) {
  console.log(`🚀 Connecting as ${name} to ${host}:${port}`)

  const bot = mineflayer.createBot({
    host,
    port,
    username: name,
    version
  })

  let spawned = false

  bot.once('spawn', () => {
    console.log(`✅ ${name} connected`)
    spawned = true
    antiAFK(bot)
    callback(true, bot)
  })

  bot.once('error', (err) => {
    console.log(`⚠️ ${name} error:`, err.message)
    callback(false, null)
  })

  bot.once('end', () => {
    if (!spawned) callback(false, null)
  })

  bot.on('kicked', (reason) => {
    console.log(`🚪 ${name} kicked:`, reason)
  })
}

function startRotation() {
  createBot(botNames[currentIndex], (ok, bot) => {
    if (!ok) {
      console.log('Bot pertama gagal login.')
      return
    }

    activeBot = bot
    scheduleNext()
  })
}

function scheduleNext() {
  setTimeout(() => {

    const nextIndex = (currentIndex + 1) % botNames.length
    const nextName = botNames[nextIndex]

    console.log(`⏳ Preparing ${nextName}...`)

    const delay = randomDelay()
    console.log(`🕒 Random login delay ${(delay / 60000).toFixed(2)} menit`)

    setTimeout(() => {

      createBot(nextName, (ok, newBot) => {
        if (ok) {
          console.log(`🔥 ${nextName} active. Closing ${botNames[currentIndex]}`)

          if (activeBot) activeBot.quit()

          activeBot = newBot
          currentIndex = nextIndex
        } else {
          console.log('⚠️ New bot failed. Old bot stays online.')
        }

        scheduleNext()

      })

    }, delay)

  }, ROTATE_TIME - PREPARE_TIME)
}

startRotation()
