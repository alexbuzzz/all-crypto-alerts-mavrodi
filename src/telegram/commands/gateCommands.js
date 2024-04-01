const store = require('../../../store')
const gateKeyboards = require('../keyboards/gateKeyboards')

const editOIMessageText = (ctx) => {
  ctx.editMessageText(
    `<strong>Gate Open Interest</strong>\n\n${store.users[ctx.chat.id].gate.oiSetup1 ? '✅' : '➖'} 1.5% 1min\n\n${store.users[ctx.chat.id].gate.oiSetup2 ? '✅' : '➖'} 3% 1min\n\n${
      store.users[ctx.chat.id].gate.oiSetup3 ? '✅' : '➖'
    } 10% 5min\n\nSide: ${store.users[ctx.chat.id].gate.oiDirection}`,
    {
      parse_mode: 'HTML',
      ...gateKeyboards.gateOI(),
    }
  )
}

const editVolBoostMessageText = (ctx) => {
  ctx.editMessageText(
    `<strong>Gate Volume Boost</strong>\n\n${store.users[ctx.chat.id].gate.volBoostSetup1 ? '✅' : '➖'} 10X / 3min\n\n${store.users[ctx.chat.id].gate.volBoostSetup2 ? '✅' : '➖'} 12X / 100min\n\n${
      store.users[ctx.chat.id].gate.volBoostSetup3 ? '✅' : '➖'
    } 20X / 100min\n\n${store.users[ctx.chat.id].gate.volBoostSetup4 ? '✅' : '➖'} 20X / 20min\n\n${store.users[ctx.chat.id].gate.volBoostSetup5 ? '✅' : '➖'} 1X / 1min`,
    {
      parse_mode: 'HTML',
      ...gateKeyboards.gateVolBoost(),
    }
  )
}

const commands = {
  // gate
  gate: (ctx) => {
    ctx.editMessageText('gate alert type:', gateKeyboards.alertTypes())
  },

  // gate OI
  gateOI: (ctx) => {
    editOIMessageText(ctx)
  },

  gateOIsetup1: (ctx) => {
    store.users[ctx.chat.id].gate.oiSetup1 = !store.users[ctx.chat.id].gate.oiSetup1

    editOIMessageText(ctx)
  },

  gateOIsetup2: (ctx) => {
    store.users[ctx.chat.id].gate.oiSetup2 = !store.users[ctx.chat.id].gate.oiSetup2

    editOIMessageText(ctx)
  },

  gateOIsetup3: (ctx) => {
    store.users[ctx.chat.id].gate.oiSetup3 = !store.users[ctx.chat.id].gate.oiSetup3

    editOIMessageText(ctx)
  },

  gateOIswitchDirection: (ctx) => {
    switch (store.users[ctx.chat.id].gate.oiDirection) {
      case 'BOTH':
        store.users[ctx.chat.id].gate.oiDirection = 'LONG'
        break
      case 'LONG':
        store.users[ctx.chat.id].gate.oiDirection = 'SHORT'
        break
      case 'SHORT':
        store.users[ctx.chat.id].gate.oiDirection = 'BOTH'
        break
    }

    editOIMessageText(ctx)
  },

  // gate VOL BOOST
  gateVolBoost: (ctx) => {
    editVolBoostMessageText(ctx)
  },

  gateVolBoostSetup1: (ctx) => {
    store.users[ctx.chat.id].gate.volBoostSetup1 = !store.users[ctx.chat.id].gate.volBoostSetup1

    editVolBoostMessageText(ctx)
  },

  gateVolBoostSetup2: (ctx) => {
    store.users[ctx.chat.id].gate.volBoostSetup2 = !store.users[ctx.chat.id].gate.volBoostSetup2

    editVolBoostMessageText(ctx)
  },

  gateVolBoostSetup3: (ctx) => {
    store.users[ctx.chat.id].gate.volBoostSetup3 = !store.users[ctx.chat.id].gate.volBoostSetup3

    editVolBoostMessageText(ctx)
  },

  gateVolBoostSetup4: (ctx) => {
    store.users[ctx.chat.id].gate.volBoostSetup4 = !store.users[ctx.chat.id].gate.volBoostSetup4

    editVolBoostMessageText(ctx)
  },

  gateVolBoostSetup5: (ctx) => {
    store.users[ctx.chat.id].gate.volBoostSetup5 = !store.users[ctx.chat.id].gate.volBoostSetup5

    editVolBoostMessageText(ctx)
  },
}

module.exports = commands
