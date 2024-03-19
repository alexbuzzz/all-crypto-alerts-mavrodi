require('dotenv').config()
const { Telegraf } = require('telegraf')
const store = require('../../store')
const calcOI = require('./calcOI')
const calcVolumeBoost = require('./calcVolumeBoost')
const calcPrice = require('./calcPrice')

const bot = new Telegraf(process.env.BOT_TOKEN)

let alertInterval = null

const formatNumber = (number) => {
  if (number >= 1e9) {
    const formattedNumber = number / 1e9
    return formattedNumber % 1 === 0 ? formattedNumber.toFixed(0) + 'T' : formattedNumber.toFixed(1) + 'T'
  } else if (number >= 1e6) {
    const formattedNumber = number / 1e6
    return formattedNumber % 1 === 0 ? formattedNumber.toFixed(0) + 'B' : formattedNumber.toFixed(1) + 'B'
  } else if (number >= 1e3) {
    const formattedNumber = number / 1e3
    return formattedNumber % 1 === 0 ? formattedNumber.toFixed(0) + 'M' : formattedNumber.toFixed(1) + 'M'
  } else {
    return number.toFixed(0) + 'K'
  }
}

const sendMessage = async (userId, symbol, alertType, headerVal, headerPeriod, exchange, oiVal, volBoostVal, volVal, priceVal) => {
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
  }

  const messageText = `<strong>${alertType}</strong> (${headerVal} / ${headerPeriod})\n${exchangeFormated} <code>${symbol.replace('-SWAP', '').replace('-', '').replace('_', '')}</code>\n${
    oiVal >= process.env.OI_HIGHTLIGHT ? '🔥' : '➖'
  } OI ${oiVal}%\n${volBoostVal >= process.env.VOLUME_BOOST_HIGHTLIGHT ? '🔥' : '➖'} Vol Boost ${volBoostVal}x\n${volVal >= process.env.VOL_IN_CURRENCY_HIGHTLIGHT ? '🔥' : '➖'} Vol ${formatNumber(
    volVal
  )} ($)\n${priceVal >= process.env.PRICE_CHANGE_HIGHTLIGHT ? '🔥' : '➖'} Price ${priceVal}%`

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

