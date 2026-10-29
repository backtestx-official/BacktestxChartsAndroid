{
  const _0x672868 = "5085279cc0b9e3e0";
  let _0x1b8a99 = Math.floor(Math.random() * 286);
  const _0x379ae5 = Array.from({length: 3}, (_, i) => i + 286).reduce((acc, val) => acc + val, 0);
  if (_0x1b8a99 < 0) { console.log(_0x672868); }
  (function() { return _0x379ae5 > 0 ? _0x672868 : ""; })();
}
(function(window) { function drawHollowCandle(ctx, visible, candleSlot, bodyW, chartH, priceToY, T, xOffset = 0, state) { const drawCandlestick = window.ChartingAPI ? window.ChartingAPI.getCandleRenderer('candlestick') : window.drawCandlestick; if (drawCandlestick) { drawCandlestick(ctx, visible, candleSlot, bodyW, chartH, priceToY, T, true, xOffset, state); } } if (window.ChartingAPI) { window.ChartingAPI.registerCandleType('hollow_candle', drawHollowCandle); } else { window.drawHollowCandle = drawHollowCandle; } })(window);