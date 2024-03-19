const { Markup } = require('telegraf')

const Keyboards = {
  alertTypes: () =>
    Markup.inlineKeyboard([
      [Markup.button.callback('OI', 'binanceOI')],
      [Markup.button.callback('Volume boost', 'binanceVolBoost')],
      [Markup.button.callback('BTC spot DOM', 'binanceBtcSpotDom')],
      [Markup.button.callback('⬅️ Back', 'backToMain')],
    ]),

  binanceOI: () =>
    Markup.inlineKeyboard([
      [Markup.button.callback('1.5% 1min', 'binanceOIsetup1')],
      [Markup.button.callback('3% 1min', 'binanceOIsetup2')],
      [Markup.button.callback('10% 5min', 'binanceOIsetup3')],
      [Markup.button.callback('↕️ Switch Side', 'binanceOIswitchDirection')],
      [Markup.button.callback('⬅️ Back', 'binance')],
    ]),

  binanceVolBoost: () =>
    Markup.inlineKeyboard([
      [Markup.button.callback('10X / 3min', 'binanceVolBoostSetup1')],
      [Markup.button.callback('12X / 100min', 'binanceVolBoostSetup2')],
      [Markup.button.callback('20X / 100min', 'binanceVolBoostSetup3')],
      [Markup.button.callback('20X / 20min', 'binanceVolBoostSetup4')],
      [Markup.button.callback('1X / 1min', 'binanceVolBoostSetup5')],
      [Markup.button.callback('⬅️ Back', 'binance')],
    ]),

  binanceBtcSpotDom: () =>
    Markup.inlineKeyboard([
      [Markup.button.callback('10 BTC / 0.5%', 'binanceBtcSpotDomSetup1')],
      [Markup.button.callback('70 BTC / 0.5%', 'binanceBtcSpotDomSetup2')],
      [Markup.button.callback('150 BTC / 0.5%', 'binanceBtcSpotDomSetup3')],
      [Markup.button.callback('⬅️ Back', 'binance')],
    ]),
}

module.exports = Keyboards
