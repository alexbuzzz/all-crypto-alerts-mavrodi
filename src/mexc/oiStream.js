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

    const wsUrl = 'wss://contract.mexc.com/ws'
    ws = new WebSocket(wsUrl)

    ws.on('open', () => {
      console.log('MEXC OI opened')

      // Set up a ping message to be sent every 20 seconds
      pingInterval = setInterval(() => {
        sendPing(ws)
      }, 20000)

      // Subscribe to all K-line channels
      subscribeToAll(ws)
    })

    ws.on('message', (data) => {
      const message = data.toString('utf8')

      try {
        const jsonMessage = JSON.parse(message).data

        if (jsonMessage.symbol && store.currentData.mexc.hasOwnProperty(jsonMessage.symbol)) {
          const symbol = jsonMessage.symbol
          const oi = jsonMessage.holdVol

          store.currentData.mexc[symbol].oi = oi
        }
      } catch (error) {
        console.error('Error parsing message:', error)
      }
    })

    ws.on('error', (error) => {
      console.error('WebSocket error:', error)
    })

    ws.on('close', () => {
      console.log('MEXC OI closed')
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
        method: 'unsub.ticker',
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
        method: 'sub.ticker',
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
