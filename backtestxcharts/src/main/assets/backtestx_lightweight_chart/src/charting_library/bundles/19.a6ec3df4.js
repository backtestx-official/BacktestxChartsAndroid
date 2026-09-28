{
  const _0x3b42d9 = "ffc288e46101a7c0";
  let _0x863938 = Math.floor(Math.random() * 222);
  const _0x3768ed = Array.from({length: 3}, (_, i) => i + 222).reduce((acc, val) => acc + val, 0);
  if (_0x863938 < 0) { console.log(_0x3b42d9); }
  (function() { return _0x3768ed > 0 ? _0x3b42d9 : ""; })();
}
(function(window) {
  window.TimeScale = {
    barToX: function(chart, i) {
      const slot = chart.candleWidth + chart.candleGap;
      return chart.offset + i * slot + chart.candleWidth / 2;
    },

    xToBar: function(chart, x) {
      const slot = chart.candleWidth + chart.candleGap;
      return Math.round((x - chart.offset - chart.candleWidth / 2) / slot);
    },

    logicalToCoordinate: function(chart, logical) {
      return window.TimeScale.barToX(chart, logical);
    },

    coordinateToLogical: function(chart, x) {
      return window.TimeScale.xToBar(chart, x);
    },

    timeToCoordinate: function(chart, time) {
      if (!chart.bars || chart.bars.length === 0) return 0;
      let closestIdx = 0;
      let minDiff = Infinity;
      for (let i = 0; i < chart.bars.length; i++) {
        const diff = Math.abs(chart.bars[i].time - time);
        if (diff < minDiff) {
          minDiff = diff;
          closestIdx = i;
        }
      }
      return window.TimeScale.barToX(chart, closestIdx);
    },

    coordinateToTime: function(chart, x) {
      const barIdx = window.TimeScale.xToBar(chart, x);
      return window.TimeScale.getBarTime(chart, barIdx);
    },

    getVisibleRange: function(chart) {
      const chartW = chart.logicalWidth - chart.paddingRight;
      const slot = chart.candleWidth + chart.candleGap;
      const startIndex = Math.floor((-slot - chart.offset - chart.candleWidth / 2) / slot);
      const endIndex = Math.ceil((chartW + slot - chart.offset - chart.candleWidth / 2) / slot);
      return { startIndex, endIndex };
    },

    getVisibleLogicalRange: function(chart) {
      const { startIndex, endIndex } = window.TimeScale.getVisibleRange(chart);
      return { from: startIndex, to: endIndex };
    },

    getVisibleTimeRange: function(chart) {
      const { startIndex, endIndex } = window.TimeScale.getVisibleRange(chart);
      const from = window.TimeScale.getBarTime(chart, Math.max(0, startIndex));
      const to = window.TimeScale.getBarTime(chart, Math.min(chart.bars.length - 1, endIndex));
      return { from, to };
    },

    setVisibleLogicalRange: function(chart, range) {
      if (!range || range.from === undefined || range.to === undefined) return;
      const count = Math.max(1, range.to - range.from);
      const chartW = chart.logicalWidth - chart.paddingRight;
      const slot = chartW / count;
      chart.candleGap = 2;
      chart.candleWidth = Math.max(1, slot - chart.candleGap);
      const newSlot = chart.candleWidth + chart.candleGap;
      chart.offset = -range.from * newSlot - chart.candleWidth / 2;
      chart._clampOffset();
      chart.render();
      if (typeof chart._emitRangeChange === 'function') chart._emitRangeChange();
    },

    setVisibleRange: function(chart, range) {
      if (!range || !chart.bars || chart.bars.length === 0) return;
      let fromIdx = 0;
      let toIdx = chart.bars.length - 1;

      for (let i = 0; i < chart.bars.length; i++) {
        if (chart.bars[i].time >= range.from) {
          fromIdx = i;
          break;
        }
      }
      for (let i = chart.bars.length - 1; i >= 0; i--) {
        if (chart.bars[i].time <= range.to) {
          toIdx = i;
          break;
        }
      }

      window.TimeScale.setVisibleLogicalRange(chart, { from: fromIdx, to: toIdx });
    },

    fitContent: function(chart) {
      if (!chart.bars || chart.bars.length === 0) return;
      const chartW = chart.logicalWidth - chart.paddingRight;
      const count = chart.bars.length;
      const slot = Math.max(2, chartW / count);
      chart.candleGap = Math.max(1, Math.floor(slot * 0.2));
      chart.candleWidth = Math.max(1, slot - chart.candleGap);
      chart.offset = 0;
      chart._clampOffset();
      chart.render();
      if (typeof chart._emitRangeChange === 'function') chart._emitRangeChange();
    },

    scrollToPosition: function(chart, offset, animated = false) {
      chart.offset = offset;
      chart._clampOffset();
      chart.render();
      if (typeof chart._emitRangeChange === 'function') chart._emitRangeChange();
    },

    scrollToRealTime: function(chart) {
      chart.offset = chart._getInitialOffset ? chart._getInitialOffset() : 0;
      chart._clampOffset();
      chart.render();
      if (typeof chart._emitRangeChange === 'function') chart._emitRangeChange();
    },

    getBarTime: function(chart, i) {
      const bars = chart.bars;
      if (!bars || bars.length === 0) return Date.now();
      const len = bars.length;
      if (i >= 0 && i < len) {
        return bars[i].time;
      }
      let intervalMs = 60000;
      if (len >= 2) {
        const diffs = [];
        const sampleSize = Math.min(10, len - 1);
        for (let k = 0; k < sampleSize; k++) {
          const idx = len - 1 - k;
          diffs.push(bars[idx].time - bars[idx - 1].time);
        }
        const positiveDiffs = diffs.filter(d => d > 0);
        if (positiveDiffs.length > 0) {
          intervalMs = Math.min(...positiveDiffs);
        }
      }
      if (i < 0) {
        return bars[0].time + i * intervalMs;
      } else {
        return bars[len - 1].time + (i - (len - 1)) * intervalMs;
      }
    },

    _getDateParts: function(chart, date) {
      if (window.TimeZone && typeof window.TimeZone.getDateParts === 'function') {
        return window.TimeZone.getDateParts(chart, date);
      }
      const dtfOpts = { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false };
      let dtf;
      try {
        dtf = new Intl.DateTimeFormat('en-US', dtfOpts);
      } catch (e) {
        dtf = new Intl.DateTimeFormat('en-US', { ...dtfOpts, timeZone: 'UTC' });
      }
      const parts = dtf.formatToParts(date);
      const map = {};
      parts.forEach(p => map[p.type] = p.value);
      return map;
    },

    _getAdaptiveLabel: function(chart, date, prevDate) {
      const cur = window.TimeScale._getDateParts(chart, date);
      const prev = prevDate ? window.TimeScale._getDateParts(chart, prevDate) : null;
      const tsOptions = chart.options?.chartSettings?.timeScale || {};
      const timeFormat = tsOptions.timeFormat || '24-hours';
      let timePart = `${cur.hour}:${cur.minute}`;
      if (timeFormat === '12-hours') {
        let h = parseInt(cur.hour, 10);
        const m = cur.minute;
        const ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12;
        if (h === 0) h = 12;
        timePart = `${h}:${m} ${ampm}`;
      }
      const res = String(chart.resolution || '1D');
      const isIntraday = !['1D', '1d', '1W', '1w', '1M', 'D', 'W', 'M'].includes(res) && !res.endsWith('M') && !/[DwW]/i.test(res.slice(-1));
      if (!isIntraday) {
        if (!prev || cur.year !== prev.year) {
          return { text: cur.year, isBoundary: true };
        }
        if (cur.month !== prev.month) {
          return { text: cur.month, isBoundary: true };
        }
        return { text: cur.day, isBoundary: false };
      }
      if (!prev || cur.year !== prev.year) {
        return { text: cur.year, isBoundary: true };
      }
      if (cur.month !== prev.month) {
        return { text: cur.month, isBoundary: true };
      }
      if (cur.day !== prev.day) {
        return { text: `${cur.day} ${cur.month}`, isBoundary: true };
      }
      return { text: timePart, isBoundary: false };
    },

    drawTimeScale: function(chart, ctx, chartH) {
      ctx.save();
      const { startIndex, endIndex } = window.TimeScale.getVisibleRange(chart);
      const chartW = chart.logicalWidth - chart.paddingRight;
      const slot = Math.max(1, chart.candleWidth + chart.candleGap);
      const stableVisibleCount = Math.floor(chartW / slot);
      const maxLabels = Math.floor(chartW / 80);
      const labelInterval = Math.max(1, Math.floor(stableVisibleCount / maxLabels));
      const isLight = document.body.classList.contains('light-theme');
      const tsSettings = window.ChartingAPI && typeof window.ChartingAPI.getTimeScaleSettings === 'function' ? window.ChartingAPI.getTimeScaleSettings() : null;
      const startOffsetIndex = Math.ceil(startIndex / labelInterval) * labelInterval;

      for (let i = startOffsetIndex; i <= endIndex; i += labelInterval) {
        const x = chart.barToX(i);
        const time = window.TimeScale.getBarTime(chart, i);
        const date = new Date(time);
        const prevTime = window.TimeScale.getBarTime(chart, i - labelInterval);
        const prevDate = new Date(prevTime);
        const { text, isBoundary } = window.TimeScale._getAdaptiveLabel(chart, date, prevDate);

        const cvSettings = chart.options?.chartSettings?.canvas || {};
        if (cvSettings.gridType !== 'none') {
          const defaultGridColor = tsSettings && tsSettings.lineColor ? tsSettings.lineColor : (isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(42, 46, 57, 0.4)');
          const gridColor = cvSettings.gridColor || defaultGridColor;
          const gridWidth = tsSettings && tsSettings.lineWidth !== undefined ? tsSettings.lineWidth : 0.5;
          let gridDash = tsSettings && tsSettings.lineDash ? tsSettings.lineDash : [4, 4];
          if (cvSettings.gridType === 'solid') gridDash = [];
          else if (cvSettings.gridType === 'dashed') gridDash = [4, 4];

          ctx.strokeStyle = gridColor;
          ctx.lineWidth = gridWidth;
          ctx.setLineDash(gridDash);
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, chartH);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        const labelSize = tsSettings && tsSettings.fontSize ? tsSettings.fontSize : '10px';
        const labelFamily = tsSettings && tsSettings.fontFamily ? tsSettings.fontFamily : 'Inter, Arial, sans-serif';
        ctx.font = isBoundary ? `bold ${labelSize} ${labelFamily}` : `${labelSize} ${labelFamily}`;
        const labelColor = tsSettings && tsSettings.textColor ? tsSettings.textColor : (isBoundary ? (isLight ? '#131722' : '#ffffff') : (isLight ? '#707584' : '#9b9ba3'));
        ctx.fillStyle = labelColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        const labelWidth = ctx.measureText(text).width;
        if (x - labelWidth / 2 >= 0 && x + labelWidth / 2 <= chartW) {
          ctx.fillText(text, x, chartH + 8);
        }
      }
      ctx.restore();
    },

    drawTimeBadge: function(chart, ctx, chartH) {
      ctx.save();
      const hoverBarIdx = chart.xToBar(chart.mousePos.x);
      if (chart.bars && chart.bars.length > 0) {
        const time = window.TimeScale.getBarTime(chart, hoverBarIdx);
        const dateObj = new Date(time);
        const res = String(chart.resolution || '1D');
        const isIntraday = !['1D', '1d', '1W', '1w', '1M', 'D', 'W', 'M'].includes(res) && !res.endsWith('M') && !/[DwW]/i.test(res.slice(-1));
        let hoverDateStr;
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

        hoverDateStr = datePart + timePart;
        const isLight = document.body.classList.contains('light-theme');
        const settings = window.ChartingAPI && typeof window.ChartingAPI.getCrosshairSettings === 'function' ? window.ChartingAPI.getCrosshairSettings() : null;
        const bgColor = settings && settings.badgeBgColor ? settings.badgeBgColor : (isLight ? '#131722' : '#2a2e39');
        const textColor = settings && settings.badgeTextColor ? settings.badgeTextColor : '#ffffff';

        ctx.fillStyle = bgColor;
        ctx.font = '10px Inter, Arial, sans-serif';
        const badgeW = ctx.measureText(hoverDateStr).width + 12;
        const snappedX = chart.barToX(hoverBarIdx);
        const chartW = chart.logicalWidth - chart.paddingRight;
        let badgeX = snappedX;
        if (badgeX - badgeW / 2 < 0) {
          badgeX = badgeW / 2;
        } else if (badgeX + badgeW / 2 > chartW) {
          badgeX = chartW - badgeW / 2;
        }
        ctx.fillRect(badgeX - badgeW / 2, chartH + 1, badgeW, 18);
        ctx.fillStyle = textColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(hoverDateStr, badgeX, chartH + 10);
      }
      ctx.restore();
    }
  };
})(window);