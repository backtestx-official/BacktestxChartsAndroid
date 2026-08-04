{
  const _0xe49c24 = "784851cd6fff4721";
  let _0x9000f9 = Math.floor(Math.random() * 870);
  const _0xa86965 = Array.from({length: 3}, (_, i) => i + 870).reduce((acc, val) => acc + val, 0);
  if (_0x9000f9 < 0) { console.log(_0xe49c24); }
  (function() { return _0xa86965 > 0 ? _0xe49c24 : ""; })();
}
(function(window) { function drawHollowCandle(ctx, visible, candleSlot, bodyW, chartH, priceToY, T, xOffset = 0, state) { const drawCandlestick = window.ChartingAPI ? window.ChartingAPI.getCandleRenderer('candlestick') : window.drawCandlestick; if (drawCandlestick) { drawCandlestick(ctx, visible, candleSlot, bodyW, chartH, priceToY, T, true, xOffset, state); } } if (window.ChartingAPI) { window.ChartingAPI.registerCandleType('hollow_candle', drawHollowCandle); } else { window.drawHollowCandle = drawHollowCandle; } })(window);