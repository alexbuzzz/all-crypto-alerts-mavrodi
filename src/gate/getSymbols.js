require('dotenv').config()
const axios = require('axios')
const store = require('../../store')

const getSymbols = async () => {
  const exceptions = process.env.EXCEPTIONS ? process.env.EXCEPTIONS.split(',') : []

  try {
    const apiUrl = 'https://api.gateio.ws/api/v4/futures/usdt/contracts'
    const response = await axios.get(apiUrl)

    if (response.status == 200) {
      const responseData = response.data

      if (Array.isArray(responseData)) {
        responseData.forEach((element) => {
          if (element.name.includes('USDT') && !exceptions.includes(element.name)) {
            // Create empty obj for new symbols
            if (!store.currentData.gate.hasOwnProperty(element.name)) {
              store.currentData.gate[element.name] = {}
            }

            try {
              store.currentData.gate[element.name].quanto_multiplier = parseFloat(element.quanto_multiplier)
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
