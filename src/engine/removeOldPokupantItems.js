require('dotenv').config()

const removeOldPokupantItems = (obj) => {
  if (!obj || typeof obj !== 'object') {
    return
  }

  const currentTime = Math.floor(Date.now() / 1000)

  Object.keys(obj).forEach((key) => {
    if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
      removeOldPokupantItems(obj[key]) // Recursively call removeOldItems for nested objects
    } else if (Array.isArray(obj[key])) {
      obj[key] = obj[key].filter((item) => !item.time || currentTime - item.time <= process.env.REMOVE_OLD_POKUPANT_ITEMS_SEC)
    }
  })
}

module.exports = removeOldPokupantItems
