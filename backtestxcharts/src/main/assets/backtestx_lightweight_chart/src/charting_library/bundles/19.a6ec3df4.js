{
  const _0x32ecbd = "fed7b5cd1733372c";
  let _0x1210e9 = Math.floor(Math.random() * 202);
  const _0xa5b1bb = Array.from({length: 3}, (_, i) => i + 202).reduce((acc, val) => acc + val, 0);
  if (_0x1210e9 < 0) { console.log(_0x32ecbd); }
  (function() { return _0xa5b1bb > 0 ? _0x32ecbd : ""; })();
}
(function(window) { window.TimeScale = { barToX: function(chart, i) { const slot = chart.candleWidth + chart.candleGap; return chart.offset + i * slot + chart.candleWidth / 2; }, xToBar: function(chart, x) { const slot = chart.candleWidth + chart.candleGap; return Math.round((x - chart.offset - chart.candleWidth / 2) / slot); }, getVisibleRange: function(chart) { const chartW = chart.logicalWidth - chart.paddingRight; const slot = chart.candleWidth + chart.candleGap; const startIndex = Math.floor((-slot - chart.offset - chart.candleWidth / 2) / slot); const endIndex = Math.ceil((chartW + slot - chart.offset - chart.candleWidth / 2) / slot); return { startIndex, endIndex }; }, getBarTime: function(chart, i) { const bars = chart.bars; if (!bars || bars.length === 0) return Date.now(); const len = bars.length; if (i >= 0 && i < len) { return bars[i].time; } let intervalMs = 60000; if (len >= 2) { const diffs = []; const sampleSize = Math.min(10, len - 1); for (let k = 0; k < sampleSize; k++) { const idx = len - 1 - k; diffs.push(bars[idx].time - bars[idx - 1].time); } const positiveDiffs = diffs.filter(d => d > 0); if (positiveDiffs.length > 0) { intervalMs = Math.min(...positiveDiffs); } } if (i < 0) { return bars[0].time + i * intervalMs; } else { return bars[len - 1].time + (i - (len - 1)) * intervalMs; } }, _getDateParts: function(chart, date) { if (window.TimeZone && typeof window.TimeZone.getDateParts === 'function') { return window.TimeZone.getDateParts(chart, date); } const dtfOpts = { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }; let dtf; try { dtf = new Intl.DateTimeFormat('en-US', dtfOpts); } catch (e) { dtf = new Intl.DateTimeFormat('en-US', { ...dtfOpts, timeZone: 'UTC' }); } const parts = dtf.formatToParts(date); const map = {}; parts.forEach(p => map[p.type] = p.value); return map; }, _getAdaptiveLabel: function(chart, date, prevDate) { const cur = window.TimeScale._getDateParts(chart, date); const prev = prevDate ? window.TimeScale._getDateParts(chart, prevDate) : null; const tsOptions = chart.options?.chartSettings?.timeScale || {};
        const timeFormat = tsOptions.timeFormat || '24-hours';
        let timePart = `${cur.hour}:${cur.minute}`;
        if (timeFormat === '12-hours') {
            let h = parseInt(cur.hour, 10);
            const m = cur.minute;
            const ampm = h >= 12 ? 'PM' : 'AM';
            h = h % 12;
            if (h === 0) h = 12;
            timePart = `${h}:${m} ${ampm}`;
        } const res = String(chart.resolution || '1D'); const isIntraday = !['1D', '1d', '1W', '1w', '1M', 'D', 'W', 'M'].includes(res) && !res.endsWith('M') && !/[DwW]/i.test(res.slice(-1)); if (!isIntraday) { if (!prev || cur.year !== prev.year) { return { text: cur.year, isBoundary: true }; } if (cur.month !== prev.month) { return { text: cur.month, isBoundary: true }; } return { text: cur.day, isBoundary: false }; } if (!prev || cur.year !== prev.year) { return { text: cur.year, isBoundary: true }; } if (cur.month !== prev.month) { return { text: cur.month, isBoundary: true }; } if (cur.day !== prev.day) { return { text: `${cur.day} ${cur.month}`, isBoundary: true }; } return { text: timePart, isBoundary: false }; }, drawTimeScale: function(chart, ctx, chartH) { ctx.save(); const { startIndex, endIndex } = window.TimeScale.getVisibleRange(chart); const chartW = chart.logicalWidth - chart.paddingRight; const slot = Math.max(1, chart.candleWidth + chart.candleGap); const stableVisibleCount = Math.floor(chartW / slot); const maxLabels = Math.floor(chartW / 80); const labelInterval = Math.max(1, Math.floor(stableVisibleCount / maxLabels)); const isLight = document.body.classList.contains('light-theme'); const tsSettings = window.ChartingAPI && typeof window.ChartingAPI.getTimeScaleSettings === 'function' ? window.ChartingAPI.getTimeScaleSettings() : null; const startOffsetIndex = Math.ceil(startIndex / labelInterval) * labelInterval; for (let i = startOffsetIndex; i <= endIndex; i += labelInterval) { const x = chart.barToX(i); const time = window.TimeScale.getBarTime(chart, i); const date = new Date(time); const prevTime = window.TimeScale.getBarTime(chart, i - labelInterval); const prevDate = new Date(prevTime); const { text, isBoundary } = window.TimeScale._getAdaptiveLabel(chart, date, prevDate); const cvSettings = chart.options?.chartSettings?.canvas || {}; if (cvSettings.gridType !== 'none') { const defaultGridColor = tsSettings && tsSettings.lineColor ? tsSettings.lineColor : (isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(42, 46, 57, 0.4)'); const gridColor = cvSettings.gridColor || defaultGridColor; const gridWidth = tsSettings && tsSettings.lineWidth !== undefined ? tsSettings.lineWidth : 0.5; let gridDash = tsSettings && tsSettings.lineDash ? tsSettings.lineDash : [4, 4]; if (cvSettings.gridType === 'solid') gridDash = []; else if (cvSettings.gridType === 'dashed') gridDash = [4, 4]; ctx.strokeStyle = gridColor; ctx.lineWidth = gridWidth; ctx.setLineDash(gridDash); ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, chartH); ctx.stroke(); ctx.setLineDash([]); } const labelSize = tsSettings && tsSettings.fontSize ? tsSettings.fontSize : '10px'; const labelFamily = tsSettings && tsSettings.fontFamily ? tsSettings.fontFamily : 'Inter, Arial, sans-serif'; ctx.font = isBoundary ? `bold ${labelSize} ${labelFamily}` : `${labelSize} ${labelFamily}`; const labelColor = tsSettings && tsSettings.textColor ? tsSettings.textColor : (isBoundary  ? (isLight ? '#131722' : '#ffffff')  : (isLight ? '#707584' : '#9b9ba3')); ctx.fillStyle = labelColor; ctx.textAlign = 'center'; ctx.textBaseline = 'top'; const labelWidth = ctx.measureText(text).width; if (x - labelWidth / 2 >= 0 && x + labelWidth / 2 <= chartW) { ctx.fillText(text, x, chartH + 8); } } ctx.restore(); }, drawTimeBadge: function(chart, ctx, chartH) { ctx.save(); const hoverBarIdx = chart.xToBar(chart.mousePos.x); if (chart.bars && chart.bars.length > 0) { const time = window.TimeScale.getBarTime(chart, hoverBarIdx); const dateObj = new Date(time); const res = String(chart.resolution || '1D'); const isIntraday = !['1D', '1d', '1W', '1w', '1M', 'D', 'W', 'M'].includes(res) && !res.endsWith('M') && !/[DwW]/i.test(res.slice(-1)); let hoverDateStr;
        const tsOptions = chart.options?.chartSettings?.timeScale || {};
        const dateFormat = tsOptions.dateFormat || 'default';
        const timeFormat = tsOptions.timeFormat || '24-hours';
        
        const cur = window.TimeScale._getDateParts(chart, dateObj);
        let datePart = '';
        if (dateFormat === 'yyyy-mm-dd') {
            const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
            const dd = String(dateObj.getDate()).padStart(2, '0');
            datePart = `${cur.year}-${mm}-${dd}`;
        } else if (dateFormat === 'dd-mm-yyyy') {
            const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
            const dd = String(dateObj.getDate()).padStart(2, '0');
            datePart = `${dd}-${mm}-${cur.year}`;
        } else {
            datePart = isIntraday ? `${cur.month} ${cur.day}, ${cur.year}` : dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        }
        
        let timePart = '';
        if (isIntraday) {
            let h = parseInt(cur.hour, 10);
            const m = cur.minute;
            if (timeFormat === '12-hours') {
                const ampm = h >= 12 ? 'PM' : 'AM';
                h = h % 12;
                if (h === 0) h = 12;
                timePart = `  ${h}:${m} ${ampm}`;
            } else {
                timePart = `  ${cur.hour}:${cur.minute}`;
            }
        }
        
        hoverDateStr = datePart + timePart; const isLight = document.body.classList.contains('light-theme'); const settings = window.ChartingAPI && typeof window.ChartingAPI.getCrosshairSettings === 'function' ? window.ChartingAPI.getCrosshairSettings() : null; const bgColor = settings && settings.badgeBgColor  ? settings.badgeBgColor  : (isLight ? '#131722' : '#2a2e39'); const textColor = settings && settings.badgeTextColor  ? settings.badgeTextColor  : '#ffffff'; ctx.fillStyle = bgColor; ctx.font = '10px Inter, Arial, sans-serif'; const badgeW = ctx.measureText(hoverDateStr).width + 12; const snappedX = chart.barToX(hoverBarIdx); const chartW = chart.logicalWidth - chart.paddingRight; let badgeX = snappedX; if (badgeX - badgeW / 2 < 0) { badgeX = badgeW / 2; } else if (badgeX + badgeW / 2 > chartW) { badgeX = chartW - badgeW / 2; } ctx.fillRect(badgeX - badgeW / 2, chartH + 1, badgeW, 18); ctx.fillStyle = textColor; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(hoverDateStr, badgeX, chartH + 10); } ctx.restore(); } }; })(window);