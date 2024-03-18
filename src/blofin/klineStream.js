const WebSocket = require('ws')
const store = require('../../store')

let wsClient = null
let pingInterval

const start = () => {
  const symbols = Object.keys(store.currentData.blofin)
  const wsEndpoint = 'wss://openapi.blofin.com/ws/public'

  const connectWebSocket = () => {
    // Check if wsClient is already open
    if (wsClient && wsClient.readyState === WebSocket.OPEN) {
      return
    }

    wsClient = new WebSocket(wsEndpoint)

    wsClient.on('open', () => {
      symbols.forEach((symbol) => {
        subscribeKline(symbol)
      })

      console.log('BLOFIN KLINE opened')

      pingInterval = setInterval(() => {
        sendPing()
      }, 20000)
    })

    wsClient.on('message', (data) => {
      if (data.toString('utf8') === 'pong') {
        return
      }

      const message = JSON.parse(data)

      try {
        if (message.data && message.data[0]) {
          const open = message.data[0][1]
          const close = message.data[0][4]
          const high = message.data[0][2]
          const low = message.data[0][3]
          const volInCurr = Math.round(parseFloat(message.data[0][7]) / 1000)

          const symbol = message.arg.instId
          const candleTime = message.data[0][0]

          if (store.currentData.blofin.hasOwnProperty(symbol)) {
            store.currentData.blofin[symbol].volInCurr = volInCurr
            store.currentData.blofin[symbol].openPrice = open
            store.currentData.blofin[symbol].closePrice = close
            store.currentData.blofin[symbol].highPrice = high
            store.currentData.blofin[symbol].lowPrice = low
            store.currentData.blofin[symbol].candleTime = candleTime
          }
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
      console.log('BLOFIN KLINE closed')
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

  const subscribeKline = (symbol) => {
    const subscribeMsg = {
      op: 'subscribe',
      args: [
        {
          channel: 'candle1m',
          instId: symbol,
        },
      ],
    }

    try {
      wsClient.send(JSON.stringify(subscribeMsg))
    } catch (error) {
      console.error('blofin subscribe error', error)
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
