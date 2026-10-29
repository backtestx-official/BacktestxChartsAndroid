{
  const _0xecd1b7 = "a77102ec4943e918";
  let _0x2bd4fb = Math.floor(Math.random() * 469);
  const _0x8e24dc = Array.from({length: 3}, (_, i) => i + 469).reduce((acc, val) => acc + val, 0);
  if (_0x2bd4fb < 0) { console.log(_0xecd1b7); }
  (function() { return _0x8e24dc > 0 ? _0xecd1b7 : ""; })();
}
(function(window) { function drawLineSeries(ctx, visible, candleSlot, bodyW, chartH, priceToY, T, xOffset = 0, state) { if (!visible || visible.length === 0) return; ctx.save(); ctx.beginPath(); ctx.lineWidth = 2.5; const isLight = document.body.classList.contains('light-theme'); const customColor = state?.options?.chartSettings?.symbol?.lineColor; ctx.strokeStyle = customColor || '#2962ff';  ctx.lineJoin = 'round'; ctx.lineCap = 'round'; visible.forEach((bar, index) => { const x = xOffset + index * candleSlot + candleSlot / 2; const price = bar.close !== undefined ? bar.close : (bar.yield !== undefined ? bar.yield : (bar.price !== undefined ? bar.price : (bar.y !== undefined ? bar.y : 0))); const y = priceToY(price); if (index === 0) { ctx.moveTo(x, y); } else { ctx.lineTo(x, y); } }); ctx.stroke(); ctx.restore(); } if (window.ChartingAPI) { window.ChartingAPI.registerCandleType('line', drawLineSeries); } else { window.drawLineSeries = drawLineSeries; } })(window);