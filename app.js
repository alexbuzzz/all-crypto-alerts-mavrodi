const fs = require('fs')
const path = require('path')
const cron = require('node-cron')
const JSONdb = require('simple-json-db')
const telegramBot = require('./src/telegram/bot')
const getBinanceSymbols = require('./src/binance/getSymbols')
const binanceKlineStream = require('./src/binance/klineStream')
const binanceOrderbookStreamSpot = require('./src/binance/orderbookStreamSpot')
const binanceOiStream = require('./src/binance/oiStream')
const getBybitSymbols = require('./src/bybit/getSymbols')
const bybitKlineStream = require('./src/bybit/klineStream')
const bybitOiStream = require('./src/bybit/oiStream')
const getOKXSymbols = require('./src/okx/getSymbols')
const okxOiStream = require('./src/okx/oiStream')
const okxKlineStream = require('./src/okx/klineStream')
const getMexcSymbols = require('./src/mexc/getSymbols')
const mexcOiStream = require('./src/mexc/oiStream')
const mexcKlineStream = require('./src/mexc/klineStream')
const getBlofinSymbols = require('./src/blofin/getSymbols')
const blofinKlineStream = require('./src/blofin/klineStream')
const getGateSymbols = require('./src/gate/getSymbols')
const gateOiStream = require('./src/gate/oiStream')
const gateKlineStream = require('./src/gate/klineStream')
const collectCandles = require('./src/engine/collectCandles')
const telegramAlerts = require('./src/engine/telegramAlerts')

const store = require('./store')

const dbFolderPath = 'database'
const dataFilePath = path.join(dbFolderPath, 'marketData.json')

const marketDataDb = new JSONdb('database/marketData.json')
const userDataDb = new JSONdb('database/userData.json')
const appSettingsDb = new JSONdb('database/appSettings.json')

// Create DB folder if not exists
if (!fs.existsSync(dbFolderPath)) {
  fs.mkdirSync(dbFolderPath)
}

// Pull data from DB to store if pause was less than minute
if (fs.existsSync(dataFilePath)) {
  const currentTime = Date.now()

  const marketData = marketDataDb.get('data')
  if (marketData && currentTime - marketData.lastUpdateTime <= 60 * 1000) {
    store.marketData = marketData
  }
}

// Pull user settings from DB
const users = userDataDb.get('users')
if (users) {
  store.users = users
}

// Pull message IDs from DB
const messageIDs = appSettingsDb.get('messageIDs')
if (messageIDs) {
  store.messageIDs = messageIDs
}

// Pull last alers times from DB
const lastAlertTimes = appSettingsDb.get('lastAlertTimes')
if (lastAlertTimes) {
  store.lastAlertTimes = lastAlertTimes
}

// Pull last alers WS times from DB
const lastAlertTimesWS = appSettingsDb.get('lastAlertTimesWS')
if (lastAlertTimesWS) {
  store.lastAlertTimesWS = lastAlertTimesWS
}

// Pull custom filters from DB
const customFilters = userDataDb.get('customFilters')
if (customFilters) {
  store.customFilters = customFilters
}

// Save store data in DB by CRON
cron.schedule('*/10 * * * * *', () => {
  marketDataDb.set('data', store.marketData)
  userDataDb.set('users', store.users)
  appSettingsDb.set('messageIDs', store.messageIDs)
  appSettingsDb.set('lastAlertTimes', store.lastAlertTimes)
  appSettingsDb.set('lastAlertTimesWS', store.lastAlertTimesWS)
  userDataDb.set('customFilters', store.customFilters)
})

const start = async () => {
  await getBinanceSymbols()
  await getBybitSymbols()
  await getOKXSymbols()
  await getMexcSymbols()
  await getBlofinSymbols()
  await getGateSymbols()
  binanceKlineStream.start()
  binanceOrderbookStreamSpot.start()
  binanceOiStream.start()
  bybitKlineStream.start()
  bybitOiStream.start()
  okxOiStream.start()
  okxKlineStream.start()
  mexcOiStream.start()
  mexcKlineStream.start()
  blofinKlineStream.start()
  gateOiStream.start()
  gateKlineStream.start()

  setTimeout(() => {
    telegramAlerts.start()
    collectCandles.start()
  }, 10 * 1000) // Give time to all websockets start
}

const stop = () => {
  binanceKlineStream.stop()
  binanceOrderbookStreamSpot.stop()
  binanceOiStream.stop()
  bybitKlineStream.stop()
  bybitOiStream.stop()
  okxOiStream.stop()
  okxKlineStream.stop()
  mexcOiStream.stop()
  mexcKlineStream.stop()
  blofinKlineStream.stop()
  gateOiStream.stop()
  gateKlineStream.stop()
  collectCandles.stop()
  telegramAlerts.stop()
}

// Restart all every 60 min to get new listed instruments data
cron.schedule('1 * * * *', () => {
  stop()

  // Give time to all websockets stop
  setTimeout(() => {
    start()
  }, 10000)
})

// Init start
start()

// Start the Telegram bot
telegramBot.launch()

// setInterval(() => {
//   console.log(store.currentData.gate)
// }, 5000)