const fireAlert = (exchange) => {
  const symbols = Object.keys(store.currentData[exchange])
  const currentTime = Date.now()

  symbols.forEach((symbol) => {
    const resOI_1min = calcOI(exchange, symbol, 1)
    const resOI_5min = calcOI(exchange, symbol, 5)
    const resVolBoost_100min = calcVolumeBoost(exchange, symbol, 100)
    const resVolBoost_20min = calcVolumeBoost(exchange, symbol, 20)
    const resVolBoost_3min = calcVolumeBoost(exchange, symbol, 3)
    const resVolBoost_1min = calcVolumeBoost(exchange, symbol, 1)
    const resPrice = calcPrice(exchange, symbol)
    let candleVol =
      store.marketData[exchange] && store.marketData[exchange][symbol] && store.marketData[exchange][symbol].currentData && store.marketData[exchange][symbol].currentData.volInCurr
        ? store.marketData[exchange][symbol].currentData.volInCurr
        : 0

    const users = Object.keys(store.users)

    users.forEach((userId) => {
      // Check and initialize if needed
      if (!store.lastAlertTimes[userId]) {
        store.lastAlertTimes[userId] = {}
      }

      // Check and initialize exchange if needed
      if (!store.lastAlertTimes[userId][exchange]) {
        store.lastAlertTimes[userId][exchange] = {}
      }

      // Check and initialize symbol if needed
      if (!store.lastAlertTimes[userId][exchange][symbol]) {
        store.lastAlertTimes[userId][exchange][symbol] = {}
      }

      // Custom filter
      const customFilter = (alertType) => {
        if (store.customFilters[userId] && store.customFilters[userId][exchange] && store.customFilters[userId][exchange][alertType]) {
          if (store.customFilters[userId][exchange][alertType].hasOwnProperty(symbol.replace('USDT', '').replace('-SWAP', '').replace('-', '').replace('_', ''))) {
            return store.customFilters[userId][exchange][alertType][symbol.replace('USDT', '').replace('-SWAP', '').replace('-', '').replace('_', '')]
          } else {
            if (store.customFilters[userId][exchange][alertType].all) {
              return store.customFilters[userId][exchange][alertType].all
            } else {
              return process.env.DEFAULT_TELEGRAM_VOL_FILTER
            }
          }
        } else {
          return process.env.DEFAULT_TELEGRAM_VOL_FILTER
        }
      }

      // OI SETUP 1 =============================================================
      if (
        store.users[userId][exchange].oiSetup1 &&
        candleVol >= customFilter('oi') &&
        (((store.users[userId][exchange].oiDirection == 'LONG' || store.users[userId][exchange].oiDirection == 'BOTH') && resOI_1min >= 1.5) ||
          ((store.users[userId][exchange].oiDirection == 'SHORT' || store.users[userId][exchange].oiDirection == 'BOTH') && resOI_1min <= -1.5)) &&
        (!store.lastAlertTimes[userId][exchange][symbol]['oiSetup1'] || currentTime - store.lastAlertTimes[userId][exchange][symbol]['oiSetup1'] >= process.env.ALERT_SUSPEND_SECONDS_TELEGRAM * 1000)
      ) {
        sendMessage(userId, symbol, 'Open Interest', `${resOI_1min}%`, '1min', exchange, resOI_1min, resVolBoost_100min, candleVol, resPrice)
        store.lastAlertTimes[userId][exchange][symbol]['oiSetup1'] = currentTime
      }

      // OI SETUP 2 =============================================================
      if (
        store.users[userId][exchange].oiSetup2 &&
        candleVol >= customFilter('oi') &&
        (((store.users[userId][exchange].oiDirection == 'LONG' || store.users[userId][exchange].oiDirection == 'BOTH') && resOI_1min >= 3) ||
          ((store.users[userId][exchange].oiDirection == 'SHORT' || store.users[userId][exchange].oiDirection == 'BOTH') && resOI_1min <= -3)) &&
        (!store.lastAlertTimes[userId][exchange][symbol]['oiSetup2'] || currentTime - store.lastAlertTimes[userId][exchange][symbol]['oiSetup2'] >= process.env.ALERT_SUSPEND_SECONDS_TELEGRAM * 1000)
      ) {
        sendMessage(userId, symbol, 'Open Interest', `${resOI_1min}%`, '1min', exchange, resOI_1min, resVolBoost_100min, candleVol, resPrice)
        store.lastAlertTimes[userId][exchange][symbol]['oiSetup2'] = currentTime
      }

      // OI SETUP 3 =============================================================
      if (
        store.users[userId][exchange].oiSetup3 &&
        candleVol >= customFilter('oi') &&
        (((store.users[userId][exchange].oiDirection == 'LONG' || store.users[userId][exchange].oiDirection == 'BOTH') && resOI_5min >= 10) ||
          ((store.users[userId][exchange].oiDirection == 'SHORT' || store.users[userId][exchange].oiDirection == 'BOTH') && resOI_5min <= -10)) &&
        (!store.lastAlertTimes[userId][exchange][symbol]['oiSetup3'] || currentTime - store.lastAlertTimes[userId][exchange][symbol]['oiSetup3'] >= process.env.ALERT_SUSPEND_SECONDS_TELEGRAM * 1000)
      ) {
        sendMessage(userId, symbol, 'Open Interest', `${resOI_5min}%`, '5min', exchange, resOI_5min, resVolBoost_100min, candleVol, resPrice)
        store.lastAlertTimes[userId][exchange][symbol]['oiSetup3'] = currentTime
      }

      // VOL BOOST SETUP 1 ======================================================
      if (
        store.users[userId][exchange].volBoostSetup1 &&
        resVolBoost_3min >= 10 &&
        candleVol >= customFilter('volBoost') &&
        (!store.lastAlertTimes[userId][exchange][symbol]['volBoostSetup1'] ||
          currentTime - store.lastAlertTimes[userId][exchange][symbol]['volBoostSetup1'] >= process.env.ALERT_SUSPEND_SECONDS_TELEGRAM * 1000)
      ) {
        sendMessage(userId, symbol, 'Vol Boost', `${resVolBoost_3min}x`, '3min', exchange, resOI_1min, resVolBoost_3min, candleVol, resPrice)
        store.lastAlertTimes[userId][exchange][symbol]['volBoostSetup1'] = currentTime
      }

      // VOL BOOST SETUP 2 ======================================================
      if (
        store.users[userId][exchange].volBoostSetup2 &&
        resVolBoost_100min >= 12 &&
        candleVol >= customFilter('volBoost') &&
        (!store.lastAlertTimes[userId][exchange][symbol]['volBoostSetup2'] ||
          currentTime - store.lastAlertTimes[userId][exchange][symbol]['volBoostSetup2'] >= process.env.ALERT_SUSPEND_SECONDS_TELEGRAM * 1000)
      ) {
        sendMessage(userId, symbol, 'Vol Boost', `${resVolBoost_100min}x`, '100min', exchange, resOI_1min, resVolBoost_100min, candleVol, resPrice)
        store.lastAlertTimes[userId][exchange][symbol]['volBoostSetup2'] = currentTime
      }

      // VOL BOOST SETUP 3 ======================================================
      if (
        store.users[userId][exchange].volBoostSetup3 &&
        resVolBoost_100min >= 20 &&
        candleVol >= customFilter('volBoost') &&
        (!store.lastAlertTimes[userId][exchange][symbol]['volBoostSetup3'] ||
          currentTime - store.lastAlertTimes[userId][exchange][symbol]['volBoostSetup3'] >= process.env.ALERT_SUSPEND_SECONDS_TELEGRAM * 1000)
      ) {
        sendMessage(userId, symbol, 'Vol Boost', `${resVolBoost_100min}x`, '100min', exchange, resOI_1min, resVolBoost_100min, candleVol, resPrice)
        store.lastAlertTimes[userId][exchange][symbol]['volBoostSetup3'] = currentTime
      }

      // VOL BOOST SETUP 4 ======================================================
      if (
        store.users[userId][exchange].volBoostSetup4 &&
        resVolBoost_20min >= 20 &&
        candleVol >= customFilter('volBoost') &&
        (!store.lastAlertTimes[userId][exchange][symbol]['volBoostSetup4'] ||
          currentTime - store.lastAlertTimes[userId][exchange][symbol]['volBoostSetup4'] >= process.env.ALERT_SUSPEND_SECONDS_TELEGRAM * 1000)
      ) {
        sendMessage(userId, symbol, 'Vol Boost', `${resVolBoost_20min}x`, '20min', exchange, resOI_1min, resVolBoost_20min, candleVol, resPrice)
        store.lastAlertTimes[userId][exchange][symbol]['volBoostSetup4'] = currentTime
      }

      // VOL BOOST SETUP 5 ======================================================
      if (
        store.users[userId][exchange].volBoostSetup5 &&
        resVolBoost_1min >= 1 &&
        candleVol >= customFilter('volBoost') &&
        (!store.lastAlertTimes[userId][exchange][symbol]['volBoostSetup5'] ||
          currentTime - store.lastAlertTimes[userId][exchange][symbol]['volBoostSetup5'] >= process.env.ALERT_SUSPEND_SECONDS_TELEGRAM * 1000)
      ) {
        sendMessage(userId, symbol, 'Vol Boost', `${resVolBoost_1min}x`, '1min', exchange, resOI_1min, resVolBoost_1min, candleVol, resPrice)
        store.lastAlertTimes[userId][exchange][symbol]['volBoostSetup5'] = currentTime
      }
    })
  })

  const users = Object.keys(store.users)

  users.forEach(async (userId) => {
    // BTC SPOT DOM SETUP 1 ===================================================
    if (
      exchange == 'binance' &&
      store.users[userId][exchange].btcSpotDomSetup1 &&
      (!store.lastAlertTimes[userId][exchange]['btcSpotDomSetup1'] || currentTime - store.lastAlertTimes[userId][exchange]['btcSpotDomSetup1'] >= process.env.ALERT_SUSPEND_SECONDS_TELEGRAM * 500)
    ) {
      const condition = store.orderBookData.binance.some((item) => parseFloat(item[1]) >= 10)

      if (condition) {
        store.lastAlertTimes[userId][exchange]['btcSpotDomSetup1'] = currentTime

        const messageText = store.orderBookData.binance
          .filter((item) => parseFloat(item[1]) >= 10)
          .map((item) => `${parseFloat(item[0]).toFixed(0)} ➖ ${parseFloat(item[1]).toFixed(0)} BTC`)
          .join('\n')

        try {
          // Attempt to send the message 10 times with a delay of 500 ms between each attempt
          for (let i = 0; i < 10; i++) {
            await new Promise((resolve) => setTimeout(resolve, 500)) // Delay of 500 ms

            await bot.telegram.sendMessage(userId, `‼️ БІТООООК\n\n${messageText}`, {
              parse_mode: 'HTML',
            })
          }
        } catch (error) {
          if (error.response && error.response.error_code === 403) {
            // console.error(`User has blocked the bot for chat_id: ${userId}`);
          } else {
            console.error('Error sending message:', error)
          }
        }
      }
    }

    // BTC SPOT DOM SETUP 2 ===================================================
    if (
      exchange == 'binance' &&
      store.users[userId][exchange].btcSpotDomSetup2 &&
      (!store.lastAlertTimes[userId][exchange]['btcSpotDomSetup2'] || currentTime - store.lastAlertTimes[userId][exchange]['btcSpotDomSetup2'] >= process.env.ALERT_SUSPEND_SECONDS_TELEGRAM * 500)
    ) {
      const condition = store.orderBookData.binance.some((item) => parseFloat(item[1]) >= 70)

      if (condition) {
        store.lastAlertTimes[userId][exchange]['btcSpotDomSetup2'] = currentTime

        const messageText = store.orderBookData.binance
          .filter((item) => parseFloat(item[1]) >= 70)
          .map((item) => `${parseFloat(item[0]).toFixed(0)} ➖ ${parseFloat(item[1]).toFixed(0)} BTC`)
          .join('\n')

        try {
          // Attempt to send the message 10 times with a delay of 500 ms between each attempt
          for (let i = 0; i < 10; i++) {
            await new Promise((resolve) => setTimeout(resolve, 500)) // Delay of 500 ms

            await bot.telegram.sendMessage(userId, `‼️ БІТООООК\n\n${messageText}`, {
              parse_mode: 'HTML',
            })
          }
        } catch (error) {
          if (error.response && error.response.error_code === 403) {
            // console.error(`User has blocked the bot for chat_id: ${userId}`);
          } else {
            console.error('Error sending message:', error)
          }
        }
      }
    }

    // BTC SPOT DOM SETUP 3 ===================================================
    if (
      exchange == 'binance' &&
      store.users[userId][exchange].btcSpotDomSetup3 &&
      (!store.lastAlertTimes[userId][exchange]['btcSpotDomSetup3'] || currentTime - store.lastAlertTimes[userId][exchange]['btcSpotDomSetup3'] >= process.env.ALERT_SUSPEND_SECONDS_TELEGRAM * 1000)
    ) {
      const condition = store.orderBookData.binance.some((item) => parseFloat(item[1]) >= 150)

      if (condition) {
        store.lastAlertTimes[userId][exchange]['btcSpotDomSetup3'] = currentTime

        const messageText = store.orderBookData.binance
          .filter((item) => parseFloat(item[1]) >= 150)
          .map((item) => `${parseFloat(item[0]).toFixed(0)} ➖ ${parseFloat(item[1]).toFixed(0)} BTC`)
          .join('\n')

        try {
          // Attempt to send the message 10 times with a delay of 500 ms between each attempt
          for (let i = 0; i < 10; i++) {
            await new Promise((resolve) => setTimeout(resolve, 500)) // Delay of 500 ms

            await bot.telegram.sendMessage(userId, `‼️ БІТООООК\n\n${messageText}`, {
              parse_mode: 'HTML',
            })
          }
        } catch (error) {
          if (error.response && error.response.error_code === 403) {
            // console.error(`User has blocked the bot for chat_id: ${userId}`);
          } else {
            console.error('Error sending message:', error)
          }
        }
      }
    }
  })
}

const start = () => {
  alertInterval = setInterval(() => {
    fireAlert('binance')
    fireAlert('bybit')
    fireAlert('okx')
    fireAlert('mexc')
    fireAlert('blofin')
  }, process.env.CALC_INTERVAL_SECONDS_TELEGRAM * 1000)
}

const stop = () => {
  clearInterval(alertInterval)
}

module.exports = { start, stop }
