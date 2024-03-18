require('dotenv').config()
const axios = require('axios')
const store = require('../../store')

const getSymbols = async () => {
  const exceptions = process.env.EXCEPTIONS ? process.env.EXCEPTIONS.split(',') : []

  try {
    const apiUrl = 'https://openapi.blofin.com/api/v1/market/tickers'
    const response = await axios.get(apiUrl)

    if (response.status == 200) {
      const responseData = response.data.data

      if (Array.isArray(responseData)) {
        responseData.forEach((element) => {
          if (element.instId.includes('USDT') && !exceptions.includes(element.instId)) {
            // Create empty obj for new symbols
            if (!store.currentData.blofin.hasOwnProperty(element.instId)) {
              store.currentData.blofin[element.instId] = {}
            }

            try {
              store.marketData.blofin[element.instId].volInCurr24 = Math.round(parseFloat(element.volCurrency24h) / 1000)
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
