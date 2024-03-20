const { Markup } = require('telegraf')

const Keyboards = {
  alertTypes: () => Markup.inlineKeyboard([[Markup.button.callback('OI', 'blofinOI')], [Markup.button.callback('Volume boost', 'blofinVolBoost')], [Markup.button.callback('⬅️ Back', 'backToMain')]]),

  blofinOI: () => Markup.inlineKeyboard([[Markup.button.callback('⬅️ Back', 'blofin')]]),

  blofinVolBoost: () =>
    Markup.inlineKeyboard([
      [Markup.button.callback('10X / 3min', 'blofinVolBoostSetup1')],
      [Markup.button.callback('12X / 100min', 'blofinVolBoostSetup2')],
      [Markup.button.callback('20X / 100min', 'blofinVolBoostSetup3')],
      [Markup.button.callback('20X / 20min', 'blofinVolBoostSetup4')],
      [Markup.button.callback('1X / 1min', 'blofinVolBoostSetup5')],
      [Markup.button.callback('RAKE', 'blofinRakeSetup1')],
      [Markup.button.callback('⬅️ Back', 'blofin')],
    ]),
}

module.exports = Keyboards
