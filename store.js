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
    gate: {},
  },

  users: {},

  marketData: {
    lastUpdateTime: 0,
    binance: {},
    bybit: {},
    okx: {},
    mexc: {},
    blofin: {},
    gate: {},
  },

  currentData: {
    binance: {},
    bybit: {},
    okx: {},
    mexc: {},
    blofin: {},
    gate: {},
  },

  orderBookData: {
    binance: {},
    bybit: {},
    okx: {},
    mexc: {},
    blofin: {},
    gate: {},
  },
}

module.exports = store
