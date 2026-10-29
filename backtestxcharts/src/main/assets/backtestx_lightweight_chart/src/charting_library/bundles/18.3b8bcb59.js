{
  const _0xc330b1 = "2f300b7c0f87a2f8";
  let _0x3ab283 = Math.floor(Math.random() * 520);
  const _0xa9e685 = Array.from({length: 3}, (_, i) => i + 520).reduce((acc, val) => acc + val, 0);
  if (_0x3ab283 < 0) { console.log(_0xc330b1); }
  (function() { return _0xa9e685 > 0 ? _0xc330b1 : ""; })();
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

      if (chart.priceScaleMode === PriceScaleMode.Logarithmic) {
        if (minPrice <= 0) minPrice = 0.0001;
        if (maxPrice <= minPrice) maxPrice = minPrice * 1.05;
      }

      return { minPrice, maxPrice };
    },

    drawPriceScale: function(chart, ctx, minPrice, maxPrice, chartW) {
      ctx.save();
      const isLight = document.body.classList.contains('light-theme');
      const psSettings = window.ChartingAPI && typeof window.ChartingAPI.getPriceScaleSettings === 'function' ? window.ChartingAPI.getPriceScaleSettings() : null;
      const cvSettings = chart.options?.chartSettings?.canvas || {};
      const isMobile = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (window.innerWidth <= 768);
      const labelSize = isMobile ? '10px' : (psSettings && psSettings.fontSize ? psSettings.fontSize : '11px');
      const labelFamily = psSettings && psSettings.fontFamily ? psSettings.fontFamily : 'Inter, -apple-system, BlinkMacSystemFont, Arial, sans-serif';
      ctx.font = `${labelSize} ${labelFamily}`;
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'left';

      const chartH = typeof chart.getChartHeight === 'function' ? chart.getChartHeight() : chart.logicalHeight - chart.paddingBottom;
      const priceRange = maxPrice - minPrice;
      if (chartH <= 0 || priceRange <= 0) {
        ctx.restore();
        return;
      }

      const mode = chart.priceScaleMode !== undefined ? chart.priceScaleMode : (chart.options?.priceScaleMode || PriceScaleMode.Normal);
      const basePrice = window.DecodedScale.getBasePrice(chart);
      const targetLines = Math.max(3, Math.floor(chartH / 45));
      const horzGridYList = [];
      const labelOffset = chartW + (isMobile ? 4 : 8);
      const labelColor = psSettings && psSettings.textColor ? psSettings.textColor : (isLight ? '#707584' : '#9b9ba3');

      let formatDecimals = 2;

      if (mode === PriceScaleMode.Percentage) {
        const pctMin = ((minPrice - basePrice) / (basePrice || 1)) * 100;
        const pctMax = ((maxPrice - basePrice) / (basePrice || 1)) * 100;
        const pctRange = Math.max(1e-4, pctMax - pctMin);
        const rawStep = pctRange / targetLines;
        const mag = Math.pow(10, Math.floor(Math.log10(Math.abs(rawStep) || 1)));
        const relStep = rawStep / (mag || 1);
        let niceStep = mag;
        if (relStep < 1.5) niceStep = 1 * mag;
        else if (relStep < 3.5) niceStep = 2 * mag;
        else if (relStep < 7.5) niceStep = 5 * mag;
        else niceStep = 10 * mag;

        const pctDecimals = Math.max(2, -Math.floor(Math.log10(niceStep)));
        const startMult = Math.ceil(pctMin / niceStep);
        const endMult = Math.floor(pctMax / niceStep);

        ctx.fillStyle = labelColor;
        for (let i = startMult; i <= endMult; i++) {
          const pctVal = i * niceStep;
          const priceVal = basePrice * (1 + pctVal / 100);
          const y = chart.priceToY(priceVal, minPrice, maxPrice);
          if (y < 8 || y > chartH - 8) continue;

          horzGridYList.push(y);
          const text = (pctVal >= 0 ? '+' : '') + pctVal.toFixed(pctDecimals) + '%';
          ctx.fillText(text, labelOffset, y);
        }
      } else {
        const rawStep = Math.max(1e-8, priceRange / targetLines);
        const mag = Math.pow(10, Math.floor(Math.log10(Math.abs(rawStep) || 1)));
        const relStep = rawStep / (mag || 1);
        let niceStep;
        if (relStep < 1.5) niceStep = 1 * mag;
        else if (relStep < 3.5) niceStep = 2 * mag;
        else if (relStep < 7.5) niceStep = 5 * mag;
        else niceStep = 10 * mag;

        const decimals = Math.max(0, -Math.floor(Math.log10(niceStep)));
        let minDecimals = (minPrice > 0 && minPrice < 1) ? 4 : 2;
        if (chart.symbolInfo && chart.symbolInfo.pricescale) {
          minDecimals = Math.round(Math.log10(chart.symbolInfo.pricescale));
        }
        formatDecimals = Math.max(minDecimals, decimals);

        const startMult = Math.ceil(minPrice / niceStep);
        const endMult = Math.floor(maxPrice / niceStep);

        ctx.fillStyle = labelColor;
        for (let i = startMult; i <= endMult; i++) {
          const priceVal = i * niceStep;
          const y = chart.priceToY(priceVal, minPrice, maxPrice);
          if (y < 8 || y > chartH - 8) continue;

          horzGridYList.push(y);
          ctx.fillText(priceVal.toFixed(formatDecimals), labelOffset, y);
        }
      }

      // Single-pass horizontal grid lines with sub-pixel alignment
      if (cvSettings.gridType !== 'none' && horzGridYList.length > 0) {
        ctx.save();
        const defaultGridColor = psSettings && psSettings.lineColor ? psSettings.lineColor : (isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(42, 46, 57, 0.4)');
        ctx.strokeStyle = cvSettings.gridColor || defaultGridColor;
        ctx.lineWidth = 1;
        let gridDash = [5, 5];
        if (cvSettings.gridType === 'solid') gridDash = [];
        else if (cvSettings.gridType === 'dotted') gridDash = [2, 2];
        ctx.setLineDash(gridDash);

        ctx.beginPath();
        for (let k = 0; k < horzGridYList.length; k++) {
          const gy = Math.round(horzGridYList[k]) + 0.5;
          ctx.moveTo(0, gy);
          ctx.lineTo(chartW, gy);
        }
        ctx.stroke();
        ctx.restore();
      }

      // Live price line, live price badge, and active candle countdown timer
      const lastBar = chart.bars && chart.bars.length > 0 ? chart.bars[chart.bars.length - 1] : null;
      if (lastBar) {
        const livePrice = lastBar.close ?? lastBar.value ?? 0;
        const liveY = chart.priceToY(livePrice, minPrice, maxPrice);

        if (liveY >= 0 && liveY <= chartH) {
          const isBull = lastBar.close >= (lastBar.open ?? lastBar.close);
          const liveColor = isBull ? '#089981' : '#f23645';

          // Live price dashed line across chart
          ctx.save();
          ctx.strokeStyle = liveColor;
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(0, Math.round(liveY) + 0.5);
          ctx.lineTo(chartW, Math.round(liveY) + 0.5);
          ctx.stroke();
          ctx.restore();

          // Live price badge on axis
          const labelH = 18;
          const labelY = Math.round(liveY - labelH / 2);
          const labelX = chartW + 1;
          const labelW = chart.paddingRight - 1;

          ctx.save();
          ctx.fillStyle = liveColor;
          if (ctx.roundRect) ctx.roundRect(labelX, labelY, labelW, labelH, [0, 3, 3, 0]);
          else ctx.rect(labelX, labelY, labelW, labelH);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold ' + (isMobile ? '10px' : '11px') + ' Inter, -apple-system, BlinkMacSystemFont, Arial, sans-serif';
          ctx.textBaseline = 'middle';
          ctx.textAlign = 'left';
          let livePriceText = livePrice.toFixed(formatDecimals);
          if (mode === PriceScaleMode.Percentage) {
            const pct = ((livePrice - basePrice) / (basePrice || 1)) * 100;
            livePriceText = (pct >= 0 ? '+' : '') + pct.toFixed(2) + '%';
          }
          ctx.fillText(livePriceText, labelX + 6, labelY + labelH / 2);

          // ⏱️ Active Bar Countdown Timer Pill
          const showCountdown = (chart.options?.timeScale?.showCountdown !== false) &&
                                (chart.options?.chartSettings?.scales?.countdown !== false);
          if (showCountdown) {
            const resMap = {
              '1': 60e3, '2': 2 * 60e3, '3': 3 * 60e3, '5': 5 * 60e3, '10': 10 * 60e3, '15': 15 * 60e3,
              '30': 30 * 60e3, '45': 45 * 60e3, '60': 60 * 60e3, '120': 2 * 60 * 60e3, '180': 3 * 60 * 60e3,
              '240': 4 * 60 * 60e3, '360': 6 * 60 * 60e3, '720': 12 * 60 * 60e3, '1m': 60e3, '2m': 2 * 60e3,
              '3m': 3 * 60e3, '5m': 5 * 60e3, '10m': 10 * 60e3, '15m': 15 * 60e3, '30m': 30 * 60e3,
              '45m': 45 * 60e3, '1H': 60 * 60e3, '2H': 2 * 60 * 60e3, '3H': 3 * 60 * 60e3, '4H': 4 * 60 * 60e3,
              '6H': 6 * 60 * 60e3, '12H': 12 * 60 * 60e3, '1D': 24 * 60 * 60e3, '1W': 7 * 24 * 60 * 60e3,
              '1M': 30 * 24 * 60 * 60e3
            };
            let intervalMs = resMap[chart.resolution] || 60000;
            const match = String(chart.resolution || '1m').match(/^(\d*)([a-zA-Z]+)$/);
            if (match && !resMap[chart.resolution]) {
              const val = parseInt(match[1] || '1', 10);
              const unit = match[2];
              if (unit === 's' || unit === 'S') intervalMs = val * 1000;
              else if (unit === 'm') intervalMs = val * 60 * 1000;
              else if (unit === 'H' || unit === 'h') intervalMs = val * 60 * 60 * 1000;
              else if (unit === 'D' || unit === 'd') intervalMs = val * 24 * 60 * 60 * 1000;
              else if (unit === 'W' || unit === 'w') intervalMs = val * 7 * 24 * 60 * 60 * 1000;
              else if (unit === 'M') intervalMs = val * 30 * 24 * 60 * 60 * 1000;
            }

            const barTimeMs = (lastBar.time > 1e11) ? lastBar.time : lastBar.time * 1000;
            const candleCloseTime = barTimeMs + intervalMs;
            let timeRemaining = candleCloseTime - Date.now();
            if (isNaN(timeRemaining) || timeRemaining < 0) {
              const elapsed = Math.abs(Date.now() - barTimeMs) % intervalMs;
              timeRemaining = intervalMs - elapsed;
              if (timeRemaining < 0 || isNaN(timeRemaining)) timeRemaining = 0;
            }
            const totalSec = Math.max(0, Math.floor(timeRemaining / 1000));
            const h = Math.floor(totalSec / 3600);
            const m = Math.floor((totalSec % 3600) / 60);
            const s = totalSec % 60;
            const timeStr = (h > 0 ? h + ':' : '') + m.toString().padStart(2, '0') + ':' + s.toString().padStart(2, '0');

            const cdH = 16;
            const cdY = labelY + labelH + 2;
            ctx.fillStyle = isLight ? '#e0e3eb' : '#2a2e39';
            if (ctx.roundRect) ctx.roundRect(labelX, cdY, labelW, cdH, 3);
            else ctx.rect(labelX, cdY, labelW, cdH);
            ctx.fill();

            ctx.fillStyle = isLight ? '#131722' : '#d1d4dc';
            ctx.font = (isMobile ? '9.5px' : '10px') + ' Inter, -apple-system, BlinkMacSystemFont, Arial, sans-serif';
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'left';
            ctx.fillText(timeStr, labelX + 6, cdY + cdH / 2);
          }
          ctx.restore();
        }
      }

      ctx.restore();
    },

    drawPriceBadge: function(chart, ctx, minPrice, maxPrice, chartW) {
      ctx.save();
      const hoverPrice = chart.yToPrice(chart.mousePos.y, minPrice, maxPrice);
      const isLight = document.body.classList.contains('light-theme');
      const settings = window.ChartingAPI && typeof window.ChartingAPI.getCrosshairSettings === 'function' ? window.ChartingAPI.getCrosshairSettings() : null;
      const isMobile = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (window.innerWidth <= 768);
      const bgColor = settings && settings.badgeBgColor ? settings.badgeBgColor : (isLight ? '#131722' : '#2a2e39');
      const textColor = settings && settings.badgeTextColor ? settings.badgeTextColor : '#ffffff';

      const labelH = 18;
      const labelY = Math.round(chart.mousePos.y - labelH / 2);
      const labelX = chartW + 1;
      const labelW = chart.paddingRight - 1;

      ctx.fillStyle = bgColor;
      if (ctx.roundRect) ctx.roundRect(labelX, labelY, labelW, labelH, [0, 3, 3, 0]);
      else ctx.rect(labelX, labelY, labelW, labelH);
      ctx.fill();

      ctx.fillStyle = textColor;
      ctx.font = (isMobile ? '10px' : '11px') + ' Inter, -apple-system, BlinkMacSystemFont, Arial, sans-serif';
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'left';

      const mode = chart.priceScaleMode !== undefined ? chart.priceScaleMode : (chart.options?.priceScaleMode || PriceScaleMode.Normal);
      let decimals = 2;
      if (hoverPrice > 0 && hoverPrice < 1) decimals = 4;
      if (chart.symbolInfo && chart.symbolInfo.pricescale) {
        decimals = Math.max(decimals, Math.round(Math.log10(chart.symbolInfo.pricescale)));
      }
      let label = hoverPrice.toFixed(decimals);
      if (mode === PriceScaleMode.Percentage) {
        const basePrice = window.DecodedScale.getBasePrice(chart);
        const pct = ((hoverPrice - basePrice) / (basePrice || 1)) * 100;
        label = `${hoverPrice.toFixed(decimals)} (${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%)`;
      }

      ctx.fillText(label, labelX + 6, labelY + labelH / 2);
      ctx.restore();
    }
  };
})(window);