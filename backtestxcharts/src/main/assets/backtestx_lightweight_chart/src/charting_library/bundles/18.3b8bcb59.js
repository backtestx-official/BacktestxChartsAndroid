{
  const _0x3116e8 = "354cbd38642347ac";
  let _0xed4a5f = Math.floor(Math.random() * 135);
  const _0xa204f9 = Array.from({length: 3}, (_, i) => i + 135).reduce((acc, val) => acc + val, 0);
  if (_0xed4a5f < 0) { console.log(_0x3116e8); }
  (function() { return _0xa204f9 > 0 ? _0x3116e8 : ""; })();
}
(function(window) {
  const PriceScaleMode = {
    Normal: 0,
    Logarithmic: 1,
    Percentage: 2,
    IndexedTo100: 3
  };
  window.PriceScaleMode = PriceScaleMode;

  window.DecodedScale = {
    PriceScaleMode: PriceScaleMode,

    getBasePrice: function(chart) {
      if (!chart.bars || chart.bars.length === 0) return 1;
      const { startIndex } = chart.getVisibleRange ? chart.getVisibleRange() : { startIndex: 0 };
      const idx = Math.max(0, Math.min(chart.bars.length - 1, startIndex));
      const b = chart.bars[idx];
      return (b && b.close) ? b.close : (chart.bars[0].close || 1);
    },

    priceToY: function(chart, p, minPrice, maxPrice) {
      const chartH = typeof chart.getChartHeight === 'function' ? chart.getChartHeight() : chart.logicalHeight - chart.paddingBottom;
      const range = maxPrice - minPrice;
      if (range <= 0) return chartH / 2;

      const mode = chart.priceScaleMode !== undefined ? chart.priceScaleMode : (chart.options?.priceScaleMode || PriceScaleMode.Normal);
      let y = chartH / 2;

      if (mode === PriceScaleMode.Logarithmic && minPrice > 0 && maxPrice > 0 && p > 0) {
        const logMin = Math.log10(minPrice);
        const logMax = Math.log10(maxPrice);
        const logP = Math.log10(p);
        const logRange = logMax - logMin;
        if (logRange > 0) {
          y = chartH - ((logP - logMin) / logRange) * chartH;
        }
      } else if (mode === PriceScaleMode.Percentage) {
        const basePrice = window.DecodedScale.getBasePrice(chart);
        const pctP = ((p - basePrice) / basePrice) * 100;
        const pctMin = ((minPrice - basePrice) / basePrice) * 100;
        const pctMax = ((maxPrice - basePrice) / basePrice) * 100;
        const pctRange = pctMax - pctMin;
        if (pctRange > 0) {
          y = chartH - ((pctP - pctMin) / pctRange) * chartH;
        }
      } else {
        y = chartH - ((p - minPrice) / range) * chartH;
      }

      if (chart.invertScale) {
        y = chartH - y;
      }

      return y;
    },

    yToPrice: function(chart, y, minPrice, maxPrice) {
      const chartH = typeof chart.getChartHeight === 'function' ? chart.getChartHeight() : chart.logicalHeight - chart.paddingBottom;
      const range = maxPrice - minPrice;
      if (range <= 0) return minPrice;

      let effectiveY = chart.invertScale ? (chartH - y) : y;
      const mode = chart.priceScaleMode !== undefined ? chart.priceScaleMode : (chart.options?.priceScaleMode || PriceScaleMode.Normal);

      if (mode === PriceScaleMode.Logarithmic && minPrice > 0 && maxPrice > 0) {
        const logMin = Math.log10(minPrice);
        const logMax = Math.log10(maxPrice);
        const logRange = logMax - logMin;
        const logP = logMax - (effectiveY / chartH) * logRange;
        return Math.pow(10, logP);
      } else if (mode === PriceScaleMode.Percentage) {
        const basePrice = window.DecodedScale.getBasePrice(chart);
        const pctMin = ((minPrice - basePrice) / basePrice) * 100;
        const pctMax = ((maxPrice - basePrice) / basePrice) * 100;
        const pctRange = pctMax - pctMin;
        const pctP = pctMax - (effectiveY / chartH) * pctRange;
        return basePrice * (1 + pctP / 100);
      }

      return maxPrice - (effectiveY / chartH) * range;
    },

    getVisibleMinMax: function(chart) {
      const { startIndex, endIndex } = chart.getVisibleRange ? chart.getVisibleRange() : { startIndex: 0, endIndex: chart.bars ? chart.bars.length - 1 : 0 };
      let minPrice = Infinity;
      let maxPrice = -Infinity;
      const len = chart.bars ? chart.bars.length : 0;
      if (len > 0) {
        const activeStart = Math.max(0, Math.min(len - 1, startIndex));
        const activeEnd = Math.max(0, Math.min(len - 1, endIndex));
        for (let i = activeStart; i <= activeEnd; i++) {
          const b = chart.bars[i];
          if (b) {
            const lowVal = b.low !== undefined ? b.low : (b.yield !== undefined ? b.yield : (b.price !== undefined ? b.price : b.y));
            const highVal = b.high !== undefined ? b.high : (b.yield !== undefined ? b.yield : (b.price !== undefined ? b.price : b.y));
            if (lowVal !== undefined && lowVal < minPrice) minPrice = lowVal;
            if (highVal !== undefined && highVal > maxPrice) maxPrice = highVal;
          }
        }
      }

      if (chart._priceLines && chart._priceLines.length > 0) {
        chart._priceLines.forEach(pl => {
          if (pl.price < minPrice) minPrice = pl.price;
          if (pl.price > maxPrice) maxPrice = pl.price;
        });
      }

      if (minPrice === Infinity || maxPrice === -Infinity) {
        minPrice = 100;
        maxPrice = 200;
      }

      const range = maxPrice - minPrice;
      const topMargin = chart.scaleMargins?.top ?? 0.08;
      const bottomMargin = chart.scaleMargins?.bottom ?? 0.08;

      if (range <= 0) {
        minPrice -= 1.0;
        maxPrice += 1.0;
      } else {
        minPrice -= range * bottomMargin;
        maxPrice += range * topMargin;
      }

      const priceScaleZoom = chart.priceScaleZoom ?? 1.0;
      const priceScaleOffset = chart.priceScaleOffset ?? 0;
      if (priceScaleZoom === 1.0 && priceScaleOffset === 0) {
        chart.savedAutoMin = minPrice;
        chart.savedAutoMax = maxPrice;
      } else if (chart.savedAutoMin !== undefined && chart.savedAutoMax !== undefined) {
        minPrice = chart.savedAutoMin;
        maxPrice = chart.savedAutoMax;
      }

      const center = (maxPrice + minPrice) / 2 + priceScaleOffset;
      const halfRange = ((maxPrice - minPrice) / 2) / priceScaleZoom;
      minPrice = center - halfRange;
      maxPrice = center + halfRange;

      if (chart.priceScaleMode === PriceScaleMode.Logarithmic && minPrice <= 0) {
        minPrice = 0.0001;
      }

      return { minPrice, maxPrice };
    },

    drawPriceScale: function(chart, ctx, minPrice, maxPrice, chartW) {
      ctx.save();
      const isLight = document.body.classList.contains('light-theme');
      const psSettings = window.ChartingAPI && typeof window.ChartingAPI.getPriceScaleSettings === 'function' ? window.ChartingAPI.getPriceScaleSettings() : null;
      const labelSize = psSettings && psSettings.fontSize ? psSettings.fontSize : '10.5px';
      const labelFamily = psSettings && psSettings.fontFamily ? psSettings.fontFamily : 'Inter, Arial, sans-serif';
      ctx.font = `${labelSize} ${labelFamily}`;
      ctx.textBaseline = 'middle';
      const chartH = typeof chart.getChartHeight === 'function' ? chart.getChartHeight() : chart.logicalHeight - chart.paddingBottom;
      const priceRange = maxPrice - minPrice;
      if (priceRange <= 0) {
        ctx.restore();
        return;
      }

      const mode = chart.priceScaleMode !== undefined ? chart.priceScaleMode : (chart.options?.priceScaleMode || PriceScaleMode.Normal);
      const basePrice = window.DecodedScale.getBasePrice(chart);
      const targetLines = Math.max(3, Math.floor(chartH / 45));

      if (mode === PriceScaleMode.Percentage) {
        const pctMin = ((minPrice - basePrice) / basePrice) * 100;
        const pctMax = ((maxPrice - basePrice) / basePrice) * 100;
        const pctRange = pctMax - pctMin;
        const rawStep = pctRange / targetLines;
        const mag = Math.pow(10, Math.floor(Math.log10(Math.abs(rawStep) || 1)));
        const relStep = rawStep / mag;
        let niceStep = mag;
        if (relStep < 1.5) niceStep = 1 * mag;
        else if (relStep < 3.5) niceStep = 2 * mag;
        else if (relStep < 7.5) niceStep = 5 * mag;
        else niceStep = 10 * mag;

        const startMult = Math.ceil(pctMin / niceStep);
        const endMult = Math.floor(pctMax / niceStep);

        for (let i = startMult; i <= endMult; i++) {
          const pctVal = i * niceStep;
          const priceVal = basePrice * (1 + pctVal / 100);
          const y = chart.priceToY(priceVal, minPrice, maxPrice);
          if (y < 4 || y > chartH - 4) continue;

          window.DecodedScale._drawGridAndLabel(chart, ctx, chartW, y, (pctVal >= 0 ? '+' : '') + pctVal.toFixed(2) + '%', isLight, psSettings);
        }
      } else {
        const rawStep = priceRange / targetLines;
        const mag = Math.pow(10, Math.floor(Math.log10(rawStep)));
        const relStep = rawStep / mag;
        let niceStep;
        if (relStep < 1.5) niceStep = 1 * mag;
        else if (relStep < 3.5) niceStep = 2 * mag;
        else if (relStep < 7.5) niceStep = 5 * mag;
        else niceStep = 10 * mag;

        const decimals = Math.max(0, -Math.floor(Math.log10(niceStep)));
        const formatDecimals = decimals === 0 ? 2 : decimals;
        const startMult = Math.ceil(minPrice / niceStep);
        const endMult = Math.floor(maxPrice / niceStep);

        for (let i = startMult; i <= endMult; i++) {
          const priceVal = i * niceStep;
          const y = chart.priceToY(priceVal, minPrice, maxPrice);
          if (y < 4 || y > chartH - 4) continue;

          window.DecodedScale._drawGridAndLabel(chart, ctx, chartW, y, priceVal.toFixed(formatDecimals), isLight, psSettings);
        }
      }

      ctx.restore();
    },

    _drawGridAndLabel: function(chart, ctx, chartW, y, labelText, isLight, psSettings) {
      const cvSettings = chart.options?.chartSettings?.canvas || {};
      if (cvSettings.gridType !== 'none') {
        const defaultGridColor = psSettings && psSettings.lineColor ? psSettings.lineColor : (isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(42, 46, 57, 0.4)');
        const gridColor = cvSettings.gridColor || defaultGridColor;
        const gridWidth = psSettings && psSettings.lineWidth !== undefined ? psSettings.lineWidth : 0.5;
        let gridDash = psSettings && psSettings.lineDash ? psSettings.lineDash : [4, 4];
        if (cvSettings.gridType === 'solid') gridDash = [];
        else if (cvSettings.gridType === 'dashed') gridDash = [4, 4];

        ctx.strokeStyle = gridColor;
        ctx.lineWidth = gridWidth;
        ctx.setLineDash(gridDash);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(chartW, y);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      const labelColor = psSettings && psSettings.textColor ? psSettings.textColor : (isLight ? '#707584' : '#9b9ba3');
      ctx.fillStyle = labelColor;
      ctx.fillText(labelText, chartW + 8, y);
    },

    drawPriceBadge: function(chart, ctx, minPrice, maxPrice, chartW) {
      ctx.save();
      const hoverPrice = chart.yToPrice(chart.mousePos.y, minPrice, maxPrice);
      const isLight = document.body.classList.contains('light-theme');
      const settings = window.ChartingAPI && typeof window.ChartingAPI.getCrosshairSettings === 'function' ? window.ChartingAPI.getCrosshairSettings() : null;
      const bgColor = settings && settings.badgeBgColor ? settings.badgeBgColor : (isLight ? '#131722' : '#2a2e39');
      const textColor = settings && settings.badgeTextColor ? settings.badgeTextColor : '#ffffff';

      ctx.fillStyle = bgColor;
      ctx.fillRect(chartW + 1, chart.mousePos.y - 9, chart.paddingRight - 1, 18);
      ctx.fillStyle = textColor;
      ctx.font = '10px Inter, Arial, sans-serif';
      ctx.textBaseline = 'middle';

      const mode = chart.priceScaleMode !== undefined ? chart.priceScaleMode : (chart.options?.priceScaleMode || PriceScaleMode.Normal);
      let label = hoverPrice.toFixed(2);
      if (mode === PriceScaleMode.Percentage) {
        const basePrice = window.DecodedScale.getBasePrice(chart);
        const pct = ((hoverPrice - basePrice) / basePrice) * 100;
        label = `${hoverPrice.toFixed(2)} (${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%)`;
      }

      ctx.fillText(label, chartW + 8, chart.mousePos.y);
      ctx.restore();
    }
  };
})(window);