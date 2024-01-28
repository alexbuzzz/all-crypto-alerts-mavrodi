require('dotenv').config()
const axios = require('axios')
const store = require('../../store')

const getSymbols = async () => {
  const exceptions = process.env.EXCEPTIONS ? process.env.EXCEPTIONS.split(',') : []

  try {
    const apiUrl = 'https://www.okx.com/api/v5/market/tickers?instType=SWAP'
    const response = await axios.get(apiUrl)

    if (response && response.status == 200) {
      const responseData = response.data.data

      if (Array.isArray(responseData)) {
        responseData.forEach((element) => {
          if (element.instId.includes('USDT') && !exceptions.includes(element.symbol)) {
            // Create empty obj for new symbols
            if (!store.currentData.okx.hasOwnProperty(element.instId)) {
              store.currentData.okx[element.instId] = {}
            }

            try {
              store.marketData.okx[element.instId].volInCurr24 = Math.round(parseFloat(element.volCcy24h) / 1000)
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
