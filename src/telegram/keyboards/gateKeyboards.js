const { Markup } = require('telegraf')

const Keyboards = {
  alertTypes: () => Markup.inlineKeyboard([[Markup.button.callback('OI', 'gateOI')], [Markup.button.callback('Volume boost', 'gateVolBoost')], [Markup.button.callback('⬅️ Back', 'backToMain')]]),

  gateOI: () =>
    Markup.inlineKeyboard([
      [Markup.button.callback('1.5% 1min', 'gateOIsetup1')],
      [Markup.button.callback('3% 1min', 'gateOIsetup2')],
      [Markup.button.callback('10% 5min', 'gateOIsetup3')],
      [Markup.button.callback('↕️ Switch Side', 'gateOIswitchDirection')],
      [Markup.button.callback('⬅️ Back', 'gate')],
    ]),

  gateVolBoost: () =>
    Markup.inlineKeyboard([
      [Markup.button.callback('10X / 3min', 'gateVolBoostSetup1')],
      [Markup.button.callback('12X / 100min', 'gateVolBoostSetup2')],
      [Markup.button.callback('20X / 100min', 'gateVolBoostSetup3')],
      [Markup.button.callback('20X / 20min', 'gateVolBoostSetup4')],
      [Markup.button.callback('1X / 1min', 'gateVolBoostSetup5')],
      [Markup.button.callback('⬅️ Back', 'gate')],
    ]),
}

module.exports = Keyboards
