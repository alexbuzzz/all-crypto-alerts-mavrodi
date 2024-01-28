require('dotenv').config()
const axios = require('axios')
const store = require('../../store')

const getSymbols = async () => {
  const exceptions = process.env.EXCEPTIONS ? process.env.EXCEPTIONS.split(',') : []

  try {
    const apiUrl = 'https://contract.mexc.com/api/v1/contract/ticker'
    const response = await axios.get(apiUrl)

    if (response.data.success) {
      const responseData = response.data.data

      if (Array.isArray(responseData)) {
        responseData.forEach((element) => {
          if (element.symbol.includes('USDT') && !exceptions.includes(element.symbol)) {
            // Create empty obj for new symbols
            if (!store.currentData.mexc.hasOwnProperty(element.symbol)) {
              store.currentData.mexc[element.symbol] = {}
            }

            try {
              store.marketData.mexc[element.symbol].volInCurr24 = Math.round(parseFloat(element.amount24) / 1000)
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
    console.error('request failed: ', e)
  }
}

module.exports = getSymbols
