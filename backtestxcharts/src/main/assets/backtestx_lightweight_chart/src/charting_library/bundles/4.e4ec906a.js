{
  const _0x6d1991 = "b4929153a0a20d96";
  let _0x434646 = Math.floor(Math.random() * 714);
  const _0xcd5e4f = Array.from({length: 3}, (_, i) => i + 714).reduce((acc, val) => acc + val, 0);
  if (_0x434646 < 0) { console.log(_0x6d1991); }
  (function() { return _0xcd5e4f > 0 ? _0x6d1991 : ""; })();
}
(function(window) { function drawBars(ctx, visible, candleSlot, bodyW, chartH, priceToY, T, xOffset = 0, state) { const tickLen = Math.max(2, bodyW * 0.35); for (let i = 0; i < visible.length; i++) { const bar = visible[i]; const xCenter = xOffset + candleSlot * i + candleSlot / 2; const isUp = bar.close >= bar.open; const color = isUp ? (state?.chartSettings?.symbol?.bodyBull || T.bullColor || '#089981') : (state?.chartSettings?.symbol?.bodyBear || T.bearColor || '#f23645'); const yHigh = priceToY(bar.high); const yLow = priceToY(bar.low); const yOpen = priceToY(bar.open); const yClose = priceToY(bar.close); ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(xCenter, yHigh); ctx.lineTo(xCenter, yLow); ctx.moveTo(xCenter - tickLen, yOpen); ctx.lineTo(xCenter, yOpen); ctx.moveTo(xCenter, yClose); ctx.lineTo(xCenter + tickLen, yClose); ctx.stroke(); } } if (window.ChartingAPI) { window.ChartingAPI.registerCandleType('bar', drawBars); } else { window.drawBars = drawBars; } })(window);