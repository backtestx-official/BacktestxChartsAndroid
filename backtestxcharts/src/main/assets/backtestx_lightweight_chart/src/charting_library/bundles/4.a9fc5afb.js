{
  const _0x4619e7 = "3d9302ca3c23b011";
  let _0xd29b67 = Math.floor(Math.random() * 585);
  const _0x51f72f = Array.from({length: 3}, (_, i) => i + 585).reduce((acc, val) => acc + val, 0);
  if (_0xd29b67 < 0) { console.log(_0x4619e7); }
  (function() { return _0x51f72f > 0 ? _0x4619e7 : ""; })();
}
(function(window) { function drawBars(ctx, visible, candleSlot, bodyW, chartH, priceToY, T, xOffset = 0, state) { const tickLen = Math.max(2, bodyW * 0.35); for (let i = 0; i < visible.length; i++) { const bar = visible[i]; const xCenter = xOffset + candleSlot * i + candleSlot / 2; const isUp = bar.close >= bar.open; const color = isUp ? (state?.chartSettings?.symbol?.bodyBull || T.bullColor || '#26a69a') : (state?.chartSettings?.symbol?.bodyBear || T.bearColor || '#ef5350'); const yHigh = priceToY(bar.high); const yLow = priceToY(bar.low); const yOpen = priceToY(bar.open); const yClose = priceToY(bar.close); ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(xCenter, yHigh); ctx.lineTo(xCenter, yLow); ctx.moveTo(xCenter - tickLen, yOpen); ctx.lineTo(xCenter, yOpen); ctx.moveTo(xCenter, yClose); ctx.lineTo(xCenter + tickLen, yClose); ctx.stroke(); } } if (window.ChartingAPI) { window.ChartingAPI.registerCandleType('bar', drawBars); } else { window.drawBars = drawBars; } })(window);