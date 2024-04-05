require('dotenv').config()
const { Telegraf } = require('telegraf')
const store = require('../../store')
const removeOldPokupantItems = require('./removeOldPokupantItems')
const detectPokupant = require('./detectPokupant')

const bot = new Telegraf(process.env.BOT_TOKEN)

let alertInterval = null

const capitalizeFirstLetter = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

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

const sendMessage = async (userId, symbol, exchange, market, side, vol) => {
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
}

const start = () => {
  alertInterval = setInterval(() => {
    const currentTime = Math.floor(Date.now() / 1000)
    const res = detectPokupant(store.pokupantData, process.env.POKUPANT_TOLERANCE_PERC, process.env.POKUPANT_MIN_TRADES_COUNT)

    const users = Object.keys(store.users)

    users.forEach(async (userId) => {
      if (
        res !== null &&
        res &&
        res.exchange &&
        res.market &&
        res.side &&
        res.symbol &&
        res.vol &&
        store.users?.[userId]?.[res.exchange]?.[`pokupant${capitalizeFirstLetter(res.market)}${capitalizeFirstLetter(res.side)}`] &&
        (!store.lastAlertTimesPokupant?.[userId]?.[res.exchange]?.[res.symbol]?.[res.market]?.[res.side] ||
          currentTime - store.lastAlertTimesPokupant?.[userId]?.[res.exchange]?.[res.symbol]?.[res.market]?.[res.side] >= process.env.POKUPANT_ALERT_SUSPEND_SEC)
      ) {
        // Check and initialize if needed
        if (!store.lastAlertTimesPokupant[userId]) {
          store.lastAlertTimesPokupant[userId] = {}
        }

        // Check and initialize exchange if needed
        if (!store.lastAlertTimesPokupant[userId][res.exchange]) {
          store.lastAlertTimesPokupant[userId][res.exchange] = {}
        }

        // Check and initialize symbol if needed
        if (!store.lastAlertTimesPokupant[userId][res.exchange][res.symbol]) {
          store.lastAlertTimesPokupant[userId][res.exchange][res.symbol] = {}
        }

        // Check and initialize market if needed
        if (!store.lastAlertTimesPokupant[userId][res.exchange][res.symbol][res.market]) {
          store.lastAlertTimesPokupant[userId][res.exchange][res.symbol][res.market] = {}
        }

        // Check and initialize side if needed
        if (!store.lastAlertTimesPokupant[userId][res.exchange][res.symbol][res.market][res.side]) {
          store.lastAlertTimesPokupant[userId][res.exchange][res.symbol][res.market][res.side] = {}
        }

        // Custom filter
        const customFilter = () => {
          if (store.pokupantCustomFilters[userId] && store.pokupantCustomFilters[userId][res.exchange] && store.pokupantCustomFilters[userId][res.exchange][res.market]) {
            if (store.pokupantCustomFilters[userId][res.exchange][res.market].hasOwnProperty(res.symbol.replace('USDT', '').replace('-SWAP', '').replace('-', '').replace('_', ''))) {
              return store.pokupantCustomFilters[userId][res.exchange][res.market][res.symbol.replace('USDT', '').replace('-SWAP', '').replace('-', '').replace('_', '')]
            } else {
              if (store.pokupantCustomFilters[userId][res.exchange][res.market].all) {
                return store.pokupantCustomFilters[userId][res.exchange][res.market].all
              } else {
                return process.env.POKUPANT_DEFAULT_TRADES_FILTER
              }
            }
          } else {
            return process.env.POKUPANT_DEFAULT_TRADES_FILTER
          }
        }

        if (res.vol >= customFilter() * 1000) {
          sendMessage(userId, res.symbol, res.exchange, res.market, res.side, res.vol)
          store.lastAlertTimesPokupant[userId][res.exchange][res.symbol][res.market][res.side] = currentTime
        }
      }
    })

    removeOldPokupantItems(store.pokupantData)
  }, process.env.CALC_INTERVAL_SECONDS_TELEGRAM * 1000)
}

const stop = () => {
  clearInterval(alertInterval)
}

module.exports = { start, stop }
