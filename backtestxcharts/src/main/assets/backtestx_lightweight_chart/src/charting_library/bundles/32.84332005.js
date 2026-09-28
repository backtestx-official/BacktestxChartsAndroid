{
  const _0x0a5bb3 = "91f10351adb3e2e6";
  let _0x806f29 = Math.floor(Math.random() * 160);
  const _0x176b83 = Array.from({length: 3}, (_, i) => i + 160).reduce((acc, val) => acc + val, 0);
  if (_0x806f29 < 0) { console.log(_0x0a5bb3); }
  (function() { return _0x176b83 > 0 ? _0x0a5bb3 : ""; })();
}
(function(window) {
  if (!window.BacktestxChartCore) {
    console.error("BacktestxChartCore bundle not loaded.");
    return;
  }

  class BacktestxChart extends window.BacktestxChartCore {
    constructor(containerId, options = {}) {
      super(containerId, options);
      const scaleType = options.horizontalScale || 'time';
      const registeredScale = window.ChartingAPI ? window.ChartingAPI.getHorizontalScale(scaleType) : null;
      if (registeredScale) {
        this.horizontalScale = registeredScale;
      } else if (scaleType === 'yield-curve') {
        this.horizontalScale = window.YieldScale;
      } else if (scaleType === 'strike-price') {
        this.horizontalScale = window.StrikeScale;
      } else {
        this.horizontalScale = window.TimeScale;
      }

      if (scaleType !== 'time' && this.chartType === 'candlestick') {
        this.customDrawCandles = window.ChartingAPI ? window.ChartingAPI.getCandleRenderer('line') : null;
      }
      this._primitives = [];
      this._extraSeries = [];
      console.log(`⚖️ [BacktestxChart] Initialized with scale: ${scaleType}`);
    }

    // ─── Lightweight Charts Multi-Series APIs ──────────────────────────────────
    _createSeriesWrapper(type, options = {}) {
      const self = this;
      const seriesObj = {
        type: type,
        options: options,
        data: [],
        markersList: [],
        priceLinesList: [],
        setData: function(data) {
          seriesObj.data = Array.isArray(data) ? [...data] : [];
          if (self.bars.length === 0 && seriesObj.data.length > 0) {
            self.bars = seriesObj.data.map(d => ({
              time: d.time,
              open: d.open ?? d.value ?? 0,
              high: d.high ?? d.value ?? 0,
              low: d.low ?? d.value ?? 0,
              close: d.close ?? d.value ?? 0,
              volume: d.volume ?? 0
            }));
          }
          self.render();
        },
        update: function(bar) {
          if (!bar) return;
          const idx = seriesObj.data.findIndex(b => b.time === bar.time);
          if (idx !== -1) {
            seriesObj.data[idx] = bar;
          } else {
            seriesObj.data.push(bar);
          }
          // Sync with primary bars
          if (self.bars.length > 0) {
            const lastBar = self.bars[self.bars.length - 1];
            if (bar.time === lastBar.time) {
              self.bars[self.bars.length - 1] = {
                time: bar.time,
                open: bar.open ?? bar.value ?? lastBar.open,
                high: bar.high ?? bar.value ?? lastBar.high,
                low: bar.low ?? bar.value ?? lastBar.low,
                close: bar.close ?? bar.value ?? lastBar.close,
                volume: bar.volume ?? lastBar.volume
              };
            } else {
              self.bars.push({
                time: bar.time,
                open: bar.open ?? bar.value ?? 0,
                high: bar.high ?? bar.value ?? 0,
                low: bar.low ?? bar.value ?? 0,
                close: bar.close ?? bar.value ?? 0,
                volume: bar.volume ?? 0
              });
            }
          }
          self.render();
        },
        setMarkers: function(markers) {
          seriesObj.markersList = Array.isArray(markers) ? [...markers] : [];
          self._markers = seriesObj.markersList;
          self.render();
        },
        markers: function() {
          return seriesObj.markersList;
        },
        createPriceLine: function(opts) {
          const pl = self.createPriceLine(opts);
          seriesObj.priceLinesList.push(pl);
          return pl;
        },
        removePriceLine: function(line) {
          self.removePriceLine(line);
          const idx = seriesObj.priceLinesList.indexOf(line);
          if (idx !== -1) seriesObj.priceLinesList.splice(idx, 1);
        },
        applyOptions: function(opts) {
          seriesObj.options = { ...seriesObj.options, ...opts };
          self.render();
        },
        priceToCoordinate: function(p) {
          const mm = self.getVisibleMinMax();
          return self.priceToY(p, mm.minPrice, mm.maxPrice);
        },
        coordinateToPrice: function(y) {
          const mm = self.getVisibleMinMax();
          return self.yToPrice(y, mm.minPrice, mm.maxPrice);
        }
      };

      this._extraSeries.push(seriesObj);
      return seriesObj;
    }

    addCandlestickSeries(options = {}) {
      this.setChartType('candlestick');
      return this._createSeriesWrapper('candlestick', options);
    }

    addAreaSeries(options = {}) {
      this.setChartType('area');
      this.options.areaSettings = options;
      return this._createSeriesWrapper('area', options);
    }

    addLineSeries(options = {}) {
      this.setChartType('line');
      return this._createSeriesWrapper('line', options);
    }

    addBarSeries(options = {}) {
      this.setChartType('bar');
      return this._createSeriesWrapper('bar', options);
    }

    addBaselineSeries(options = {}) {
      this.setChartType('baseline');
      this.options.baselineSettings = options;
      return this._createSeriesWrapper('baseline', options);
    }

    addHistogramSeries(options = {}) {
      this.setChartType('histogram');
      this.options.histogramSettings = options;
      return this._createSeriesWrapper('histogram', options);
    }

    attachPrimitive(primitive) {
      if (!this._primitives) {
        this._primitives = [];
      }
      if (!this._primitives.includes(primitive)) {
        this._primitives.push(primitive);
        if (typeof primitive.attached === 'function') {
          primitive.attached({
            chart: this,
            requestUpdate: () => this.render()
          });
        }
        this.render();
      }
    }

    detachPrimitive(primitive) {
      if (this._primitives) {
        const idx = this._primitives.indexOf(primitive);
        if (idx !== -1) {
          this._primitives.splice(idx, 1);
          if (typeof primitive.detached === 'function') {
            primitive.detached();
          }
          this.render();
        }
      }
    }

    barToX(i) {
      return (this.horizontalScale || window.TimeScale).barToX(this, i);
    }

    xToBar(x) {
      return (this.horizontalScale || window.TimeScale).xToBar(this, x);
    }

    getChartHeight() {
      const H = this.logicalHeight;
      const activeIndicators = (this.indicators || []).map(ind => {
        const config = window.ChartingAPI ? window.ChartingAPI.getIndicator(ind.type) : null;
        return { ind, config };
      }).filter(x => x.config);
      const paneIndicators = activeIndicators.filter(x => x.config.type === 'pane');
      const SUB_PANEL_H = 80;
      const numPanels = paneIndicators.length;
      const totalPanelsH = numPanels * SUB_PANEL_H;
      return Math.max(100, H - this.paddingBottom - totalPanelsH);
    }

    priceToY(p, minPrice, maxPrice) {
      if (minPrice === undefined || maxPrice === undefined) {
        const mm = this.getVisibleMinMax();
        minPrice = mm.minPrice;
        maxPrice = mm.maxPrice;
      }
      return window.DecodedScale.priceToY(this, p, minPrice, maxPrice);
    }

    yToPrice(y, minPrice, maxPrice) {
      if (minPrice === undefined || maxPrice === undefined) {
        const mm = this.getVisibleMinMax();
        minPrice = mm.minPrice;
        maxPrice = mm.maxPrice;
      }
      return window.DecodedScale.yToPrice(this, y, minPrice, maxPrice);
    }

    getVisibleRange() {
      return (this.horizontalScale || window.TimeScale).getVisibleRange(this);
    }

    getVisibleMinMax() {
      return window.DecodedScale.getVisibleMinMax(this);
    }

    render() {
      const ctx = this.ctx;
      const W = this.logicalWidth;
      const H = this.logicalHeight;
      const chartW = W - this.paddingRight;

      const activeIndicators = (this.indicators || []).map(ind => {
        const config = window.ChartingAPI ? window.ChartingAPI.getIndicator(ind.type) : null;
        return { ind, config };
      }).filter(x => x.config);
      const paneIndicators = activeIndicators.filter(x => x.config.type === 'pane');
      const overlayIndicators = activeIndicators.filter(x => x.config.type === 'overlay');

      const SUB_PANEL_H = 80;
      const numPanels = paneIndicators.length;
      const totalPanelsH = numPanels * SUB_PANEL_H;
      const chartH = Math.max(100, H - this.paddingBottom - totalPanelsH);

      ctx.clearRect(0, 0, W, H);

      const isLight = document.body.classList.contains('light-theme');
      const cvSettingsBg = this.options?.chartSettings?.canvas || {};
      ctx.fillStyle = cvSettingsBg.bgColor || (isLight ? '#ffffff' : '#131722');
      ctx.fillRect(0, 0, W, H);

      const psSettings = window.ChartingAPI && typeof window.ChartingAPI.getPriceScaleSettings === 'function' ? window.ChartingAPI.getPriceScaleSettings() : null;
      const tsSettings = window.ChartingAPI && typeof window.ChartingAPI.getTimeScaleSettings === 'function' ? window.ChartingAPI.getTimeScaleSettings() : null;

      if (psSettings && psSettings.axisBackgroundColor) {
        ctx.fillStyle = psSettings.axisBackgroundColor;
        ctx.fillRect(chartW, 0, this.paddingRight, H);
      }
      if (tsSettings && tsSettings.axisBackgroundColor) {
        ctx.fillStyle = tsSettings.axisBackgroundColor;
        ctx.fillRect(0, chartH + totalPanelsH, W, this.paddingBottom);
      }

      if (this.bars.length === 0) return;

      const { minPrice, maxPrice } = this.getVisibleMinMax();

      // 1. Draw Scales
      window.DecodedScale.drawPriceScale(this, ctx, minPrice, maxPrice, chartW);
      if (this._primitives && this._primitives.length > 0) {
        this._primitives.forEach(p => {
          if (typeof p.drawPriceScale === 'function') {
            try {
              ctx.save();
              p.drawPriceScale(ctx, this.paddingRight, chartH);
              ctx.restore();
            } catch (e) {
              console.error("Error drawing price scale primitive:", e);
            }
          }
        });
      }

      (this.horizontalScale || window.TimeScale).drawTimeScale(this, ctx, chartH + totalPanelsH);
      if (this._primitives && this._primitives.length > 0) {
        this._primitives.forEach(p => {
          if (typeof p.drawTimeScale === 'function') {
            try {
              ctx.save();
              p.drawTimeScale(ctx, chartW, this.paddingBottom);
              ctx.restore();
            } catch (e) {
              console.error("Error drawing time scale primitive:", e);
            }
          }
        });
      }

      // 2. Draw Chart Series Content (Clipped to main chart viewport)
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, chartW, chartH);
      ctx.clip();

      if (window.Watermarks && typeof window.Watermarks.draw === 'function') {
        window.Watermarks.draw(this, ctx, chartW, chartH);
      }

      if (this._primitives && this._primitives.length > 0) {
        this._primitives.forEach(p => {
          if (typeof p.drawBackground === 'function') {
            try {
              ctx.save();
              p.drawBackground(ctx, chartW, chartH);
              ctx.restore();
            } catch (e) {
              console.error("Error drawing background primitive:", e);
            }
          }
        });
      }

      const { startIndex: rawStart, endIndex: rawEnd } = this.getVisibleRange();
      const len = this.bars.length;
      const startIndex = Math.max(0, Math.min(len - 1, rawStart));
      const endIndex = Math.max(0, Math.min(len - 1, rawEnd));
      const cs = this.options?.chartSettings?.symbol || {};
      const T = { bullColor: cs.bodyBull || '#26a69a', bearColor: cs.bodyBear || '#ef5350' };

      // Check chart type: custom vs built-in area / baseline / histogram / candle
      if (this.chartType === 'area') {
        // Area Series Rendering with vertical gradient
        const areaOpts = this.options?.areaSettings || {};
        const lineColor = areaOpts.lineColor || '#2962ff';
        const topColor = areaOpts.topColor || 'rgba(41, 98, 255, 0.28)';
        const bottomColor = areaOpts.bottomColor || 'rgba(41, 98, 255, 0.0)';
        const lineWidth = areaOpts.lineWidth || 2;

        ctx.save();
        ctx.beginPath();
        for (let i = startIndex; i <= endIndex; i++) {
          const x = this.barToX(i);
          const y = this.priceToY(this.bars[i].close, minPrice, maxPrice);
          if (i === startIndex) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = lineWidth;
        ctx.stroke();

        // Fill area gradient
        const startX = this.barToX(startIndex);
        const endX = this.barToX(endIndex);
        ctx.lineTo(endX, chartH);
        ctx.lineTo(startX, chartH);
        ctx.closePath();

        const grad = ctx.createLinearGradient(0, 0, 0, chartH);
        grad.addColorStop(0, topColor);
        grad.addColorStop(1, bottomColor);
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore();
      } else if (this.chartType === 'baseline') {
        // Baseline Series Rendering
        const blOpts = this.options?.baselineSettings || {};
        const baseValue = blOpts.baseValue?.price ?? ((minPrice + maxPrice) / 2);
        const baseY = this.priceToY(baseValue, minPrice, maxPrice);

        ctx.save();
        // Line
        ctx.beginPath();
        for (let i = startIndex; i <= endIndex; i++) {
          const x = this.barToX(i);
          const y = this.priceToY(this.bars[i].close, minPrice, maxPrice);
          if (i === startIndex) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = '#2962ff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Baseline guideline
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(0, baseY);
        ctx.lineTo(chartW, baseY);
        ctx.stroke();
        ctx.restore();
      } else if (this.chartType === 'histogram') {
        // Histogram Series Rendering
        const slot = this.candleWidth + this.candleGap;
        const bodyW = Math.max(1, this.candleWidth);
        const basePrice = 0;
        const baseY = this.priceToY(basePrice, minPrice, maxPrice);

        ctx.save();
        for (let i = startIndex; i <= endIndex; i++) {
          const bar = this.bars[i];
          const x = this.barToX(i);
          const y = this.priceToY(bar.close, minPrice, maxPrice);
          const isUp = bar.close >= (bar.open ?? basePrice);
          ctx.fillStyle = bar.color || (isUp ? '#26a69a' : '#ef5350');
          const top = Math.min(y, baseY);
          const h = Math.max(1, Math.abs(y - baseY));
          ctx.fillRect(x - bodyW / 2, top, bodyW, h);
        }
        ctx.restore();
      } else if (this.customDrawCandles) {
        const slot = this.candleWidth + this.candleGap;
        const bodyW = this.candleWidth;
        const visibleBars = this.bars.slice(startIndex, endIndex + 1);
        const xOffset = this.barToX(startIndex) - slot / 2;
        this.customDrawCandles(
          ctx, visibleBars, slot, bodyW, chartH,
          (p) => this.priceToY(p, minPrice, maxPrice),
          T, xOffset, this
        );
      } else {
        // Default Candlesticks
        ctx.save();
        const showBody = cs.showBody !== false;
        const showBorders = cs.showBorders !== false;
        const showWick = cs.showWick !== false;
        const bodyBull = cs.bodyBull || '#26a69a';
        const bodyBear = cs.bodyBear || '#ef5350';
        const borderBull = cs.borderBull || '#26a69a';
        const borderBear = cs.borderBear || '#ef5350';
        const wickBull = cs.wickBull || '#26a69a';
        const wickBear = cs.wickBear || '#ef5350';
        const bodyW = this.candleWidth;

        if (showWick) {
          ctx.strokeStyle = wickBull;
          ctx.lineWidth = 1;
          ctx.beginPath();
          for (let i = startIndex; i <= endIndex; i++) {
            const bar = this.bars[i];
            if (bar.close >= bar.open) {
              const x = this.barToX(i);
              const yHigh = this.priceToY(bar.high, minPrice, maxPrice);
              const yLow = this.priceToY(bar.low, minPrice, maxPrice);
              ctx.moveTo(x, yHigh);
              ctx.lineTo(x, yLow);
            }
          }
          ctx.stroke();

          ctx.strokeStyle = wickBear;
          ctx.beginPath();
          for (let i = startIndex; i <= endIndex; i++) {
            const bar = this.bars[i];
            if (bar.close < bar.open) {
              const x = this.barToX(i);
              const yHigh = this.priceToY(bar.high, minPrice, maxPrice);
              const yLow = this.priceToY(bar.low, minPrice, maxPrice);
              ctx.moveTo(x, yHigh);
              ctx.lineTo(x, yLow);
            }
          }
          ctx.stroke();
        }

        if (showBody) {
          ctx.fillStyle = bodyBull;
          ctx.beginPath();
          for (let i = startIndex; i <= endIndex; i++) {
            const bar = this.bars[i];
            if (bar.close >= bar.open) {
              const x = this.barToX(i);
              const yOpen = this.priceToY(bar.open, minPrice, maxPrice);
              const yClose = this.priceToY(bar.close, minPrice, maxPrice);
              const bodyTop = Math.min(yOpen, yClose);
              const bodyH = Math.max(1, Math.abs(yClose - yOpen));
              ctx.rect(x - bodyW / 2, bodyTop, bodyW, bodyH);
            }
          }
          ctx.fill();

          ctx.fillStyle = bodyBear;
          ctx.beginPath();
          for (let i = startIndex; i <= endIndex; i++) {
            const bar = this.bars[i];
            if (bar.close < bar.open) {
              const x = this.barToX(i);
              const yOpen = this.priceToY(bar.open, minPrice, maxPrice);
              const yClose = this.priceToY(bar.close, minPrice, maxPrice);
              const bodyTop = Math.min(yOpen, yClose);
              const bodyH = Math.max(1, Math.abs(yClose - yOpen));
              ctx.rect(x - bodyW / 2, bodyTop, bodyW, bodyH);
            }
          }
          ctx.fill();
        }

        if (showBorders) {
          ctx.strokeStyle = borderBull;
          ctx.lineWidth = 1;
          ctx.beginPath();
          for (let i = startIndex; i <= endIndex; i++) {
            const bar = this.bars[i];
            if (bar.close >= bar.open) {
              const x = this.barToX(i);
              const yOpen = this.priceToY(bar.open, minPrice, maxPrice);
              const yClose = this.priceToY(bar.close, minPrice, maxPrice);
              const bodyTop = Math.min(yOpen, yClose);
              const bodyH = Math.max(1, Math.abs(yClose - yOpen));
              ctx.rect(x - bodyW / 2, bodyTop, bodyW, bodyH);
            }
          }
          ctx.stroke();

          ctx.strokeStyle = borderBear;
          ctx.beginPath();
          for (let i = startIndex; i <= endIndex; i++) {
            const bar = this.bars[i];
            if (bar.close < bar.open) {
              const x = this.barToX(i);
              const yOpen = this.priceToY(bar.open, minPrice, maxPrice);
              const yClose = this.priceToY(bar.close, minPrice, maxPrice);
              const bodyTop = Math.min(yOpen, yClose);
              const bodyH = Math.max(1, Math.abs(yClose - yOpen));
              ctx.rect(x - bodyW / 2, bodyTop, bodyW, bodyH);
            }
          }
          ctx.stroke();
        }
        ctx.restore();
      }

      // 3. Draw Series Markers
      if (this._markers && this._markers.length > 0) {
        ctx.save();
        this._markers.forEach(m => {
          let barIdx = -1;
          if (m.time !== undefined) {
            for (let i = startIndex; i <= endIndex; i++) {
              if (this.bars[i].time === m.time) {
                barIdx = i;
                break;
              }
            }
          }
          if (barIdx !== -1) {
            const bar = this.bars[barIdx];
            const x = this.barToX(barIdx);
            const highY = this.priceToY(bar.high, minPrice, maxPrice);
            const lowY = this.priceToY(bar.low, minPrice, maxPrice);
            const color = m.color || '#2196F3';
            const shape = m.shape || 'arrowUp';
            const pos = m.position || (shape === 'arrowUp' ? 'belowBar' : 'aboveBar');
            const y = pos === 'aboveBar' ? (highY - 14) : (pos === 'belowBar' ? (lowY + 14) : (highY + lowY) / 2);

            ctx.fillStyle = color;
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;

            if (shape === 'arrowUp') {
              ctx.beginPath();
              ctx.moveTo(x, y - 8);
              ctx.lineTo(x - 6, y + 4);
              ctx.lineTo(x + 6, y + 4);
              ctx.closePath();
              ctx.fill();
            } else if (shape === 'arrowDown') {
              ctx.beginPath();
              ctx.moveTo(x, y + 8);
              ctx.lineTo(x - 6, y - 4);
              ctx.lineTo(x + 6, y - 4);
              ctx.closePath();
              ctx.fill();
            } else if (shape === 'circle') {
              ctx.beginPath();
              ctx.arc(x, y, 5, 0, 2 * Math.PI);
              ctx.fill();
            } else if (shape === 'square') {
              ctx.fillRect(x - 4, y - 4, 8, 8);
            }

            if (m.text) {
              ctx.font = 'bold 9px Inter, Arial, sans-serif';
              ctx.textAlign = 'center';
              ctx.textBaseline = pos === 'aboveBar' ? 'bottom' : 'top';
              ctx.fillText(m.text, x, pos === 'aboveBar' ? y - 10 : y + 10);
            }
          }
        });
        ctx.restore();
      }

      // 4. Draw Dynamic Price Lines
      if (this._priceLines && this._priceLines.length > 0) {
        ctx.save();
        this._priceLines.forEach(pl => {
          const y = this.priceToY(pl.price, minPrice, maxPrice);
          if (y >= 0 && y <= chartH) {
            ctx.strokeStyle = pl.color || '#2962ff';
            ctx.lineWidth = pl.lineWidth || 1;
            if (pl.lineStyle === 'dashed') ctx.setLineDash([6, 4]);
            else if (pl.lineStyle === 'dotted') ctx.setLineDash([2, 3]);
            else ctx.setLineDash([]);

            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(chartW, y);
            ctx.stroke();

            if (pl.title) {
              ctx.fillStyle = pl.color || '#2962ff';
              ctx.font = '10px Inter, Arial, sans-serif';
              ctx.textAlign = 'left';
              ctx.textBaseline = 'bottom';
              ctx.fillText(pl.title, 8, y - 3);
            }
          }
        });
        ctx.restore();
      }

      // 5. Draw Trendlines & Drawings
      if (window.Drawings) {
        window.Drawings.drawTrendlines(this, ctx, minPrice, maxPrice);
        window.Drawings.drawActivePreview(this, ctx, minPrice, maxPrice);
      }

      // 6. Draw Indicators
      overlayIndicators.forEach(x => {
        try {
          const values = x.config.calculate(this.bars, x.ind.params);
          ctx.save();
          x.config.render(ctx, this, values, { startIndex, endIndex, chartW, chartH }, x.ind.color);
          ctx.restore();
        } catch (e) {
          console.error(`Error rendering overlay indicator ${x.ind.type}:`, e);
        }
      });

      if (this._primitives && this._primitives.length > 0) {
        this._primitives.forEach(p => {
          if (typeof p.draw === 'function') {
            try {
              ctx.save();
              p.draw(ctx, chartW, chartH);
              ctx.restore();
            } catch (e) {
              console.error("Error drawing foreground primitive:", e);
            }
          }
        });
      }

      ctx.restore();

      // 7. Watermark Logo
      const watermarkLogoSettings = window.ChartingAPI && typeof window.ChartingAPI.getWatermarkLogoSettings === 'function' ? window.ChartingAPI.getWatermarkLogoSettings() : null;
      if (watermarkLogoSettings && watermarkLogoSettings.show !== false) {
        if (this.logoUrl !== watermarkLogoSettings.logoUrl) {
          this.logoUrl = watermarkLogoSettings.logoUrl;
          this.logoLoaded = false;
          this.logoImg = new Image();
          this.logoImg.crossOrigin = "anonymous";
          this.logoImg.onload = () => {
            this.logoLoaded = true;
            this.render();
          };
          this.logoImg.onerror = () => {
            console.error("Failed to load watermark logo image:", this.logoUrl);
          };
          this.logoImg.src = this.logoUrl;
        }
        if (this.logoLoaded && this.logoImg) {
          ctx.save();
          const badgeX = 12;
          const badgeY = chartH - 46;
          const badgeH = 34;
          const logoSize = 18;
          const radius = 17;
          ctx.font = 'bold 12px Inter, Arial, sans-serif';
          const text = watermarkLogoSettings.text || 'Chart by BacktestX';
          const textWidth = ctx.measureText(text).width;
          const expandedW = 10 + logoSize + 8 + textWidth + 12;
          this.watermarkExpandedWidth = expandedW;
          const progress = this.watermarkProgress ?? 0;
          const badgeW = badgeH + progress * (expandedW - badgeH);
          const isDarkTheme = !isLight;

          ctx.fillStyle = isDarkTheme ? 'rgba(28, 30, 36, 0.75)' : 'rgba(255, 255, 255, 0.85)';
          ctx.strokeStyle = isDarkTheme ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          if (ctx.roundRect) ctx.roundRect(badgeX, badgeY, badgeW, badgeH, radius);
          else ctx.rect(badgeX, badgeY, badgeW, badgeH);
          ctx.fill();
          ctx.stroke();

          ctx.save();
          ctx.beginPath();
          if (ctx.roundRect) ctx.roundRect(badgeX, badgeY, badgeW, badgeH, radius);
          else ctx.rect(badgeX, badgeY, badgeW, badgeH);
          ctx.clip();
          const collapsedLogoX = badgeX + (badgeH - logoSize) / 2;
          const expandedLogoX = badgeX + 10;
          const logoX = collapsedLogoX + progress * (expandedLogoX - collapsedLogoX);
          const logoY = badgeY + (badgeH - logoSize) / 2;
          try {
            ctx.drawImage(this.logoImg, logoX, logoY, logoSize, logoSize);
          } catch (e) {}
          ctx.fillStyle = isDarkTheme ? '#ffffff' : '#131722';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          ctx.globalAlpha = Math.max(0, Math.min(1, (progress - 0.2) / 0.8));
          ctx.fillText(text, expandedLogoX + logoSize + 8, badgeY + badgeH / 2);
          ctx.restore();
          ctx.restore();
        }
      }

      // 8. Status Line (OHLC)
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, chartW - 5, this.logicalHeight);
      ctx.clip();
      ctx.textBaseline = 'top';
      ctx.textAlign = 'left';

      const statusHoverBarIdx = this.isMouseOver ? this.xToBar(this.mousePos.x) : this.bars.length - 1;
      const activeBar = (statusHoverBarIdx >= 0 && statusHoverBarIdx < this.bars.length) ? this.bars[statusHoverBarIdx] : this.bars[this.bars.length - 1];

      if (activeBar) {
        const isUp = activeBar.close >= activeBar.open;
        const textColor = isLight ? '#131722' : '#d1d4dc';
        const labelColor = isLight ? '#707584' : '#9b9ba3';
        const bullColor = '#26a69a';
        const bearColor = '#ef5350';
        const ohlcColor = isUp ? bullColor : bearColor;
        const isMobile = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (chartW < 500);
        let curX = 10;
        let curY = 10;

        const drawText = (txt, isBold, fillStyle) => {
          ctx.font = (isBold ? 'bold ' : '') + (isMobile ? '11px' : '12px') + ' Inter, Arial, sans-serif';
          ctx.fillStyle = fillStyle;
          ctx.fillText(txt, curX, curY);
          curX += ctx.measureText(txt).width + (isMobile ? 4 : 6);
        };

        const isStandard = activeBar.open !== undefined && activeBar.close !== undefined;
        const showTitle = this.options?.chartSettings?.statusLine?.showTitle !== false;
        if (isStandard) {
          if (showTitle) {
            drawText(`${this.symbol} · ${this.resolution}`, true, textColor);
            curX += isMobile ? 2 : 4;
          }
          const change = (activeBar.close - activeBar.open);
          const changePct = (change / (activeBar.open || 1) * 100);
          const sign = change >= 0 ? '+' : '';
          const changeText = `${sign}${change.toFixed(2)} (${sign}${changePct.toFixed(2)}%)`;

          if (isMobile) {
            drawText(changeText, false, ohlcColor);
            curX = 10;
            curY = 25;
          }

          const fmt = (v) => v !== undefined && v !== null ? v.toFixed(2) : '—';
          drawText('O', false, labelColor);
          drawText(fmt(activeBar.open), false, ohlcColor);
          drawText('H', false, labelColor);
          drawText(fmt(activeBar.high), false, ohlcColor);
          drawText('L', false, labelColor);
          drawText(fmt(activeBar.low), false, ohlcColor);
          drawText('C', false, labelColor);
          drawText(fmt(activeBar.close), false, ohlcColor);
          if (!isMobile) {
            drawText(changeText, false, ohlcColor);
          }
        }
      }
      ctx.restore();

      // 9. Price line badges on Price Scale
      if (this._priceLines && this._priceLines.length > 0) {
        ctx.save();
        this._priceLines.forEach(pl => {
          if (pl.axisLabelVisible !== false) {
            const y = this.priceToY(pl.price, minPrice, maxPrice);
            if (y >= 0 && y <= chartH) {
              ctx.fillStyle = pl.color || '#2962ff';
              ctx.fillRect(chartW + 1, y - 9, this.paddingRight - 1, 18);
              ctx.fillStyle = '#ffffff';
              ctx.font = 'bold 10px Inter, Arial, sans-serif';
              ctx.textBaseline = 'middle';
              ctx.fillText(pl.price.toFixed(2), chartW + 8, y);
            }
          }
        });
        ctx.restore();
      }

      if (window.drawPriceScaleLabel) {
        window.drawPriceScaleLabel(this, ctx, minPrice, maxPrice);
      }
      if (window.ChartingAPI && window.ChartingAPI.drawPriceScaleDrawingLabel) {
        window.ChartingAPI.drawPriceScaleDrawingLabel(this, ctx, minPrice, maxPrice);
      }
      if (window.ChartingAPI && window.ChartingAPI.drawTimescaleDrawingLabel) {
        window.ChartingAPI.drawTimescaleDrawingLabel(this, ctx, chartH + totalPanelsH);
      }

      // 10. Sub-Panels (Indicators)
      paneIndicators.forEach((x, pIdx) => {
        try {
          const panelY = chartH + pIdx * SUB_PANEL_H;
          const values = x.config.calculate(this.bars, x.ind.params);
          let minVal = Infinity;
          let maxVal = -Infinity;
          for (let i = startIndex; i <= endIndex; i++) {
            if (i < 0 || i >= values.length) continue;
            const val = values[i];
            if (val == null) continue;
            if (Array.isArray(val)) {
              for (const v of val) {
                if (v != null && !isNaN(v)) {
                  if (v < minVal) minVal = v;
                  if (v > maxVal) maxVal = v;
                }
              }
            } else if (typeof val === 'object') {
              for (const k in val) {
                if (val[k] != null && !isNaN(val[k])) {
                  if (val[k] < minVal) minVal = val[k];
                  if (val[k] > maxVal) maxVal = val[k];
                }
              }
            } else {
              if (!isNaN(val)) {
                if (val < minVal) minVal = val;
                if (val > maxVal) maxVal = val;
              }
            }
          }

          if (minVal === Infinity || maxVal === -Infinity) {
            minVal = 0;
            maxVal = 100;
          }
          if (minVal === maxVal) {
            minVal -= 1;
            maxVal += 1;
          } else {
            const pad = (maxVal - minVal) * 0.05;
            minVal -= pad;
            maxVal += pad;
          }

          const range = maxVal - minVal;
          const toY = (val) => panelY + SUB_PANEL_H - ((val - minVal) / range) * SUB_PANEL_H;

          ctx.save();
          ctx.beginPath();
          ctx.rect(0, panelY, chartW, SUB_PANEL_H);
          ctx.clip();
          x.config.render(ctx, this, values, { startIndex, endIndex, chartW, chartH: SUB_PANEL_H, panelY, toY }, x.ind.color);
          ctx.restore();

          const levels = x.config.levels || [];
          levels.forEach(lvl => {
            const y = toY(lvl);
            if (y >= panelY && y <= panelY + SUB_PANEL_H) {
              ctx.save();
              ctx.strokeStyle = isLight ? '#e0e3eb' : '#2a2e39';
              ctx.lineWidth = 0.5;
              ctx.setLineDash([2, 4]);
              ctx.beginPath();
              ctx.moveTo(0, y);
              ctx.lineTo(chartW, y);
              ctx.stroke();
              ctx.fillStyle = isLight ? '#707a8a' : '#9b9ba3';
              ctx.font = '10px sans-serif';
              ctx.textAlign = 'left';
              ctx.textBaseline = 'middle';
              ctx.fillText(lvl.toString(), chartW + 6, y);
              ctx.restore();
            }
          });

          ctx.save();
          ctx.strokeStyle = isLight ? '#e0e3eb' : '#2a2e39';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(chartW, panelY);
          ctx.lineTo(chartW, panelY + SUB_PANEL_H);
          ctx.stroke();
          ctx.restore();

          ctx.save();
          ctx.fillStyle = isLight ? '#2a2e39' : '#d1d4dc';
          ctx.font = '11px sans-serif';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'top';
          let displayValStr = '';
          const hoverIdx = this.isMouseOver ? this.xToBar(this.mousePos.x) : endIndex;
          if (hoverIdx >= 0 && hoverIdx < values.length) {
            const hVal = values[hoverIdx];
            if (hVal != null) {
              if (typeof hVal === 'number') {
                displayValStr = hVal.toFixed(2);
              } else if (Array.isArray(hVal)) {
                displayValStr = hVal.map(v => v != null ? v.toFixed(2) : '—').join(', ');
              } else if (typeof hVal === 'object') {
                displayValStr = Object.keys(hVal).map(k => `${k}: ${hVal[k] != null ? hVal[k].toFixed(2) : '—'}`).join(' ');
              }
            }
          }
          ctx.fillText(`${x.ind.name}: ${displayValStr}`, 10, panelY + 6);
          ctx.restore();

          ctx.save();
          ctx.strokeStyle = isLight ? '#e0e3eb' : '#2a2e39';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(0, panelY + SUB_PANEL_H);
          ctx.lineTo(W, panelY + SUB_PANEL_H);
          ctx.stroke();
          ctx.restore();
        } catch (e) {
          console.error(`Error rendering sub-panel indicator ${x.ind.type}:`, e);
        }
      });

      // 11. Crosshairs & Cursor Badges
      if (this.crosshairMode !== 'hidden' && this.isMouseOver && this.mousePos.x <= chartW && this.mousePos.y <= chartH + totalPanelsH) {
        ctx.save();
        const crosshairSettings = window.ChartingAPI && typeof window.ChartingAPI.getCrosshairSettings === 'function' ? window.ChartingAPI.getCrosshairSettings() : null;
        const cColor = crosshairSettings && crosshairSettings.color ? crosshairSettings.color : (isLight ? '#000000' : '#ffffff');
        const cWidth = crosshairSettings && crosshairSettings.width !== undefined ? crosshairSettings.width : 0.8;
        const cDash = crosshairSettings && crosshairSettings.dashArray ? crosshairSettings.dashArray : [3, 3];

        ctx.strokeStyle = cColor;
        ctx.lineWidth = cWidth;
        ctx.setLineDash(cDash);
        const hoverBarIdx = this.xToBar(this.mousePos.x);
        const snappedX = this.barToX(hoverBarIdx);

        ctx.beginPath();
        ctx.moveTo(snappedX, 0);
        ctx.lineTo(snappedX, chartH + totalPanelsH);
        ctx.stroke();

        if (this.mousePos.y <= chartH) {
          ctx.beginPath();
          ctx.moveTo(0, this.mousePos.y);
          ctx.lineTo(chartW, this.mousePos.y);
          ctx.stroke();
          ctx.restore();

          if (!crosshairSettings || crosshairSettings.showPriceBadge !== false) {
            window.DecodedScale.drawPriceBadge(this, ctx, minPrice, maxPrice, chartW);
          }
        } else {
          const relativeY = this.mousePos.y - chartH;
          const pIdx = Math.floor(relativeY / SUB_PANEL_H);
          if (pIdx >= 0 && pIdx < numPanels) {
            ctx.beginPath();
            ctx.moveTo(0, this.mousePos.y);
            ctx.lineTo(chartW, this.mousePos.y);
            ctx.stroke();
          }
          ctx.restore();
        }

        if (!crosshairSettings || crosshairSettings.showTimeBadge !== false) {
          (this.horizontalScale || window.TimeScale).drawTimeBadge(this, ctx, chartH + totalPanelsH);
        }
      }

      if (this.smartLoader) {
        this.smartLoader.check();
      }
    }
  }

  window.BacktestxChart = BacktestxChart;

  // Official TradingView Lightweight Charts Factory API
  window.createChart = function(container, options = {}) {
    return new window.BacktestxChart(container, options);
  };

  // TradingView widget compatibility wrapper
  window.widget = class widget {
    constructor(options) {
      this.options = options;
      let containerId = options.container;
      if (containerId instanceof HTMLElement) {
        if (!containerId.id) {
          containerId.id = 'chart_container_' + Math.random().toString(36).substr(2, 9);
        }
        containerId = containerId.id;
      }

      const savedTheme = localStorage.getItem('chart-theme');
      const isLight = savedTheme ? savedTheme === 'light' : String(options.theme).toLowerCase() === 'light';
      if (isLight) {
        document.body.classList.add('light-theme');
      } else {
        document.body.classList.remove('light-theme');
      }

      let resolution = String(options.interval || '1D');
      if (resolution === '1') resolution = '1m';
      else if (resolution === '2') resolution = '2m';
      else if (resolution === '3') resolution = '3m';
      else if (resolution === '5') resolution = '5m';
      else if (resolution === '10') resolution = '10m';
      else if (resolution === '15') resolution = '15m';
      else if (resolution === '30') resolution = '30m';
      else if (resolution === '45') resolution = '45m';
      else if (resolution === '60' || resolution === '1H') resolution = '1H';
      else if (resolution === '120' || resolution === '2H') resolution = '2H';
      else if (resolution === '180' || resolution === '3H') resolution = '3H';
      else if (resolution === '240' || resolution === '4H') resolution = '4H';

      const enabled = options.enabled_features || [];
      const disabled = options.disabled_features || [];
      const isEnabled = (feature, defaultVal = true) => {
        if (disabled.includes(feature)) return false;
        if (enabled.includes(feature)) return true;
        return defaultVal;
      };

      const mappedOptions = {
        symbol: options.symbol || 'BTCUSD',
        resolution: resolution,
        datafeed: options.datafeed,
        showTopToolbar: isEnabled('header_widget', true),
        showDrawingToolbar: isEnabled('left_toolbar', true),
        showAddCustomInterval: isEnabled('add_custom_interval', false),
        timezone: options.timezone || 'Etc/UTC',
        supported_resolutions: options.supported_resolutions
      };

      if (mappedOptions.showTopToolbar === false) {
        if (!document.getElementById('hide-top-toolbar-style')) {
          const style = document.createElement('style');
          style.id = 'hide-top-toolbar-style';
          style.textContent = '.top-toolbar { display: none !important; }';
          document.head.appendChild(style);
        }
      }
      if (mappedOptions.showDrawingToolbar === false) {
        if (!document.getElementById('hide-drawing-toolbar-style')) {
          const style = document.createElement('style');
          style.id = 'hide-drawing-toolbar-style';
          style.textContent = '.toolbar { display: none !important; }';
          document.head.appendChild(style);
        }
      }

      const chart = new window.BacktestxChart(containerId, mappedOptions);
      try {
        const savedSettings = localStorage.getItem('bx_chart_settings');
        if (savedSettings) {
          chart.options = chart.options || {};
          chart.options.chartSettings = JSON.parse(savedSettings);
        }
      } catch(e) {}

      this.chartInstance = chart;
      window.chart = chart;
    }

    onChartReady(callback) {
      setTimeout(callback, 50);
    }
  };
})(window);