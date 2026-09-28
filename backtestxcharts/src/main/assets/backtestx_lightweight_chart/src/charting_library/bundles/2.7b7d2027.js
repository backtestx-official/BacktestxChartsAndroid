{
  const _0x017ab5 = "03b530776935ccb0";
  let _0x44a3d4 = Math.floor(Math.random() * 378);
  const _0x181841 = Array.from({length: 3}, (_, i) => i + 378).reduce((acc, val) => acc + val, 0);
  if (_0x44a3d4 < 0) { console.log(_0x017ab5); }
  (function() { return _0x181841 > 0 ? _0x017ab5 : ""; })();
}
(function(window) { function drawHollowCandle(ctx, visible, candleSlot, bodyW, chartH, priceToY, T, xOffset = 0, state) { const drawCandlestick = window.ChartingAPI ? window.ChartingAPI.getCandleRenderer('candlestick') : window.drawCandlestick; if (drawCandlestick) { drawCandlestick(ctx, visible, candleSlot, bodyW, chartH, priceToY, T, true, xOffset, state); } } if (window.ChartingAPI) { window.ChartingAPI.registerCandleType('hollow_candle', drawHollowCandle); } else { window.drawHollowCandle = drawHollowCandle; } })(window);