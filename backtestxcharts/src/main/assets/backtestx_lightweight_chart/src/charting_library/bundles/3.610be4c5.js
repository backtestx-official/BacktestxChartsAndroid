{
  const _0xc3839c = "b9a38bd74068225b";
  let _0x8a8158 = Math.floor(Math.random() * 881);
  const _0x8bcb1c = Array.from({length: 3}, (_, i) => i + 881).reduce((acc, val) => acc + val, 0);
  if (_0x8a8158 < 0) { console.log(_0xc3839c); }
  (function() { return _0x8bcb1c > 0 ? _0xc3839c : ""; })();
}
(function(window) { function drawHeikinAshi(ctx, visible, candleSlot, bodyW, chartH, priceToY, T, xOffset = 0, state) { const ha = []; for (let i = 0; i < visible.length; i++) { const b = visible[i]; const prevHA = ha[i - 1]; const haClose = (b.open + b.high + b.low + b.close) / 4; const haOpen = prevHA ? (prevHA.open + prevHA.close) / 2 : (b.open + b.close) / 2; const haHigh = Math.max(b.high, haOpen, haClose); const haLow = Math.min(b.low, haOpen, haClose); ha.push({ open: haOpen, high: haHigh, low: haLow, close: haClose }); } const drawCandlestick = window.ChartingAPI ? window.ChartingAPI.getCandleRenderer('candlestick') : window.drawCandlestick; if (drawCandlestick) { drawCandlestick(ctx, ha.map((h, i) => ({ ...visible[i], ...h })), candleSlot, bodyW, chartH, priceToY, T, false, xOffset, state); } } if (window.ChartingAPI) { window.ChartingAPI.registerCandleType('heikin_ashi', drawHeikinAshi); } else { window.drawHeikinAshi = drawHeikinAshi; } })(window);