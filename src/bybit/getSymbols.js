require('dotenv').config()
const axios = require('axios')
const store = require('../../store')

const getSymbols = async () => {
  const exceptions = process.env.EXCEPTIONS ? process.env.EXCEPTIONS.split(',') : []

  try {
    const apiUrl = 'https://api.bybit.com/v5/market/tickers?category=linear'
    const response = await axios.get(apiUrl)

    if (response.status == 200) {
      const responseData = response.data.result.list
      if (Array.isArray(responseData)) {
        responseData.forEach((element) => {
          if (element.symbol.includes('USDT') && !exceptions.includes(element.symbol)) {
            // Create empty obj for new symbols
            if (!store.currentData.bybit.hasOwnProperty(element.symbol)) {
              store.currentData.bybit[element.symbol] = {}
            }

            try {
              store.marketData.bybit[element.symbol].volInCurr24 = Math.round(parseFloat(element.turnover24h) / 1000)
            } catch (error) {
              //
            }
          }
        })
      } else {
        console.error('Response data is not an array')
      }
    } else {
      console.error('Request was not successful')
    }

    return
  } catch (e) {
    console.error('Request failed: ', e)
  }
}

module.exports = getSymbols
