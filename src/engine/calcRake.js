const store = require('../../store')
require('dotenv').config()

const calcRake = (exchange, symbol) => {
  let res = 0

  if (store.marketData[exchange] && store.marketData[exchange][symbol] && store.marketData[exchange][symbol].historicalData && store.marketData[exchange][symbol].historicalData.length > 1) {
    const historicalData = store.marketData[exchange][symbol].historicalData
    const lastItem = historicalData[historicalData.length - 1]
    const avgVolInCurr = historicalData.reduce((acc, cur) => acc + cur.volInCurr, 0) / historicalData.length

    if (lastItem.volInCurr > avgVolInCurr * 10 && lastItem.volInCurr > 1 && historicalData.length > process.env.RAKE_SCAN_PERIOD) {
      historicalData.slice(-1 - process.env.RAKE_SCAN_PERIOD, -1).forEach((item) => {
        const percDiff = (Math.abs(item.volInCurr - lastItem.volInCurr) / lastItem.volInCurr) * 100

        if (percDiff <= process.env.RAKE_SIMILAR_PERCENTAGE) {
          res = Math.round(lastItem.volInCurr)
        }
      })
    }
  }

  return res
}

module.exports = calcRake
