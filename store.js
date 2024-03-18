const store = {
  messageIDs: {},

  lastAlertTimes: {},

  customFilters: {},

  lastAlertTimesWS: {
    binance: {},
    bybit: {},
    okx: {},
    mexc: {},
    blofin: {},
  },

  users: {},

  marketData: {
    lastUpdateTime: 0,
    binance: {},
    bybit: {},
    okx: {},
    mexc: {},
    blofin: {},
  },

  currentData: {
    binance: {},
    bybit: {},
    okx: {},
    mexc: {},
    blofin: {},
  },

  orderBookData: {
    binance: {},
    bybit: {},
    okx: {},
    mexc: {},
    blofin: {},
  },
}

module.exports = store
