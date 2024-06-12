require('dotenv').config()
const WebSocket = require('ws')
const store = require('../../store')

let ws = null
let pingInterval = null

const start = () => {
  const connectWebSocket = () => {
    // Check if wsClient is already open
    if (ws && ws.readyState === WebSocket.OPEN) {
      return
    }

    const wsUrl = 'wss://contract.mexc.com/edge'
    ws = new WebSocket(wsUrl)

    ws.on('open', () => {
      console.log('MEXC TRADES opened')

      // Set up a ping message to be sent every 20 seconds
      pingInterval = setInterval(() => {
        sendPing(ws)
      }, 20000)

      // Subscribe to all K-line channels
      subscribeToAll(ws)
    })

    ws.on('message', (data) => {
      if (data.toString('utf8') === 'pong') {
        return
      }

      const message = data.toString('utf8')

      try {
        const jsonMessage = JSON.parse(message)

        if (jsonMessage.symbol && jsonMessage.data) {
          const symbol = jsonMessage.symbol
          const price = jsonMessage.data.p
          const vol = jsonMessage.data.v
          const side = jsonMessage.data.T
          const volInCurr = Math.round(price * vol)

          const exceptions = process.env.POKUPANT_EXCEPTIONS ? process.env.POKUPANT_EXCEPTIONS.split(',') : []

          if (volInCurr >= process.env.POKUPANT_MIN_TRADES_FILTER * 1000 && !exceptions.some((exception) => symbol.includes(exception))) {
            const currentTime = Math.floor(Date.now() / 1000)
            const sideFormatted = side === 1 ? 'long' : 'short'

            const newItem = {
              vol: volInCurr,
              time: currentTime,
            }

            if (!store.pokupantData.mexc.fut[sideFormatted][symbol]) {
              store.pokupantData.mexc.fut[sideFormatted][symbol] = []
            }
            store.pokupantData.mexc.fut[sideFormatted][symbol].push(newItem)
          }
        }
      } catch (error) {
        console.error('Error parsing message:', error)
      }
    })

    ws.on('error', (error) => {
      console.error('WebSocket error:', error)
    })

    ws.on('close', () => {
      console.log('MEXC TRADES closed')
      clearInterval(pingInterval)
      unsubscribeFromAll(ws)
      setTimeout(connectWebSocket, 20000) // Reconnect after 20 seconds
    })
  }

  // Function to send a ping message
  const sendPing = (ws) => {
    const pingMsg = JSON.stringify({
      method: 'ping',
    })

    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(pingMsg)
    }
  }

  // Function to unsubscribe from all channels
  const unsubscribeFromAll = (ws) => {
    const symbols = Object.keys(store.currentData.mexc)
    symbols.forEach((symbol) => {
      const unsubscribeMsg = JSON.stringify({
        method: 'unsub.deal',
        param: {
          symbol,
        },
      })
      ws.send(unsubscribeMsg)
    })
  }

  // Function to subscribe to all K-line channels
  const subscribeToAll = (ws) => {
    const symbols = Object.keys(store.currentData.mexc)
    symbols.forEach((symbol) => {
      const subscribeMsg = JSON.stringify({
        method: 'sub.deal',
        param: {
          symbol,
        },
      })
      ws.send(subscribeMsg)
    })
  }

  connectWebSocket()
}

const stop = () => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.close()
    clearInterval(pingInterval)
  }
}

module.exports = { start, stop }
