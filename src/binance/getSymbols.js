require('dotenv').config()
const axios = require('axios')
const store = require('../../store')

const getSymbols = async () => {
  const exceptions = process.env.EXCEPTIONS ? process.env.EXCEPTIONS.split(',') : []

  try {
    const apiUrl = 'https://fapi.binance.com/fapi/v1/ticker/24hr'
    const response = await axios.get(apiUrl)

    if (response.status == 200) {
      const responseData = response.data
      if (Array.isArray(responseData)) {
        responseData.forEach((element) => {
          if (element.symbol.includes('USDT') && !element.symbol.includes('_') && !exceptions.includes(element.symbol)) {
            // Create empty obj for new symbols
            if (!store.currentData.binance.hasOwnProperty(element.symbol)) {
              store.currentData.binance[element.symbol] = {}
            }

            try {
              store.marketData.binance[element.symbol].volInCurr24 = Math.round(parseFloat(element.quoteVolume) / 1000)
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
