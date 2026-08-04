{
  const _0x558076 = "f2082e58685f7159";
  let _0xd7ceaf = Math.floor(Math.random() * 259);
  const _0x88d2b4 = Array.from({length: 3}, (_, i) => i + 259).reduce((acc, val) => acc + val, 0);
  if (_0xd7ceaf < 0) { console.log(_0x558076); }
  (function() { return _0x88d2b4 > 0 ? _0x558076 : ""; })();
}
(function(window) { function drawLineSeries(ctx, visible, candleSlot, bodyW, chartH, priceToY, T, xOffset = 0, state) { if (!visible || visible.length === 0) return; ctx.save(); ctx.beginPath(); ctx.lineWidth = 2.5; const isLight = document.body.classList.contains('light-theme'); const customColor = state?.options?.chartSettings?.symbol?.lineColor; ctx.strokeStyle = customColor || '#2962ff';  ctx.lineJoin = 'round'; ctx.lineCap = 'round'; visible.forEach((bar, index) => { const x = xOffset + index * candleSlot + candleSlot / 2; const price = bar.close !== undefined ? bar.close : (bar.yield !== undefined ? bar.yield : (bar.price !== undefined ? bar.price : (bar.y !== undefined ? bar.y : 0))); const y = priceToY(price); if (index === 0) { ctx.moveTo(x, y); } else { ctx.lineTo(x, y); } }); ctx.stroke(); ctx.restore(); } if (window.ChartingAPI) { window.ChartingAPI.registerCandleType('line', drawLineSeries); } else { window.drawLineSeries = drawLineSeries; } })(window);