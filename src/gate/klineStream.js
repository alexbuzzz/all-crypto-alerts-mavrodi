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
      symbols.forEach((symbol) => {
        subscribeKline(symbol)
      })

      console.log('GATE KLINE opened')

      pingInterval = setInterval(() => {
        sendPing()
      }, 20000)
    })

    wsClient.on('message', (data) => {
      try {
        if (data === 'pong') {
          return
        }

        const message = JSON.parse(data)
        if (message.event === 'update' && message.result && Array.isArray(message.result)) {
          message.result.forEach((element) => {
            const symbol = element.n.substring(3)
            const vol = element.v * store.currentData.gate[symbol].quanto_multiplier
            const candleTime = element.t
            const open = element.o
            const close = element.c
            const high = element.h
            const low = element.l
            const volInCurr = Math.round((parseFloat(close) * parseFloat(vol)) / 1000)

            if (store.currentData.gate.hasOwnProperty(symbol)) {
              store.currentData.gate[symbol].volInCurr = volInCurr
              store.currentData.gate[symbol].openPrice = open
              store.currentData.gate[symbol].closePrice = close
              store.currentData.gate[symbol].highPrice = high
              store.currentData.gate[symbol].lowPrice = low
              store.currentData.gate[symbol].candleTime = candleTime
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
      console.log('GATE KLINE closed')
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
      time: Date.now(),
      event: 'subscribe',
      channel: 'futures.candlesticks',
      payload: ['1m', symbol],
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
