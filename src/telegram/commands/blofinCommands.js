const store = require('../../../store')
const blofinKeyboards = require('../keyboards/blofinKeyboards')

const editOIMessageText = (ctx) => {
  ctx.editMessageText(`<strong>Blofin Open Interest</strong> not available yet.`, {
    parse_mode: 'HTML',
    ...blofinKeyboards.blofinOI(),
  })
}

const editVolBoostMessageText = (ctx) => {
  ctx.editMessageText(
    `<strong>Blofin Volume Boost</strong>\n\n${store.users[ctx.chat.id].blofin.volBoostSetup1 ? '✅' : '➖'} 10X / 3min\n\n${
      store.users[ctx.chat.id].blofin.volBoostSetup2 ? '✅' : '➖'
    } 12X / 100min\n\n${store.users[ctx.chat.id].blofin.volBoostSetup3 ? '✅' : '➖'} 20X / 100min\n\n${store.users[ctx.chat.id].blofin.volBoostSetup4 ? '✅' : '➖'} 20X / 20min\n\n${
      store.users[ctx.chat.id].blofin.volBoostSetup5 ? '✅' : '➖'
    } 1X / 1min\n\n${store.users[ctx.chat.id].blofin.rakeSetup1 ? '✅' : '➖'} RAKE`,
    {
      parse_mode: 'HTML',
      ...blofinKeyboards.blofinVolBoost(),
    }
  )
}

const commands = {
  // blofin
  blofin: (ctx) => {
    ctx.editMessageText('Blofin alert type:', blofinKeyboards.alertTypes())
  },

  // blofin OI
  blofinOI: (ctx) => {
    editOIMessageText(ctx)
  },

  blofinOIsetup1: (ctx) => {
    store.users[ctx.chat.id].blofin.oiSetup1 = !store.users[ctx.chat.id].blofin.oiSetup1

    editOIMessageText(ctx)
  },

  blofinOIsetup2: (ctx) => {
    store.users[ctx.chat.id].blofin.oiSetup2 = !store.users[ctx.chat.id].blofin.oiSetup2

    editOIMessageText(ctx)
  },

  blofinOIsetup3: (ctx) => {
    store.users[ctx.chat.id].blofin.oiSetup3 = !store.users[ctx.chat.id].blofin.oiSetup3

    editOIMessageText(ctx)
  },

  blofinOIswitchDirection: (ctx) => {
    switch (store.users[ctx.chat.id].blofin.oiDirection) {
      case 'BOTH':
        store.users[ctx.chat.id].blofin.oiDirection = 'LONG'
        break
      case 'LONG':
        store.users[ctx.chat.id].blofin.oiDirection = 'SHORT'
        break
      case 'SHORT':
        store.users[ctx.chat.id].blofin.oiDirection = 'BOTH'
        break
    }

    editOIMessageText(ctx)
  },

  // blofin VOL BOOST
  blofinVolBoost: (ctx) => {
    editVolBoostMessageText(ctx)
  },

  blofinVolBoostSetup1: (ctx) => {
    store.users[ctx.chat.id].blofin.volBoostSetup1 = !store.users[ctx.chat.id].blofin.volBoostSetup1

    editVolBoostMessageText(ctx)
  },

  blofinVolBoostSetup2: (ctx) => {
    store.users[ctx.chat.id].blofin.volBoostSetup2 = !store.users[ctx.chat.id].blofin.volBoostSetup2

    editVolBoostMessageText(ctx)
  },

  blofinVolBoostSetup3: (ctx) => {
    store.users[ctx.chat.id].blofin.volBoostSetup3 = !store.users[ctx.chat.id].blofin.volBoostSetup3

    editVolBoostMessageText(ctx)
  },

  blofinVolBoostSetup4: (ctx) => {
    store.users[ctx.chat.id].blofin.volBoostSetup4 = !store.users[ctx.chat.id].blofin.volBoostSetup4

    editVolBoostMessageText(ctx)
  },

  blofinVolBoostSetup5: (ctx) => {
    store.users[ctx.chat.id].blofin.volBoostSetup5 = !store.users[ctx.chat.id].blofin.volBoostSetup5

    editVolBoostMessageText(ctx)
  },

  blofinRakeSetup1: (ctx) => {
    store.users[ctx.chat.id].blofin.rakeSetup1 = !store.users[ctx.chat.id].blofin.rakeSetup1

    editVolBoostMessageText(ctx)
  },
}

module.exports = commands
