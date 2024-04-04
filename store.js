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

  pokupantData: {
    binance: {
      fut: {
        long: {},
        short: {},
      },
      spot: {
        long: {},
        short: {},
      },
    },
    bybit: {
      fut: {
        long: {},
        short: {},
      },
      spot: {
        long: {},
        short: {},
      },
    },
    okx: {
      fut: {
        long: {},
        short: {},
      },
      spot: {
        long: {},
        short: {},
      },
    },
    mexc: {
      fut: {
        long: {},
        short: {},
      },
      spot: {
        long: {},
        short: {},
      },
    },
    blofin: {
      fut: {
        long: {},
        short: {},
      },
      spot: {
        long: {},
        short: {},
      },
    },
    gate: {
      fut: {
        long: {},
        short: {},
      },
      spot: {
        long: {},
        short: {},
      },
    },
  },
}

module.exports = store
