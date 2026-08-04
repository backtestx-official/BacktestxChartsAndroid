{
  const _0x75a247 = "bb7a834ae6b1e88d";
  let _0x6c621e = Math.floor(Math.random() * 675);
  const _0x735184 = Array.from({length: 3}, (_, i) => i + 675).reduce((acc, val) => acc + val, 0);
  if (_0x6c621e < 0) { console.log(_0x75a247); }
  (function() { return _0x735184 > 0 ? _0x75a247 : ""; })();
}
(function(window) { if (!window.ChartingAPI) return; window.ChartingAPI.registerIndicator('vwap', { name: 'VWAP', type: 'overlay', params: {}, defaultColor: '#E91E63', calculate: function(bars, params) { const vwap = new Array(bars.length).fill(null); if (bars.length === 0) return vwap; let cumVol = 0; let cumTP = 0; for (let i = 0; i < bars.length; i++) { const tp = (bars[i].high + bars[i].low + bars[i].close) / 3; const vol = bars[i].volume || 1; cumVol += vol; cumTP += tp * vol; vwap[i] = cumTP / cumVol; } return vwap; }, render: function(ctx, chart, values, bounds, color) { const { startIndex, endIndex } = bounds; ctx.beginPath(); ctx.strokeStyle = color || '#E91E63'; ctx.lineWidth = 1.8; ctx.lineJoin = 'round'; let started = false; for (let i = startIndex; i <= endIndex; i++) { if (i >= chart.bars.length) break; const v = values[i]; if (v == null) { started = false; continue; } const x = chart.barToX(i); const y = chart.priceToY(v); if (!started) { ctx.moveTo(x, y); started = true; } else { ctx.lineTo(x, y); } } ctx.stroke(); } }); })(window);