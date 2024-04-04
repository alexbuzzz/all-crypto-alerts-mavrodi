require('dotenv').config()
const { Telegraf } = require('telegraf')
const store = require('../../store')
const removeOldPokupantItems = require('./removeOldPokupantItems')
const detectPokupant = require('./detectPokupant')

const bot = new Telegraf(process.env.BOT_TOKEN)

let alertInterval = null

const formatNumber = (number) => {
  if (number >= 1e9) {
    const formattedNumber = number / 1e9
    return formattedNumber % 1 === 0 ? formattedNumber.toFixed(0) + 'B' : formattedNumber.toFixed(1) + 'B'
  } else if (number >= 1e6) {
    const formattedNumber = number / 1e6
    return formattedNumber % 1 === 0 ? formattedNumber.toFixed(0) + 'M' : formattedNumber.toFixed(1) + 'M'
  } else if (number >= 1e3) {
    const formattedNumber = number / 1e3
    return formattedNumber % 1 === 0 ? formattedNumber.toFixed(0) + 'K' : formattedNumber.toFixed(1) + 'K'
  } else {
    return number.toFixed(0)
  }
}

const sendMessage = async (symbol, exchange, market, side, vol) => {
  let exchangeFormated = ''

  switch (exchange) {
    case 'binance':
      exchangeFormated = '🟡 Binance'
      break
    case 'bybit':
      exchangeFormated = '🟠 Bybit'
      break
    case 'okx':
      exchangeFormated = '⚪️ OKX'
      break
    case 'mexc':
      exchangeFormated = '🔵 MEXC'
      break
    case 'blofin':
      exchangeFormated = '🟢 BLOFIN'
      break
    case 'gate':
      exchangeFormated = '🟣 GATE'
      break
  }

  const messageText = `<strong>POKUPANT!</strong>\n${exchangeFormated} <code>${
    exchange === 'gate' ? symbol.replace('-SWAP', '').replace('-', '').replace('_', '').replace('USDT', '/USDT') : symbol.replace('-SWAP', '').replace('-', '').replace('_', '')
  }</code>\n\n ${market.toUpperCase()} ${side.toUpperCase()} ${formatNumber(vol)}`

  const users = Object.keys(store.users)

  users.forEach(async (userId) => {
    try {
      await bot.telegram.sendMessage(userId, messageText, {
        parse_mode: 'HTML',
      })
    } catch (error) {
      if (error.response && error.response.error_code === 403) {
        // console.error(`User has blocked the bot for chat_id: ${userId}`)
      } else {
        console.error('Error sending message:', error)
      }
    }
  })
}

const start = () => {
  alertInterval = setInterval(() => {
    const res = detectPokupant(store.pokupantData, process.env.POKUPANT_TOLERANCE_PERC, process.env.POKUPANT_MIN_TRADES_COUNT)
    if (res !== null) {
      sendMessage(res.symbol, res.exchange, res.market, res.side, res.vol)
    }

    removeOldPokupantItems(store.pokupantData)
  }, process.env.CALC_INTERVAL_SECONDS_TELEGRAM * 1000)
}

const stop = () => {
  clearInterval(alertInterval)
}

module.exports = { start, stop }
