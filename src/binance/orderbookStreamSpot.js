const WebSocket = require('ws')
const store = require('../../store')

const symbol = 'btcusdt'
const depthWebSocketUrl = `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@depth@100ms`
const miniTickerWebSocketUrl = `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@miniTicker`

let wsDepth
let wsMiniTicker

let currentPrice = 0
let filteredBids = []
let filteredAsks = []

const filterPercentage = 0.5
const minVolFiler = 10 // BTC

const start = () => {
  // Function to create a WebSocket connection
  const createWebSocketConnection = (url, onMessageCallback, wsInstance) => {
    // Check if wsClient1 is already open
    if (wsInstance && wsInstance.readyState === WebSocket.OPEN) {
      return
    }

    const ws = new WebSocket(url)

    ws.on('open', () => {
      console.log('BINANCE SPOT DOM opened')
    })

    ws.on('message', (data) => {
      onMessageCallback(data, ws)
    })

    ws.on('error', (error) => {
      console.error(`WebSocket error for ${url}:`, error.message)
      // Implement reconnection logic here
      setTimeout(() => createWebSocketConnection(url, onMessageCallback, wsInstance), 30000)
    })

    ws.on('close', (code, reason) => {
      console.log('BINANCE SPOT DOM closed')
      // Implement reconnection logic here
      setTimeout(() => createWebSocketConnection(url, onMessageCallback, wsInstance), 30000)
    })

    return ws
  }

  // WebSocket for Depth
  wsDepth = createWebSocketConnection(
    depthWebSocketUrl,
    (data) => {
      try {
        const parsedData = JSON.parse(data)

        if (currentPrice > 0) {
          filteredBids = parsedData.b.filter((item) => {
            const price = parseFloat(item[0])
            const volume = parseFloat(item[1])
            const percentageChange = ((price - currentPrice) / currentPrice) * 100
            return volume >= minVolFiler && Math.abs(percentageChange) <= filterPercentage
          })

          filteredAsks = parsedData.a.filter((item) => {
            const price = parseFloat(item[0])
            const volume = parseFloat(item[1])
            const percentageChange = ((price - currentPrice) / currentPrice) * 100
            return volume >= minVolFiler && Math.abs(percentageChange) <= filterPercentage
          })

          const combinedResults = filteredBids.concat(filteredAsks)
          store.orderBookData.binance = combinedResults
        }
      } catch (error) {
        console.error('Error parsing Depth data:', error.message)
      }
    },
    wsDepth
  )

  // WebSocket for Mini Ticker
  wsMiniTicker = createWebSocketConnection(
    miniTickerWebSocketUrl,
    (data) => {
      try {
        const parsedData = JSON.parse(data)
        currentPrice = parseFloat(parsedData.c)
      } catch (error) {
        console.error('Error parsing Mini Ticker data:', error.message)
      }
    },
    wsMiniTicker
  )
}

const stop = () => {
  if (wsDepth) {
    wsDepth.close()
  }

  if (wsMiniTicker) {
    wsMiniTicker.close()
  }
}

module.exports = { start, stop }
