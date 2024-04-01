const WebSocket = require('ws')
const store = require('../../store')

let wsClient = null
let pingInterval

const start = () => {
  const symbols = Object.keys(store.currentData.gate)
  const wsEndpoint = 'wss://fx-ws.gateio.ws/v4/ws/usdt'

  const connectWebSocket = () => {
    // Check if wsClient is already open
    if (wsClient && wsClient.readyState === WebSocket.OPEN) {
      return
    }

    wsClient = new WebSocket(wsEndpoint)

    wsClient.on('open', () => {
      subscribeOi(symbols)

      console.log('GATE OI opened')

      pingInterval = setInterval(() => {
        sendPing()
      }, 20000)
    })

    wsClient.on('message', (data) => {
      try {
        if (data.toString('utf8') === 'pong') {
          return
        }

        const message = JSON.parse(data)
        if (message.result && Array.isArray(message.result)) {
          message.result.forEach((element) => {
            const symbol = element.contract
            const oi = element.total_size

            if (store.currentData.gate.hasOwnProperty(symbol)) {
              if (oi) {
                store.currentData.gate[symbol].oi = parseFloat(oi)
              }
            }
          })
        }

        clearInterval(pingInterval)
        pingInterval = setInterval(() => {
          sendPing()
        }, 20000)
      } catch (error) {
        console.error(error)
      }
    })

    wsClient.on('close', () => {
      console.log('GATE OI closed')
      clearInterval(pingInterval)

      setTimeout(() => {
        connectWebSocket()
      }, 20000)
    })

    wsClient.on('error', (err) => {
      console.error('WebSocket error:', err)
      clearInterval(pingInterval)

      setTimeout(() => {
        connectWebSocket()
      }, 20000)
    })
  }

  const subscribeOi = (symbols) => {
    const subscribeMsg = {
      time: Date.now(),
      event: 'subscribe',
      channel: 'futures.tickers',
      payload: symbols,
    }

    try {
      wsClient.send(JSON.stringify(subscribeMsg))
    } catch (error) {
      console.error('gate subscribe error', error)
    }
  }

  const sendPing = () => {
    try {
      if (wsClient && wsClient.readyState === WebSocket.OPEN) {
        wsClient.send('ping')
      }
    } catch (error) {
      console.error('Error sending ping:', error)
    }
  }

  connectWebSocket()
}

const stop = () => {
  if (wsClient && wsClient.readyState === WebSocket.OPEN) {
    wsClient.close()
    clearInterval(pingInterval)
  }
}

module.exports = { start, stop }
