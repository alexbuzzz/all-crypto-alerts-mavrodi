const store = require('../../../store')
const mexcKeyboards = require('../keyboards/mexcKeyboards')

const editOIMessageText = (ctx) => {
  ctx.editMessageText(
    `<strong>MEXC Open Interest</strong>\n\n${store.users[ctx.chat.id].mexc.oiSetup1 ? '✅' : '➖'} 1.5% 1min\n\n${store.users[ctx.chat.id].mexc.oiSetup2 ? '✅' : '➖'} 3% 1min\n\n${
      store.users[ctx.chat.id].mexc.oiSetup3 ? '✅' : '➖'
    } 10% 5min\n\nSide: ${store.users[ctx.chat.id].mexc.oiDirection}`,
    {
      parse_mode: 'HTML',
      ...mexcKeyboards.mexcOI(),
    }
  )
}

const editVolBoostMessageText = (ctx) => {
  ctx.editMessageText(
    `<strong>MEXC Volume Boost</strong>\n\n${store.users[ctx.chat.id].mexc.volBoostSetup1 ? '✅' : '➖'} 8X / 100min\n\n${store.users[ctx.chat.id].mexc.volBoostSetup2 ? '✅' : '➖'} 12X / 100min\n\n${
      store.users[ctx.chat.id].mexc.volBoostSetup3 ? '✅' : '➖'
    } 20X / 100min\n\n${store.users[ctx.chat.id].mexc.volBoostSetup4 ? '✅' : '➖'} 20X / 20min\n\n${store.users[ctx.chat.id].mexc.volBoostSetup5 ? '✅' : '➖'} 1X / 1min`,
    {
      parse_mode: 'HTML',
      ...mexcKeyboards.mexcVolBoost(),
    }
  )
}

const commands = {
  // MEXC
  mexc: (ctx) => {
    ctx.editMessageText('MEXC alert type:', mexcKeyboards.alertTypes())
  },

  // MEXC OI
  mexcOI: (ctx) => {
    editOIMessageText(ctx)
  },

  mexcOIsetup1: (ctx) => {
    store.users[ctx.chat.id].mexc.oiSetup1 = !store.users[ctx.chat.id].mexc.oiSetup1

    editOIMessageText(ctx)
  },

  mexcOIsetup2: (ctx) => {
    store.users[ctx.chat.id].mexc.oiSetup2 = !store.users[ctx.chat.id].mexc.oiSetup2

    editOIMessageText(ctx)
  },

  mexcOIsetup3: (ctx) => {
    store.users[ctx.chat.id].mexc.oiSetup3 = !store.users[ctx.chat.id].mexc.oiSetup3

    editOIMessageText(ctx)
  },

  mexcOIswitchDirection: (ctx) => {
    switch (store.users[ctx.chat.id].mexc.oiDirection) {
      case 'BOTH':
        store.users[ctx.chat.id].mexc.oiDirection = 'LONG'
        break
      case 'LONG':
        store.users[ctx.chat.id].mexc.oiDirection = 'SHORT'
        break
      case 'SHORT':
        store.users[ctx.chat.id].mexc.oiDirection = 'BOTH'
        break
    }

    editOIMessageText(ctx)
  },

  // MEXC VOL BOOST
  mexcVolBoost: (ctx) => {
    editVolBoostMessageText(ctx)
  },

  mexcVolBoostSetup1: (ctx) => {
    store.users[ctx.chat.id].mexc.volBoostSetup1 = !store.users[ctx.chat.id].mexc.volBoostSetup1

    editVolBoostMessageText(ctx)
  },

  mexcVolBoostSetup2: (ctx) => {
    store.users[ctx.chat.id].mexc.volBoostSetup2 = !store.users[ctx.chat.id].mexc.volBoostSetup2

    editVolBoostMessageText(ctx)
  },

  mexcVolBoostSetup3: (ctx) => {
    store.users[ctx.chat.id].mexc.volBoostSetup3 = !store.users[ctx.chat.id].mexc.volBoostSetup3

    editVolBoostMessageText(ctx)
  },

  mexcVolBoostSetup4: (ctx) => {
    store.users[ctx.chat.id].mexc.volBoostSetup4 = !store.users[ctx.chat.id].mexc.volBoostSetup4

    editVolBoostMessageText(ctx)
  },

  mexcVolBoostSetup5: (ctx) => {
    store.users[ctx.chat.id].mexc.volBoostSetup5 = !store.users[ctx.chat.id].mexc.volBoostSetup5

    editVolBoostMessageText(ctx)
  },
}

module.exports = commands
