const detectPokupant = (pokupantData, tolerance, minCount) => {
  let result = null
  let coincidenceFound = false

  for (const exchange in pokupantData) {
    for (const market in pokupantData[exchange]) {
      for (const side in pokupantData[exchange][market]) {
        for (const pair in pokupantData[exchange][market][side]) {
          const volArray = pokupantData[exchange][market][side][pair]

          for (let i = 0; i < volArray.length; i++) {
            const item = volArray[i]
            const tempItem = {
              low: item.vol - item.vol * (tolerance / 100),
              current: item.vol,
              high: item.vol + item.vol * (tolerance / 100),
              count: 0,
            }

            for (let j = 0; j < volArray.length; j++) {
              if (i !== j) {
                const compareItem = volArray[j]
                if (item.vol >= compareItem.vol - compareItem.vol * (tolerance / 100) && item.vol <= compareItem.vol + compareItem.vol * (tolerance / 100)) {
                  tempItem.count++
                  if (tempItem.count >= minCount - 1) {
                    result = {
                      exchange: exchange,
                      market: market,
                      side: side,
                      symbol: pair,
                      vol: item.vol,
                    }
                    coincidenceFound = true
                    break
                  }
                }
              }
            }

            if (coincidenceFound) {
              break
            }
          }

          if (coincidenceFound) {
            break
          }
        }

        if (coincidenceFound) {
          break
        }
      }

      if (coincidenceFound) {
        break
      }
    }

    if (coincidenceFound) {
      break
    }
  }

  return result
}

module.exports = detectPokupant
