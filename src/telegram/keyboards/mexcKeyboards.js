const { Markup } = require('telegraf')

const Keyboards = {
  alertTypes: () => Markup.inlineKeyboard([[Markup.button.callback('OI', 'mexcOI')], [Markup.button.callback('Volume boost', 'mexcVolBoost')], [Markup.button.callback('⬅️ Back', 'backToMain')]]),

  mexcOI: () =>
    Markup.inlineKeyboard([
      [Markup.button.callback('1.5% 1min', 'mexcOIsetup1')],
      [Markup.button.callback('3% 1min', 'mexcOIsetup2')],
      [Markup.button.callback('10% 5min', 'mexcOIsetup3')],
      [Markup.button.callback('↕️ Switch Side', 'mexcOIswitchDirection')],
      [Markup.button.callback('⬅️ Back', 'mexc')],
    ]),

  mexcVolBoost: () =>
    Markup.inlineKeyboard([
      [Markup.button.callback('8X / 100min', 'mexcVolBoostSetup1')],
      [Markup.button.callback('12X / 100min', 'mexcVolBoostSetup2')],
      [Markup.button.callback('20X / 100min', 'mexcVolBoostSetup3')],
      [Markup.button.callback('20X / 20min', 'mexcVolBoostSetup4')],
      [Markup.button.callback('1X / 1min', 'mexcVolBoostSetup5')],
      [Markup.button.callback('⬅️ Back', 'mexc')],
    ]),
}

module.exports = Keyboards
