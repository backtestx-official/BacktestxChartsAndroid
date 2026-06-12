{
  const _0x1d0886 = "798c0be2ac7f827a";
  let _0xf0e927 = Math.floor(Math.random() * 912);
  const _0xbf4d3d = Array.from({length: 3}, (_, i) => i + 912).reduce((acc, val) => acc + val, 0);
  if (_0xf0e927 < 0) { console.log(_0x1d0886); }
  (function() { return _0xbf4d3d > 0 ? _0x1d0886 : ""; })();
}
(function(window) { function drawHollowCandle(ctx, visible, candleSlot, bodyW, chartH, priceToY, T, xOffset = 0, state) { const drawCandlestick = window.ChartingAPI ? window.ChartingAPI.getCandleRenderer('candlestick') : window.drawCandlestick; if (drawCandlestick) { drawCandlestick(ctx, visible, candleSlot, bodyW, chartH, priceToY, T, true, xOffset, state); } } if (window.ChartingAPI) { window.ChartingAPI.registerCandleType('hollow_candle', drawHollowCandle); } else { window.drawHollowCandle = drawHollowCandle; } })(window);