{
  const _0xd72a50 = "c19f12b366f10b08";
  let _0xef4daf = Math.floor(Math.random() * 124);
  const _0x381d76 = Array.from({length: 3}, (_, i) => i + 124).reduce((acc, val) => acc + val, 0);
  if (_0xef4daf < 0) { console.log(_0xd72a50); }
  (function() { return _0x381d76 > 0 ? _0xd72a50 : ""; })();
}
(function(window) {
  const resolutionToMs = (resolution) => {
    if (!resolution) return 60 * 1000;
    const map = {
      '1': 60e3, '2': 2 * 60e3, '3': 3 * 60e3, '5': 5 * 60e3, '10': 10 * 60e3, '15': 15 * 60e3,
      '30': 30 * 60e3, '45': 45 * 60e3, '60': 60 * 60e3, '120': 2 * 60 * 60e3, '180': 3 * 60 * 60e3,
      '240': 4 * 60 * 60e3, '360': 6 * 60 * 60e3, '720': 12 * 60 * 60e3, '1m': 60e3, '2m': 2 * 60e3,
      '3m': 3 * 60e3, '5m': 5 * 60e3, '10m': 10 * 60e3, '15m': 15 * 60e3, '30m': 30 * 60e3,
      '45m': 45 * 60e3, '1H': 60 * 60e3, '2H': 2 * 60 * 60e3, '3H': 3 * 60 * 60e3, '4H': 4 * 60 * 60e3,
      '6H': 6 * 60 * 60e3, '12H': 12 * 60 * 60e3, '1D': 24 * 60 * 60e3, '1W': 7 * 24 * 60 * 60e3,
      '1M': 30 * 24 * 60 * 60e3
    };
    if (map[resolution]) return map[resolution];
    const match = String(resolution).match(/^(\d*)([a-zA-Z]+)$/);
    if (match) {
      const val = parseInt(match[1] || '1', 10);
      const unit = match[2];
      if (unit === 's' || unit === 'S') return val * 1000;
      if (unit === 'm') return val * 60 * 1000;
      if (unit === 'H' || unit === 'h') return val * 60 * 60 * 1000;
      if (unit === 'D' || unit === 'd') return val * 24 * 60 * 60 * 1000;
      if (unit === 'W' || unit === 'w') return val * 7 * 24 * 60 * 60 * 1000;
      if (unit === 'M') return val * 30 * 24 * 60 * 60 * 1000;
    }
    return 60 * 1000;
  };

  class BacktestxChartCore {
    constructor(containerId, options = {}) {
      window.chart = this;
      this.container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
      this.options = options || {};

      if (Array.isArray(options)) {
        this.bars = options;
        this.symbol = 'BTCUSD';
        this.resolution = '1D';
        this.datafeed = null;
      } else {
        this.symbol = (options.symbol || 'AAPL').toUpperCase();
        this.resolution = options.resolution || '1D';
        this.datafeed = options.datafeed || null;
        this.bars = [];
      }

      this.candleWidth = 8;
      this.candleGap = 2;
      const isMobile = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
      this.paddingRight = isMobile ? 70 : 85;
      this.paddingBottom = 35;
      this.priceScaleZoom = 1.0;
      this.priceScaleOffset = 0;
      this.priceScaleMode = options.priceScaleMode ?? (window.PriceScaleMode ? window.PriceScaleMode.Normal : 0);
      this.invertScale = options.invertScale ?? false;
      this.scaleMargins = options.scaleMargins || { top: 0.08, bottom: 0.08 };
      this.crosshairMode = options.crosshairMode ?? 'normal'; // 'normal' | 'magnet' | 'hidden'
      this._priceLines = [];
      this._markers = [];

      // Event Subscriptions
      this._crosshairMoveListeners = [];
      this._clickListeners = [];
      this._visibleTimeRangeListeners = [];
      this._visibleLogicalRangeListeners = [];

      this.dragMode = null;
      this.selectedDrawingIdx = null;
      this.canvas = document.createElement('canvas');
      this.canvas.style.display = 'block';
      this.canvas.style.width = '100%';
      this.canvas.style.height = '100%';
      this.canvas.style.touchAction = 'none';
      if (this.container) {
        this.container.appendChild(this.canvas);
      }
      this.ctx = this.canvas.getContext('2d');
      this.resize();

      this.isPanning = false;
      this.panStart = { x: 0, y: 0 };
      this.panOffsetStart = 0;
      this.mousePos = { x: 0, y: 0 };
      this.isMouseOver = false;
      this.activeTool = null;
      this.drawings = [];
      this.drawingPoints = [];
      this.indicators = [];
      this.chartType = options.chartType || 'candlestick';

      this._touchStartX = 0;
      this._touchStartY = 0;
      this._lastTouchX = 0;
      this._lastTouchY = 0;
      this._isTap = false;
      this._lastTapTime = 0;
      this._lastTapX = 0;
      this._lastTapY = 0;
      this._lastTouchDist = null;
      this._pinchCenterX = undefined;
      this._pinchCenterY = undefined;
      this._touchHoldTimeout = null;
      this._pendingCrosshair = false;
      this._isCrosshairActiveMobile = false;

      this.logoUrl = '';
      this.logoLoaded = false;
      this.logoImg = null;
      this.watermarkExpanded = false;
      this.watermarkProgress = 0.0;
      this.watermarkAnimFrame = null;
      this.watermarkExpandedWidth = 142;

      this.smartLoader = window.SmartLoader ? new window.SmartLoader(this) : null;
      this._bindToolbarButtons();
      this._initEvents();

      if (this.datafeed) {
        this.loadData();
      } else {
        this.offset = this._getInitialOffset();
        this._clampOffset();
      }

      if (window.ChartingAPI && typeof window.ChartingAPI.loadCustomDrawings === "function") {
        try {
          window.ChartingAPI.loadCustomDrawings(this);
        } catch(e) {
          console.error("Error loading drawings:", e);
        }
      }

      this.isAutoFollowing = true;
      this._countdownInterval = setInterval(() => {
        if (this.bars && this.bars.length > 0) {
          this.render();
        }
      }, 1000);
      this._ensureRealtimeButton();

      const btn = document.getElementById("top-btn-interval");
      if (btn) {
        const span = btn.querySelector("span");
        if (span) span.textContent = this.resolution;
      }
    }

    _ensureRealtimeButton() {
      if (!this.container || this._realtimeBtn) return;
      const btn = document.createElement('button');
      btn.className = 'bx-realtime-btn';
      btn.title = 'Scroll to latest bar';
      btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="13 17 18 12 13 7"></polyline><polyline points="6 17 11 12 6 7"></polyline></svg>`;
      btn.style.cssText = `
        position: absolute;
        right: ${this.paddingRight + 12}px;
        bottom: ${this.paddingBottom + 12}px;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: rgba(30, 34, 45, 0.88);
        color: #d1d4dc;
        border: 1px solid rgba(255, 255, 255, 0.18);
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.4);
        display: none;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        z-index: 100;
        transition: transform 0.15s ease, background 0.15s ease;
      `;
      btn.addEventListener('mouseenter', () => {
        btn.style.transform = 'scale(1.1)';
        btn.style.background = '#2962ff';
        btn.style.color = '#ffffff';
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'scale(1.0)';
        btn.style.background = 'rgba(30, 34, 45, 0.88)';
        btn.style.color = '#d1d4dc';
      });
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.scrollToRealTime();
      });
      this.container.style.position = 'relative';
      this.container.appendChild(btn);
      this._realtimeBtn = btn;
    }

    setActiveTool(tool) {
      this._drawingP1Placed = false;
      this._touch1Completed = false;
      const toolBtns = document.querySelectorAll('.tool-btn');
      if (this.activeTool === tool) {
        this.activeTool = null;
        this.drawingPoints = [];
        toolBtns.forEach(b => {
          if (b.getAttribute('data-tool') === tool) b.classList.remove('active');
        });
      } else {
        toolBtns.forEach(b => {
          if (b.getAttribute('data-tool') !== 'magnet') {
            b.classList.toggle('active', b.getAttribute('data-tool') === tool);
          }
        });
        this.activeTool = tool;
        this.drawingPoints = [];
        this._isCrosshairActiveMobile = false;
        this.selectedDrawingIdx = null;
        if (window.DrawingFloatingToolbar) window.DrawingFloatingToolbar.hide();
      }
      this.render();
    }

    _bindToolbarButtons() {
      const setup = () => {
        const toolBtns = document.querySelectorAll('.tool-btn');
        toolBtns.forEach(btn => {
          const tool = btn.getAttribute('data-tool');
          const id = btn.id;
          if (tool && tool !== 'magnet') {
            btn.addEventListener('click', (e) => {
              e.stopPropagation();
              this.setActiveTool(tool);
            });
          } else if (id === 'btn-magnet') {
            btn.addEventListener('click', (e) => {
              e.stopPropagation();
              this.toggleMagnetMode();
            });
          } else if (id === 'btn-reset-view') {
            btn.addEventListener('click', (e) => {
              e.stopPropagation();
              this.resetView();
            });
          } else if (id === 'btn-clear-drawings') {
            btn.addEventListener('click', (e) => {
              e.stopPropagation();
              this.drawings = [];
              this.selectedDrawingIdx = null;
              this.drawingPoints = [];
              if (window.ChartingAPI && typeof window.ChartingAPI.saveDrawings === 'function') {
                window.ChartingAPI.saveDrawings(this);
              }
              if (window.DrawingFloatingToolbar) window.DrawingFloatingToolbar.hide();
              this.render();
            });
          }
        });

        if (this.container) {
          this.container.addEventListener('tool-deactivated', () => {
            toolBtns.forEach(b => {
              if (b.getAttribute('data-tool') !== 'magnet') b.classList.remove('active');
            });
          });
        }
      };

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setup);
      } else {
        setup();
      }
    }

    _updateRealtimeButton() {
      if (!this._realtimeBtn) return;
      const initialOffset = this._getInitialOffset();
      const slot = this.candleWidth + this.candleGap;
      const isScrolledAway = Math.abs(this.offset - initialOffset) > (slot * 2);
      if (isScrolledAway) {
        this.isAutoFollowing = false;
        this._realtimeBtn.style.display = 'flex';
      } else {
        this.isAutoFollowing = true;
        this._realtimeBtn.style.display = 'none';
      }
    }

    scrollToRealTime() {
      this.offset = this._getInitialOffset();
      this.isAutoFollowing = true;
      this._clampOffset();
      this.render();
      this._emitRangeChange();
      this._updateRealtimeButton();
    }

    toggleMagnetMode() {
      this.crosshairMode = this.crosshairMode === 'magnet' ? 'normal' : 'magnet';
      const btn = document.getElementById('btn-magnet');
      if (btn) btn.classList.toggle('active', this.crosshairMode === 'magnet');
      this.render();
      return this.crosshairMode === 'magnet';
    }

    // ─── Lightweight Charts Public APIs ─────────────────────────────────────────
    timeScale() {
      const self = this;
      return {
        getVisibleRange: () => window.TimeScale.getVisibleTimeRange(self),
        getVisibleLogicalRange: () => window.TimeScale.getVisibleLogicalRange(self),
        setVisibleRange: (range) => window.TimeScale.setVisibleRange(self, range),
        setVisibleLogicalRange: (range) => window.TimeScale.setVisibleLogicalRange(self, range),
        fitContent: () => window.TimeScale.fitContent(self),
        scrollToPosition: (pos, animated) => window.TimeScale.scrollToPosition(self, pos, animated),
        scrollToRealTime: () => self.scrollToRealTime(),
        timeToCoordinate: (time) => window.TimeScale.timeToCoordinate(self, time),
        coordinateToTime: (x) => window.TimeScale.coordinateToTime(self, x),
        logicalToCoordinate: (logical) => window.TimeScale.logicalToCoordinate(self, logical),
        coordinateToLogical: (x) => window.TimeScale.coordinateToLogical(self, x),
        subscribeVisibleTimeRangeChange: (fn) => self.subscribeVisibleTimeRangeChange(fn),
        unsubscribeVisibleTimeRangeChange: (fn) => self.unsubscribeVisibleTimeRangeChange(fn),
        subscribeVisibleLogicalRangeChange: (fn) => self.subscribeVisibleLogicalRangeChange(fn),
        unsubscribeVisibleLogicalRangeChange: (fn) => self.unsubscribeVisibleLogicalRangeChange(fn),
        applyOptions: (opts) => {
          if (opts.rightOffset !== undefined) self.options.rightOffset = opts.rightOffset;
          if (opts.barSpacing !== undefined) self.candleWidth = opts.barSpacing;
          self.render();
        },
        options: () => self.options?.timeScale || {}
      };
    }

    priceScale(id = 'right') {
      const self = this;
      return {
        applyOptions: (opts) => {
          if (opts.mode !== undefined) self.priceScaleMode = opts.mode;
          if (opts.invertScale !== undefined) self.invertScale = opts.invertScale;
          if (opts.scaleMargins !== undefined) self.scaleMargins = opts.scaleMargins;
          if (opts.autoScale !== undefined && opts.autoScale) {
            self.priceScaleZoom = 1.0;
            self.priceScaleOffset = 0;
            self.savedAutoMin = undefined;
            self.savedAutoMax = undefined;
          }
          self.render();
        },
        options: () => ({
          mode: self.priceScaleMode,
          invertScale: self.invertScale,
          scaleMargins: self.scaleMargins
        }),
        width: () => self.paddingRight
      };
    }

    setMarkers(markers = []) {
      this._markers = Array.isArray(markers) ? [...markers] : [];
      this.render();
    }

    markers() {
      return this._markers || [];
    }

    createPriceLine(options = {}) {
      const line = {
        id: 'pl_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        price: options.price ?? 0,
        color: options.color || '#2962ff',
        lineWidth: options.lineWidth || 1,
        lineStyle: options.lineStyle || 'dashed',
        title: options.title || '',
        axisLabelVisible: options.axisLabelVisible !== false
      };
      this._priceLines.push(line);
      this.render();
      return line;
    }

    removePriceLine(lineOrId) {
      const id = typeof lineOrId === 'string' ? lineOrId : lineOrId?.id;
      const idx = this._priceLines.findIndex(pl => pl.id === id);
      if (idx !== -1) {
        this._priceLines.splice(idx, 1);
        this.render();
        return true;
      }
      return false;
    }

    takeScreenshot(download = false) {
      const offscreen = document.createElement('canvas');
      offscreen.width = this.canvas.width;
      offscreen.height = this.canvas.height;
      const offCtx = offscreen.getContext('2d');
      offCtx.drawImage(this.canvas, 0, 0);
      if (download) {
        const a = document.createElement('a');
        a.href = offscreen.toDataURL('image/png');
        a.download = `${this.symbol || 'chart'}_${this.resolution || '1D'}_${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
      return offscreen;
    }

    applyOptions(options = {}) {
      this.options = { ...this.options, ...options };
      if (options.priceScaleMode !== undefined) this.priceScaleMode = options.priceScaleMode;
      if (options.invertScale !== undefined) this.invertScale = options.invertScale;
      if (options.crosshairMode !== undefined) this.crosshairMode = options.crosshairMode;
      if (options.scaleMargins !== undefined) this.scaleMargins = options.scaleMargins;
      this.render();
    }

    // ─── Subscriptions ────────────────────────────────────────────────────────
    subscribeCrosshairMove(handler) {
      if (typeof handler === 'function' && !this._crosshairMoveListeners.includes(handler)) {
        this._crosshairMoveListeners.push(handler);
      }
    }

    unsubscribeCrosshairMove(handler) {
      const idx = this._crosshairMoveListeners.indexOf(handler);
      if (idx !== -1) this._crosshairMoveListeners.splice(idx, 1);
    }

    subscribeClick(handler) {
      if (typeof handler === 'function' && !this._clickListeners.includes(handler)) {
        this._clickListeners.push(handler);
      }
    }

    unsubscribeClick(handler) {
      const idx = this._clickListeners.indexOf(handler);
      if (idx !== -1) this._clickListeners.splice(idx, 1);
    }

    subscribeVisibleTimeRangeChange(handler) {
      if (typeof handler === 'function' && !this._visibleTimeRangeListeners.includes(handler)) {
        this._visibleTimeRangeListeners.push(handler);
      }
    }

    unsubscribeVisibleTimeRangeChange(handler) {
      const idx = this._visibleTimeRangeListeners.indexOf(handler);
      if (idx !== -1) this._visibleTimeRangeListeners.splice(idx, 1);
    }

    subscribeVisibleLogicalRangeChange(handler) {
      if (typeof handler === 'function' && !this._visibleLogicalRangeListeners.includes(handler)) {
        this._visibleLogicalRangeListeners.push(handler);
      }
    }

    unsubscribeVisibleLogicalRangeChange(handler) {
      const idx = this._visibleLogicalRangeListeners.indexOf(handler);
      if (idx !== -1) this._visibleLogicalRangeListeners.splice(idx, 1);
    }

    _emitRangeChange() {
      const timeRange = window.TimeScale ? window.TimeScale.getVisibleTimeRange(this) : null;
      const logicalRange = window.TimeScale ? window.TimeScale.getVisibleLogicalRange(this) : null;
      this._visibleTimeRangeListeners.forEach(fn => { try { fn(timeRange); } catch(e) {} });
      this._visibleLogicalRangeListeners.forEach(fn => { try { fn(logicalRange); } catch(e) {} });
    }

    _getInitialOffset() {
      const chartW = this.logicalWidth - this.paddingRight;
      const slot = this.candleWidth + this.candleGap;
      const visibleCount = Math.max(1, Math.floor(chartW / slot));
      const futureBuffer = Math.max(10, Math.floor(visibleCount * 0.25));
      return chartW - (this.bars.length - 1 + futureBuffer) * slot - this.candleWidth / 2;
    }

    _animateWatermark() {
      if (this._watermarkAnimFrame) {
        cancelAnimationFrame(this._watermarkAnimFrame);
      }
      const target = this.watermarkExpanded ? 1.0 : 0.0;
      const tick = () => {
        const initial = this.watermarkProgress ?? 0.0;
        const diff = target - initial;
        if (Math.abs(diff) < 0.01) {
          this.watermarkProgress = target;
          this._watermarkAnimFrame = null;
        } else {
          this.watermarkProgress = initial + diff * 0.2;
          this._watermarkAnimFrame = requestAnimationFrame(tick);
        }
        this.render();
      };
      this._watermarkAnimFrame = requestAnimationFrame(tick);
    }

    _isPointInWatermark(x, y) {
      const chartH = typeof this.getChartHeight === 'function' ? this.getChartHeight() : this.logicalHeight - this.paddingBottom;
      const badgeX = 12;
      const badgeY = chartH - 46;
      const badgeH = 34;
      const badgeW = this.watermarkExpanded ? (this.watermarkExpandedWidth || 165) : badgeH;
      return x >= badgeX && x <= (badgeX + badgeW) && y >= badgeY && y <= (badgeY + badgeH);
    }

    resetView() {
      this.candleWidth = 8;
      this.offset = this._getInitialOffset();
      this.priceScaleOffset = 0;
      this.priceScaleZoom = 1.0;
      this.savedAutoMin = undefined;
      this.savedAutoMax = undefined;
      this.render();
      this._emitRangeChange();
    }

    _clampOffset(e) {
      if (!this.bars || this.bars.length === 0) return;
      const chartW = this.logicalWidth - this.paddingRight;
      const slot = this.candleWidth + this.candleGap;
      const visibleCount = Math.max(2, Math.floor(chartW / slot));

      // Match core library terminal/src/interactions.js lines 2493-2498
      const minCandlesVisible = this.bars.length >= 2 ? Math.min(this.bars.length, Math.max(2, Math.min(5, Math.floor(visibleCount * 0.2)))) : 1;
      const maxStart = this.bars.length - minCandlesVisible;
      const minStart = visibleCount <= 4 ? Math.min(0, 2 - visibleCount) : -Math.max(15, Math.floor(visibleCount * 0.8));

      const offsetMin = -maxStart * slot - this.candleWidth / 2;
      const offsetMax = -minStart * slot - this.candleWidth / 2;

      if (this.offset < offsetMin) {
        this.offset = offsetMin;
        if (this.dragMode === 'pan' && e && e.clientX !== undefined) {
          this.panStart.x = e.clientX;
          this.panOffsetStart = this.offset;
        }
      } else if (this.offset > offsetMax) {
        this.offset = offsetMax;
        if (this.dragMode === 'pan' && e && e.clientX !== undefined) {
          this.panStart.x = e.clientX;
          this.panOffsetStart = this.offset;
        }
      }
    }

    loadData() {
      if (this.smartLoader) this.smartLoader.reset();
      this.priceScaleZoom = 1.0;
      this.priceScaleOffset = 0;
      this.savedAutoMin = undefined;
      this.savedAutoMax = undefined;
      const expectedSymbol = this.symbol;
      const expectedResolution = this.resolution;

      this.datafeed.resolveSymbol(this.symbol).then(symbolInfo => {
        if (this.symbol !== expectedSymbol || this.resolution !== expectedResolution) return;
        this.symbolInfo = symbolInfo;
        const intervalMs = resolutionToMs(this.resolution);
        const to = Math.floor(Date.now() / 1000);
        const from = to - Math.floor((1000 * intervalMs) / 1000);

        this.datafeed.getBars(this.symbol, this.resolution, from, to, (result) => {
          if (this.symbol !== expectedSymbol || this.resolution !== expectedResolution) return;
          this.bars = result.bars || [];
          if (this.drawings && this.drawings.length > 0) {
            this.drawings.forEach(d => {
              const syncPoint = (p) => {
                if (p && p.time !== undefined && p.time !== null) {
                  let closestIdx = 0;
                  let minDiff = Infinity;
                  for (let i = 0; i < this.bars.length; i++) {
                    const diff = Math.abs(this.bars[i].time - p.time);
                    if (diff < minDiff) {
                      minDiff = diff;
                      closestIdx = i;
                    }
                  }
                  p.idx = closestIdx;
                }
              };
              if (d.p1) syncPoint(d.p1);
              if (d.p2) syncPoint(d.p2);
            });
          }
          this.offset = this._getInitialOffset();
          this._clampOffset();
          this.render();
          this._emitRangeChange();

          if (this.subUID) {
            this.datafeed.unsubscribeBars(this.subUID);
          }
          this.subUID = `sub_${this.symbol}_${this.resolution}`;
          this.datafeed.subscribeBars(this.symbol, this.resolution, (bar) => {
            if (this.bars.length > 0) {
              const lastBar = this.bars[this.bars.length - 1];
              if (bar.time === lastBar.time) {
                this.bars[this.bars.length - 1] = bar;
              } else {
                this.bars.push(bar);
                // If user is auto-following the live edge, auto-scroll offset to keep the newly formed candle visible!
                if (this.isAutoFollowing) {
                  const slot = this.candleWidth + this.candleGap;
                  this.offset -= slot;
                  this._clampOffset();
                }
              }
              this.render();
              this._updateRealtimeButton();
            }
          }, this.subUID);
        });
      });
    }

    destroy() {
      if (this._countdownInterval) {
        clearInterval(this._countdownInterval);
        this._countdownInterval = null;
      }
      if (this.datafeed && this.subUID) {
        this.datafeed.unsubscribeBars(this.subUID);
      }
      if (this._realtimeBtn && this._realtimeBtn.parentNode) {
        this._realtimeBtn.parentNode.removeChild(this._realtimeBtn);
      }
    }

    addIndicator(type, params = {}, color = null) {
      if (!window.ChartingAPI) return null;
      const config = window.ChartingAPI.getIndicator(type);
      if (!config) {
        console.error(`Indicator not registered: ${type}`);
        return null;
      }
      const id = `${type}_${Date.now()}`;
      const defaultColor = color || config.defaultColor || '#2196F3';
      const ind = {
        id: id,
        type: type.toLowerCase(),
        params: { ...config.params, ...params },
        color: defaultColor,
        name: config.name
      };
      this.indicators.push(ind);
      this.render();
      return ind;
    }

    removeIndicator(id) {
      const idx = this.indicators.findIndex(ind => ind.id === id);
      if (idx !== -1) {
        this.indicators.splice(idx, 1);
        this.render();
        return true;
      }
      return false;
    }

    setResolution(res) {
      this.resolution = res;
      const btn = document.getElementById('top-btn-interval');
      if (btn) {
        const span = btn.querySelector('span');
        if (span) span.textContent = res;
      }
      if (this.datafeed) {
        this.loadData();
      }
    }

    setChartType(type) {
      this.chartType = type.toLowerCase();
      if (this.chartType === 'candlestick') {
        this.customDrawCandles = null;
      } else {
        const renderer = window.ChartingAPI ? window.ChartingAPI.getCandleRenderer(this.chartType) : null;
        if (renderer) {
          this.customDrawCandles = renderer;
        } else {
          console.warn(`Candle renderer not found for type: ${this.chartType}`);
          this.customDrawCandles = null;
        }
      }
      const btn = document.getElementById('top-btn-candle-type');
      if (btn && window.TopToolbarCandleType && window.TopToolbarCandleType.getIconForType) {
        btn.innerHTML = window.TopToolbarCandleType.getIconForType(this.chartType);
      }
      this.render();
    }

    resize() {
      const rect = this.container ? this.container.getBoundingClientRect() : { width: 800, height: 600 };
      const dpr = window.devicePixelRatio || 1;
      this.canvas.width = rect.width * dpr;
      this.canvas.height = rect.height * dpr;
      this.ctx.scale(dpr, dpr);
      this.logicalWidth = rect.width;
      this.logicalHeight = rect.height;
    }

    _initEvents() {
      this.canvas.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        const isMobile = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (window.innerWidth <= 768);
        if (isMobile || (Date.now() - (this._lastTouchActiveTime || 0) < 1200) || this._touchHoldTimeout || this._justActivatedCrosshair) {
          return;
        }

        const existing = document.getElementById('bx-chart-context-menu');
        if (existing) existing.remove();

        const menu = document.createElement('div');
        menu.id = 'bx-chart-context-menu';
        const isLight = document.body.classList.contains('light-theme');
        menu.style.position = 'fixed';
        menu.style.left = e.clientX + 'px';
        menu.style.top = e.clientY + 'px';
        menu.style.background = isLight ? '#ffffff' : '#1e222d';
        menu.style.color = isLight ? '#131722' : '#d1d4dc';
        menu.style.border = '1px solid ' + (isLight ? '#e0e3eb' : '#2a2e39');
        menu.style.borderRadius = '4px';
        menu.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
        menu.style.padding = '4px 0';
        menu.style.zIndex = '999999';
        menu.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
        menu.style.fontSize = '13px';

        const createItem = (text, onClick) => {
          const item = document.createElement('div');
          item.textContent = text;
          item.style.padding = '8px 16px';
          item.style.cursor = 'pointer';
          item.addEventListener('mouseenter', () => {
            item.style.background = isLight ? '#f0f3fa' : '#2a2e39';
          });
          item.addEventListener('mouseleave', () => {
            item.style.background = 'transparent';
          });
          item.addEventListener('click', () => {
            onClick();
            menu.remove();
          });
          return item;
        };

        menu.appendChild(createItem('Reset chart view', () => {
          this.resetView();
        }));

        menu.appendChild(createItem(this.priceScaleMode === 1 ? '✓ Logarithmic scale' : 'Logarithmic scale', () => {
          this.priceScaleMode = this.priceScaleMode === 1 ? 0 : 1;
          this.render();
        }));

        menu.appendChild(createItem(this.priceScaleMode === 2 ? '✓ Percentage scale' : 'Percentage scale', () => {
          this.priceScaleMode = this.priceScaleMode === 2 ? 0 : 2;
          this.render();
        }));

        menu.appendChild(createItem(this.invertScale ? '✓ Invert scale' : 'Invert scale', () => {
          this.invertScale = !this.invertScale;
          this.render();
        }));

        menu.appendChild(createItem('Settings...', () => {
          if (window.SettingsPopup) window.SettingsPopup.show(this);
        }));

        document.body.appendChild(menu);

        const closeMenu = (ev) => {
          if (!menu.contains(ev.target)) {
            menu.remove();
            document.removeEventListener('click', closeMenu);
          }
        };
        setTimeout(() => document.addEventListener('click', closeMenu), 0);
      });

      window.addEventListener('resize', () => {
        this.resize();
        this.render();
      });

      this.canvas.addEventListener('mousedown', (e) => {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Check Watermark Logo click / dismissal
        if (this._isPointInWatermark(mouseX, mouseY)) {
          if (!this.watermarkExpanded) {
            this.watermarkExpanded = true;
            this._watermarkLockedByTouch = true;
            this._animateWatermark();
            return;
          } else {
            const watermarkLogoSettings = window.ChartingAPI && typeof window.ChartingAPI.getWatermarkLogoSettings === 'function' ? window.ChartingAPI.getWatermarkLogoSettings() : null;
            const url = watermarkLogoSettings?.clickUrl || 'https://backtestx.in';
            if (url) window.open(url, '_blank');
            return;
          }
        } else {
          // Clicked anywhere on the chart canvas -> dismiss watermark text ("will gone")
          if (this.watermarkExpanded) {
            this.watermarkExpanded = false;
            this._watermarkLockedByTouch = false;
            this._animateWatermark();
          }
        }

        const { minPrice, maxPrice } = this.getVisibleMinMax();
        const clickedBar = this.xToBar(mouseX);
        const clickedPrice = this.yToPrice(mouseY, minPrice, maxPrice);

        // Emit click event to LWC subscribers
        const clickEvent = {
          time: this.bars[clickedBar]?.time || null,
          logical: clickedBar,
          point: { x: mouseX, y: mouseY },
          seriesData: this.bars[clickedBar] || null
        };
        this._clickListeners.forEach(fn => { try { fn(clickEvent); } catch(_) {} });

        if (this._isCrosshairActiveMobile) {
          this._isCrosshairActiveMobile = false;
        }

        if (this.activeTool) {
          const customTool = window.ChartingAPI ? window.ChartingAPI.getCustomDrawing(this.activeTool) : null;
          const isOneClick = customTool ? customTool.clicks === 1 : ['hline', 'vline', 'hray', 'crossline', 'text'].includes(this.activeTool);
          if (isOneClick) {
            if (this.activeTool === 'text') {
              const txt = prompt("Enter text for label:") || "Text";
              this.drawings.push({
                type: 'text',
                p1: { idx: clickedBar, price: clickedPrice, time: this.bars[clickedBar] ? this.bars[clickedBar].time : null },
                text: txt
              });
            } else {
              this.drawings.push({
                type: this.activeTool,
                p1: { idx: clickedBar, price: clickedPrice, time: this.bars[clickedBar] ? this.bars[clickedBar].time : null }
              });
            }
            if (window.ChartingAPI && typeof window.ChartingAPI.saveCustomDrawings === 'function') {
              window.ChartingAPI.saveCustomDrawings(this, this.drawings);
            }
            this.selectedDrawingIdx = this.drawings.length - 1;
            this.activeTool = null;
            this.drawingPoints = [];
            this.dragMode = null;
            this.container.dispatchEvent(new CustomEvent('tool-deactivated'));
          } else {
            if (this.drawingPoints.length === 0) {
              this.drawingPoints.push({
                idx: clickedBar, price: clickedPrice, time: this.bars[clickedBar] ? this.bars[clickedBar].time : null
              });
              this.dragMode = 'drawingPreview';
            } else {
              this.drawings.push({
                type: this.activeTool,
                p1: this.drawingPoints[0],
                p2: { idx: clickedBar, price: clickedPrice, time: this.bars[clickedBar] ? this.bars[clickedBar].time : null }
              });
              if (window.ChartingAPI && typeof window.ChartingAPI.saveCustomDrawings === 'function') {
                window.ChartingAPI.saveCustomDrawings(this, this.drawings);
              }
              this.selectedDrawingIdx = this.drawings.length - 1;
              this.drawingPoints = [];
              this.activeTool = null;
              this.dragMode = null;
              this._drawingP1Placed = false;
              this._touch1Completed = false;
              this.container.dispatchEvent(new CustomEvent('tool-deactivated'));
            }
          }
          this.render();
          if (window.DrawingFloatingToolbar) {
            window.DrawingFloatingToolbar.show(this);
          }
        } else {
          const isOverPriceAxis = mouseX >= (rect.width - this.paddingRight);
          const isOverTimeAxis = mouseY >= (rect.height - this.paddingBottom);
          if (isOverPriceAxis) {
            this.dragMode = 'priceScale';
            this.panStart.y = e.clientY;
            this._priceAxisStartZoom = this.priceScaleZoom ?? 1.0;
            this.canvas.style.cursor = 'ns-resize';
          } else if (isOverTimeAxis) {
            this.dragMode = 'timeScale';
            this.panStart.x = e.clientX;
            this._timeAxisStartCandleWidth = this.candleWidth;
            this._timeAxisStartOffset = this.offset;
            this.canvas.style.cursor = 'ew-resize';
          } else {
            const hit = window.Drawings ? window.Drawings.hitTest(this, mouseX, mouseY, minPrice, maxPrice) : null;
            if (hit) {
              const d = this.drawings[hit.drawingIdx];
              this.selectedDrawingIdx = hit.drawingIdx;
              if (d && d.locked) {
                this.dragMode = null;
                this.dragTarget = null;
              } else {
                this.dragMode = 'dragDrawing';
                this.dragTarget = hit;
                this.dragStartP1 = { ...d.p1 };
                this.dragStartP2 = d.p2 ? { ...d.p2 } : null;
                this.dragStartMouse = { bar: clickedBar, price: clickedPrice };
                this.canvas.style.cursor = hit.handle === 'line' ? 'move' : 'pointer';
              }
              this.render();
              if (window.DrawingFloatingToolbar) {
                window.DrawingFloatingToolbar.show(this);
              }
            } else {
              this.selectedDrawingIdx = null;
              this.dragMode = 'pan';
              this.panStart.x = e.clientX;
              this.panStart.y = e.clientY;
              this.panOffsetStart = this.offset;
              this._dragStartOffset = this.priceScaleOffset ?? 0;
              this.canvas.style.cursor = 'grabbing';
              this.render();
              if (window.DrawingFloatingToolbar) {
                window.DrawingFloatingToolbar.hide();
              }
            }
          }
        }
      });

      this.canvas.addEventListener('mousemove', (e) => {
        const rect = this.canvas.getBoundingClientRect();
        this.mousePos.x = e.clientX - rect.left;
        this.mousePos.y = e.clientY - rect.top;
        this.isMouseOver = true;

        // Hover expansion on Watermark Logo
        const isOverWatermark = this._isPointInWatermark(this.mousePos.x, this.mousePos.y);
        if (isOverWatermark) {
          this.canvas.style.cursor = 'pointer';
          if (!this.watermarkExpanded) {
            this.watermarkExpanded = true;
            this._animateWatermark();
          }
        } else if (this.watermarkExpanded && !this._watermarkLockedByTouch && !this.dragMode) {
          this.watermarkExpanded = false;
          this._animateWatermark();
        }

        // Magnet mode support
        if (this.crosshairMode === 'magnet' && this.bars && this.bars.length > 0) {
          const hoverBarIdx = this.xToBar(this.mousePos.x);
          const bar = this.bars[hoverBarIdx];
          if (bar) {
            const { minPrice, maxPrice } = this.getVisibleMinMax();
            const yOpen = this.priceToY(bar.open, minPrice, maxPrice);
            const yHigh = this.priceToY(bar.high, minPrice, maxPrice);
            const yLow = this.priceToY(bar.low, minPrice, maxPrice);
            const yClose = this.priceToY(bar.close, minPrice, maxPrice);
            const candidates = [yOpen, yHigh, yLow, yClose];
            let closestY = candidates[0];
            let minDiff = Math.abs(this.mousePos.y - closestY);
            for (let c of candidates) {
              const diff = Math.abs(this.mousePos.y - c);
              if (diff < minDiff) {
                minDiff = diff;
                closestY = c;
              }
            }
            this.mousePos.y = closestY;
          }
        }

        // Fire crosshair move listeners
        this._fireCrosshairEvent(this.mousePos.x, this.mousePos.y);

        if (this.dragMode === 'priceScale') {
          const dy = e.clientY - this.panStart.y;
          const factor = Math.exp(-dy * 0.002);
          this.priceScaleZoom = Math.max(0.05, Math.min(50, this._priceAxisStartZoom * factor));
          this.render();
        } else if (this.dragMode === 'timeScale') {
          const dx = e.clientX - this.panStart.x;
          const factor = Math.exp(-dx * 0.002);
          const chartW = rect.width - this.paddingRight;
          const maxCandleWidth = Math.max(60, (chartW / 2) - this.candleGap);
          const minCandleWidth = Math.max(0.5, (chartW / 2000) - this.candleGap);
          const newWidth = Math.max(minCandleWidth, Math.min(maxCandleWidth, this._timeAxisStartCandleWidth * factor));
          const oldSlot = this._timeAxisStartCandleWidth + this.candleGap;
          const i_pivot = (chartW - this._timeAxisStartOffset - this._timeAxisStartCandleWidth / 2) / oldSlot;
          this.candleWidth = newWidth;
          const newSlot = this.candleWidth + this.candleGap;
          this.offset = chartW - i_pivot * newSlot - this.candleWidth / 2;
          this._clampOffset();
          this.render();
          this._emitRangeChange();
          this._updateRealtimeButton();
        } else if (this.dragMode === 'pan') {
          const dx = e.clientX - this.panStart.x;
          this.offset = this.panOffsetStart + dx;
          this._clampOffset(e);
          if ((this.priceScaleZoom ?? 1.0) !== 1.0 || (this.priceScaleOffset ?? 0) !== 0) {
            const dy = e.clientY - this.panStart.y;
            const { minPrice, maxPrice } = this.getVisibleMinMax();
            const priceRange = maxPrice - minPrice;
            const chartH = rect.height - this.paddingBottom;
            const pricePerPx = priceRange / chartH;
            const dragMultiplier = this.invertScale ? -1 : 1;
            this.priceScaleOffset = this._dragStartOffset + dy * pricePerPx * dragMultiplier;
          }
          this.render();
          this._emitRangeChange();
        } else if (this.dragMode === 'dragDrawing') {
          const { minPrice, maxPrice } = this.getVisibleMinMax();
          const currentBar = this.xToBar(this.mousePos.x);
          const currentPrice = this.yToPrice(this.mousePos.y, minPrice, maxPrice);
          const d = this.drawings[this.dragTarget.drawingIdx];
          if (this.dragTarget.handle === 'p1') {
            d.p1.idx = currentBar;
            d.p1.price = currentPrice;
            if (this.bars[currentBar]) d.p1.time = this.bars[currentBar].time;
          } else if (this.dragTarget.handle === 'p2') {
            d.p2.idx = currentBar;
            d.p2.price = currentPrice;
            if (this.bars[currentBar]) d.p2.time = this.bars[currentBar].time;
          } else if (this.dragTarget.handle === 'line') {
            const barDiff = currentBar - this.dragStartMouse.bar;
            const priceDiff = currentPrice - this.dragStartMouse.price;
            d.p1.idx = this.dragStartP1.idx + barDiff;
            d.p1.price = this.dragStartP1.price + priceDiff;
            if (this.bars[d.p1.idx]) d.p1.time = this.bars[d.p1.idx].time;
            if (d.p2 && this.dragStartP2) {
              d.p2.idx = this.dragStartP2.idx + barDiff;
              d.p2.price = this.dragStartP2.price + priceDiff;
              if (this.bars[d.p2.idx]) d.p2.time = this.bars[d.p2.idx].time;
            }
          }
          this.render();
          if (window.DrawingFloatingToolbar) {
            window.DrawingFloatingToolbar.show(this);
          }
        } else {
          if (!this.dragMode) {
            const isOverTimeAxis = this.mousePos.y >= (rect.height - this.paddingBottom);
            const isOverPriceAxis = this.mousePos.x >= (rect.width - this.paddingRight);
            if (isOverTimeAxis && !isOverPriceAxis) {
              this.canvas.style.cursor = 'ew-resize';
            } else if (isOverPriceAxis && !isOverTimeAxis) {
              this.canvas.style.cursor = 'ns-resize';
            } else if (isOverWatermark) {
              this.canvas.style.cursor = 'pointer';
            } else {
              this.canvas.style.cursor = 'crosshair';
            }
          }
          this.render();
        }
      });

      window.addEventListener('mouseup', () => {
        if (this.dragMode) {
          const wasDraggingDrawing = this.dragMode === 'dragDrawing';
          if (this.dragMode !== 'drawingPreview') {
            this.dragMode = null;
          }
          if (window.ChartingAPI && typeof window.ChartingAPI.saveCustomDrawings === 'function') {
            window.ChartingAPI.saveCustomDrawings(this, this.drawings);
          }
          this.canvas.style.cursor = 'crosshair';
          this.render();
          if (wasDraggingDrawing && window.DrawingFloatingToolbar) {
            window.DrawingFloatingToolbar.show(this);
          }
        }
      });

      this.canvas.addEventListener('mouseleave', () => {
        this.isMouseOver = false;
        if (this.watermarkExpanded && !this._watermarkLockedByTouch) {
          this.watermarkExpanded = false;
          this._animateWatermark();
        }
        this.render();
      });

      this.canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const delta = e.deltaY < 0 ? 1 : -1;
        const chartW = rect.width - this.paddingRight;
        const chartH = rect.height - this.paddingBottom;

        if (mouseX >= chartW) {
          const factor = e.deltaY < 0 ? 1.08 : (1 / 1.08);
          this.priceScaleZoom = Math.max(0.05, Math.min(50, (this.priceScaleZoom ?? 1.0) * factor));
          this.render();
        } else if (mouseY >= chartH) {
          const effectiveDelta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? (e.deltaX < 0 ? 1 : -1) : (e.deltaY < 0 ? 1 : -1);
          const factor = effectiveDelta > 0 ? 1.12 : (1 / 1.12);
          const maxCandleWidth = Math.max(60, (chartW / 2) - this.candleGap);
          const minCandleWidth = Math.max(0.5, (chartW / 2000) - this.candleGap);
          const oldWidth = this.candleWidth;
          const newWidth = Math.max(minCandleWidth, Math.min(maxCandleWidth, oldWidth * factor));
          if (Math.abs(newWidth - oldWidth) > 0.001) {
            const oldSlot = oldWidth + this.candleGap;
            const i_pivot = (chartW - this.offset - oldWidth / 2) / oldSlot;
            this.candleWidth = newWidth;
            const newSlot = this.candleWidth + this.candleGap;
            this.offset = chartW - i_pivot * newSlot - this.candleWidth / 2;
            this._clampOffset();
            this.render();
            this._emitRangeChange();
            this._updateRealtimeButton();
          }
        } else {
          const factor = delta > 0 ? 1.12 : (1 / 1.12);
          const maxCandleWidth = Math.max(60, (chartW / 2) - this.candleGap);
          const minCandleWidth = Math.max(0.5, (chartW / 2000) - this.candleGap);
          const oldWidth = this.candleWidth;
          const newWidth = Math.max(minCandleWidth, Math.min(maxCandleWidth, oldWidth * factor));
          if (Math.abs(newWidth - oldWidth) > 0.001) {
            const mouseBar = this.xToBar(mouseX);
            this.candleWidth = newWidth;
            const newSlot = this.candleWidth + this.candleGap;
            this.offset = mouseX - mouseBar * newSlot - this.candleWidth / 2;
            this._clampOffset();
            this.render();
            this._emitRangeChange();
            this._updateRealtimeButton();
          }
        }
      }, { passive: false });

      // ─── Touch Events (Mobile Hold Crosshair, Drawing Preview, Stabilized Pinch & Pan) ─────────
      let _lastTapTime = 0;
      let _lastTapX = 0;
      let _lastTapY = 0;

      this.canvas.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
          const t = e.touches[0];
          const rect = this.canvas.getBoundingClientRect();
          const touchX = t.clientX - rect.left;
          const touchY = t.clientY - rect.top;
          this._touchStartX = touchX;
          this._touchStartY = touchY;
          this._lastTouchX = touchX;
          this._lastTouchY = touchY;
          this.panStart.x = t.clientX;
          this.panStart.y = t.clientY;
          this.panOffsetStart = this.offset;
          this._dragStartOffset = this.priceScaleOffset ?? 0;
          this._isTap = true;
          this._lastTouchDist = null;
          this.isMouseOver = true;

          // Watermark Tap Handling on Mobile
          if (this._isPointInWatermark(touchX, touchY)) {
            e.preventDefault();
            if (!this.watermarkExpanded) {
              this.watermarkExpanded = true;
              this._watermarkLockedByTouch = true;
              this._animateWatermark();
            } else {
              const watermarkLogoSettings = window.ChartingAPI && typeof window.ChartingAPI.getWatermarkLogoSettings === 'function' ? window.ChartingAPI.getWatermarkLogoSettings() : null;
              const url = watermarkLogoSettings?.clickUrl || 'https://backtestx.in';
              if (url) window.open(url, '_blank');
            }
            return;
          } else {
            // Tapped on chart canvas outside watermark -> dismiss ("will gone")
            if (this.watermarkExpanded) {
              this.watermarkExpanded = false;
              this._watermarkLockedByTouch = false;
              this._animateWatermark();
            }
          }

          // Double tap detection
          const now = Date.now();
          if (now - _lastTapTime < 300 && Math.hypot(touchX - _lastTapX, touchY - _lastTapY) < 25) {
            _lastTapTime = 0;
            if (this._touchHoldTimeout) {
              clearTimeout(this._touchHoldTimeout);
              this._touchHoldTimeout = null;
            }
            if (touchX >= (rect.width - this.paddingRight)) {
              this.priceScaleOffset = 0;
              this.priceScaleZoom = 1.0;
              this.render();
            } else if (touchY >= (rect.height - this.paddingBottom)) {
              this.resetView();
            }
            return;
          }
          _lastTapTime = now;
          _lastTapX = touchX;
          _lastTapY = touchY;

          // 1. Drawing Tool is Active on Mobile
          if (this.activeTool) {
            e.preventDefault();
            this._isCrosshairActiveMobile = false;
            const { minPrice, maxPrice } = this.getVisibleMinMax();
            const clickedBar = this.xToBar(touchX);
            const clickedPrice = this.yToPrice(touchY, minPrice, maxPrice);

            const customTool = window.ChartingAPI ? window.ChartingAPI.getCustomDrawing(this.activeTool) : null;
            const isOneClick = customTool ? customTool.clicks === 1 : ['hline', 'vline', 'hray', 'crossline', 'text'].includes(this.activeTool);

            if (isOneClick) {
              if (this.activeTool === 'text') {
                const txt = prompt("Enter text for label:") || "Text";
                this.drawings.push({
                  type: 'text',
                  p1: { idx: clickedBar, price: clickedPrice, time: this.bars[clickedBar] ? this.bars[clickedBar].time : null },
                  text: txt
                });
              } else {
                this.drawings.push({
                  type: this.activeTool,
                  p1: { idx: clickedBar, price: clickedPrice, time: this.bars[clickedBar] ? this.bars[clickedBar].time : null }
                });
              }
              if (window.ChartingAPI && typeof window.ChartingAPI.saveCustomDrawings === 'function') {
                window.ChartingAPI.saveCustomDrawings(this, this.drawings);
              }
              this.selectedDrawingIdx = this.drawings.length - 1;
              this.activeTool = null;
              this.drawingPoints = [];
              this.dragMode = null;
              this._drawingP1Placed = false;
              this._touch1Completed = false;
              this.container.dispatchEvent(new CustomEvent('tool-deactivated'));
              this.render();
              if (window.DrawingFloatingToolbar) window.DrawingFloatingToolbar.show(this);
            } else {
              // Two-point drawing tool (trendline, arrow, ray, rect, circle, fib, etc.)
              if (!this._drawingP1Placed || this.drawingPoints.length === 0) {
                // Touch 1: Place Point 1
                this.drawingPoints = [{
                  idx: clickedBar, price: clickedPrice, time: this.bars[clickedBar] ? this.bars[clickedBar].time : null
                }];
                this.mousePos.x = touchX;
                this.mousePos.y = touchY;
                this.dragMode = 'drawingPreview';
                this._drawingP1Placed = true;
                this._touch1Completed = false;
                this.render();
              } else {
                // Touch 2: Update preview position towards Point 2
                this.mousePos.x = touchX;
                this.mousePos.y = touchY;
                this.dragMode = 'drawingPreview';
                this.render();
              }
            }
            return;
          }

          // 2. Axis Drag Checks
          const isOverPriceAxis = touchX >= (rect.width - this.paddingRight);
          const isOverTimeAxis = touchY >= (rect.height - this.paddingBottom);
          if (isOverPriceAxis) {
            this.dragMode = 'priceScale';
            this.panStart.y = t.clientY;
            this._priceAxisStartZoom = this.priceScaleZoom ?? 1.0;
            this._dragStartOffset = this.priceScaleOffset ?? 0;
            return;
          } else if (isOverTimeAxis) {
            this.dragMode = 'timeScale';
            this.panStart.x = t.clientX;
            this._timeAxisStartCandleWidth = this.candleWidth;
            this._timeAxisStartOffset = this.offset;
            return;
          }

          // 3. Existing Drawing Hit Test
          const { minPrice, maxPrice } = this.getVisibleMinMax();
          const hit = window.Drawings ? window.Drawings.hitTest(this, touchX, touchY, minPrice, maxPrice) : null;
          if (hit) {
            const d = this.drawings[hit.drawingIdx];
            this.selectedDrawingIdx = hit.drawingIdx;
            if (d && !d.locked) {
              const clickedBar = this.xToBar(touchX);
              const clickedPrice = this.yToPrice(touchY, minPrice, maxPrice);
              this.dragMode = 'dragDrawing';
              this.dragTarget = hit;
              this.dragStartP1 = { ...d.p1 };
              this.dragStartP2 = d.p2 ? { ...d.p2 } : null;
              this.dragStartMouse = { bar: clickedBar, price: clickedPrice };
            }
            this.render();
            if (window.DrawingFloatingToolbar) window.DrawingFloatingToolbar.show(this);
            return;
          } else if (this.selectedDrawingIdx !== null) {
            this.selectedDrawingIdx = null;
            if (window.DrawingFloatingToolbar) window.DrawingFloatingToolbar.hide();
            this.render();
          }

          // 4. Crosshair handling vs Pan on Chart
          this._lastTouchActiveTime = Date.now();
          if (this._isCrosshairActiveMobile) {
            this.dragMode = 'crosshair';
            this._isCrosshairDragging = true;
            this._isTap = true;
            this._lastTouchX = touchX;
            this._lastTouchY = touchY;
            return;
          } else {
            this.dragMode = 'pan';
            this._isCrosshairDragging = false;
            this._justActivatedCrosshair = false;
            if (this._touchHoldTimeout) clearTimeout(this._touchHoldTimeout);
            this._pendingCrosshair = true;
            this._touchHoldTimeout = setTimeout(() => {
              if (this._pendingCrosshair) {
                this._touchHoldTimeout = null;
                this._pendingCrosshair = false;
                this._isCrosshairActiveMobile = true;
                this._isCrosshairDragging = true;
                this._justActivatedCrosshair = true;
                this._isTap = false;
                this.dragMode = 'crosshair';
                this.mousePos.x = touchX;
                this.mousePos.y = touchY;
                if (navigator.vibrate) {
                  try { navigator.vibrate(15); } catch (_) {}
                }
                this._fireCrosshairEvent(touchX, touchY);
                this.render();
              }
            }, 400);
          }

        } else if (e.touches.length === 2) {
          this._lastTouchActiveTime = Date.now();
          if (this._isCrosshairActiveMobile) {
            this._isCrosshairActiveMobile = false;
          }
          if (this._touchHoldTimeout) {
            clearTimeout(this._touchHoldTimeout);
            this._touchHoldTimeout = null;
          }
          this._pendingCrosshair = false;
          this._isCrosshairDragging = false;
          this._justActivatedCrosshair = false;

          if (this.watermarkExpanded) {
            this.watermarkExpanded = false;
            this._watermarkLockedByTouch = false;
            this._animateWatermark();
          }

          this.dragMode = 'pinchZoom';
          const t1 = e.touches[0];
          const t2 = e.touches[1];
          this._lastTouchDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
          const rect = this.canvas.getBoundingClientRect();
          const midX = ((t1.clientX + t2.clientX) / 2) - rect.left;
          this._pinchCenterX = midX;
          this._pinchCenterY = ((t1.clientY + t2.clientY) / 2) - rect.top;
          this._pinchPivotBar = this.xToBar(midX);
        }
      }, { passive: false });

      this.canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        this._lastTouchActiveTime = Date.now();
        const rect = this.canvas.getBoundingClientRect();

        if (e.touches.length === 1 && this.dragMode) {
          const t = e.touches[0];
          const touchX = t.clientX - rect.left;
          const touchY = t.clientY - rect.top;
          this._lastTouchX = touchX;
          this._lastTouchY = touchY;
          const dx = t.clientX - this.panStart.x;
          const dy = t.clientY - this.panStart.y;
          const dist = Math.hypot(dx, dy);

          if (this._pendingCrosshair && dist > 10) {
            this._pendingCrosshair = false;
            if (this._touchHoldTimeout) {
              clearTimeout(this._touchHoldTimeout);
              this._touchHoldTimeout = null;
            }
          }
          if (dist > 5) {
            this._isTap = false;
          }

          if (this.dragMode === 'drawingPreview' || (this.activeTool && this.drawingPoints && this.drawingPoints.length === 1)) {
            this.mousePos.x = touchX;
            this.mousePos.y = touchY;
            this.render();
          } else if (this.dragMode === 'crosshair' || this._isCrosshairDragging) {
            const deltaX = touchX - (this._lastTouchX !== undefined ? this._lastTouchX : touchX);
            const deltaY = touchY - (this._lastTouchY !== undefined ? this._lastTouchY : touchY);
            this._lastTouchX = touchX;
            this._lastTouchY = touchY;
            const chartW = rect.width - this.paddingRight;
            const chartH = rect.height - this.paddingBottom;
            const currentX = (this.mousePos && this.mousePos.x !== undefined) ? this.mousePos.x : (chartW / 2);
            const currentY = (this.mousePos && this.mousePos.y !== undefined) ? this.mousePos.y : (chartH / 2);
            this.mousePos.x = Math.max(0, Math.min(chartW - 1, currentX + deltaX));
            this.mousePos.y = Math.max(0, Math.min(chartH - 1, currentY + deltaY));
            this._fireCrosshairEvent(this.mousePos.x, this.mousePos.y);
            this.render();
          } else if (this.dragMode === 'pan') {
            if (this._isCrosshairActiveMobile && !this._isCrosshairDragging) {
              this._isCrosshairActiveMobile = false;
            }
            this.offset = this.panOffsetStart + dx;
            this._clampOffset(t);
            if ((this.priceScaleZoom ?? 1.0) !== 1.0 || (this.priceScaleOffset ?? 0) !== 0) {
              const { minPrice, maxPrice } = this.getVisibleMinMax();
              const priceRange = maxPrice - minPrice;
              const chartH = rect.height - this.paddingBottom;
              const pricePerPx = priceRange / chartH;
              const dragMultiplier = this.invertScale ? -1 : 1;
              this.priceScaleOffset = this._dragStartOffset + dy * pricePerPx * dragMultiplier;
            }
            this.render();
            this._emitRangeChange();
            this._updateRealtimeButton();
          } else if (this.dragMode === 'dragDrawing') {
            const { minPrice, maxPrice } = this.getVisibleMinMax();
            const currentBar = this.xToBar(touchX);
            const currentPrice = this.yToPrice(touchY, minPrice, maxPrice);
            const d = this.drawings[this.dragTarget.drawingIdx];
            if (this.dragTarget.handle === 'p1') {
              d.p1.idx = currentBar;
              d.p1.price = currentPrice;
              if (this.bars[currentBar]) d.p1.time = this.bars[currentBar].time;
            } else if (this.dragTarget.handle === 'p2') {
              d.p2.idx = currentBar;
              d.p2.price = currentPrice;
              if (this.bars[currentBar]) d.p2.time = this.bars[currentBar].time;
            } else if (this.dragTarget.handle === 'line') {
              const barDiff = currentBar - this.dragStartMouse.bar;
              const priceDiff = currentPrice - this.dragStartMouse.price;
              d.p1.idx = this.dragStartP1.idx + barDiff;
              d.p1.price = this.dragStartP1.price + priceDiff;
              if (this.bars[d.p1.idx]) d.p1.time = this.bars[d.p1.idx].time;
              if (d.p2 && this.dragStartP2) {
                d.p2.idx = this.dragStartP2.idx + barDiff;
                d.p2.price = this.dragStartP2.price + priceDiff;
                if (this.bars[d.p2.idx]) d.p2.time = this.bars[d.p2.idx].time;
              }
            }
            this.render();
            if (window.DrawingFloatingToolbar) window.DrawingFloatingToolbar.show(this);
          } else if (this.dragMode === 'priceScale') {
            const factor = Math.exp(-dy * 0.002);
            this.priceScaleZoom = Math.max(0.05, Math.min(50, (this._priceAxisStartZoom || 1.0) * factor));
            this.render();
          } else if (this.dragMode === 'timeScale') {
            const factor = Math.exp(-dx * 0.002);
            const chartW = rect.width - this.paddingRight;
            const maxCandleWidth = Math.max(60, (chartW / 2) - this.candleGap);
            const minCandleWidth = Math.max(0.5, (chartW / 2000) - this.candleGap);
            const startWidth = this._timeAxisStartCandleWidth || 8;
            const newWidth = Math.max(minCandleWidth, Math.min(maxCandleWidth, startWidth * factor));
            const oldSlot = startWidth + this.candleGap;
            const i_pivot = (chartW - (this._timeAxisStartOffset || 0) - startWidth / 2) / oldSlot;
            this.candleWidth = newWidth;
            const newSlot = this.candleWidth + this.candleGap;
            this.offset = chartW - i_pivot * newSlot - this.candleWidth / 2;
            this._clampOffset();
            this.render();
            this._emitRangeChange();
            this._updateRealtimeButton();
          }
        } else if (e.touches.length === 2 && this.dragMode === 'pinchZoom') {
          this._lastTouchActiveTime = Date.now();
          if (this._isCrosshairActiveMobile) {
            this._isCrosshairActiveMobile = false;
          }
          const t1 = e.touches[0];
          const t2 = e.touches[1];
          const newDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);

          if (this._lastTouchDist && this._lastTouchDist > 0) {
            const rawRatio = newDist / this._lastTouchDist;
            const factor = Math.max(0.85, Math.min(1.15, 1 + (rawRatio - 1) * 0.9));

            const chartW = rect.width - this.paddingRight;
            const maxCandleWidth = Math.max(60, (chartW / 2) - this.candleGap);
            const minCandleWidth = Math.max(0.5, (chartW / 2000) - this.candleGap);
            const oldWidth = this.candleWidth;
            const newWidth = Math.max(minCandleWidth, Math.min(maxCandleWidth, oldWidth * factor));
            if (Math.abs(newWidth - oldWidth) > 0.02) {
              const pivotX = this._pinchCenterX ?? (chartW / 2);
              const pivotBar = this._pinchPivotBar ?? this.xToBar(pivotX);
              this.candleWidth = newWidth;
              const newSlot = this.candleWidth + this.candleGap;
              this.offset = pivotX - pivotBar * newSlot - this.candleWidth / 2;
              this._clampOffset();
              this.render();
              this._emitRangeChange();
              this._updateRealtimeButton();
            }
          }
          this._lastTouchDist = newDist;
        }
      }, { passive: false });

      this.canvas.addEventListener('touchend', (e) => {
        this._lastTouchActiveTime = Date.now();
        if (this._touchHoldTimeout) {
          clearTimeout(this._touchHoldTimeout);
          this._touchHoldTimeout = null;
        }
        this._pendingCrosshair = false;

        if (e.touches.length === 0) {
          // If two-point drawing is active on mobile
          if (this.activeTool && this.drawingPoints && this.drawingPoints.length === 1 && this._drawingP1Placed) {
            if (!this._touch1Completed) {
              // Touch 1 ended: Point 1 is placed! Wait for Touch 2
              this._touch1Completed = true;
              this.render();
            } else {
              // Touch 2 ended: Place Point 2 and complete the drawing!
              const targetX = this._lastTouchX ?? (this.mousePos.x || 0);
              const targetY = this._lastTouchY ?? (this.mousePos.y || 0);
              const { minPrice, maxPrice } = this.getVisibleMinMax();
              const clickedBar = this.xToBar(targetX);
              const clickedPrice = this.yToPrice(targetY, minPrice, maxPrice);

              this.drawings.push({
                type: this.activeTool,
                p1: this.drawingPoints[0],
                p2: { idx: clickedBar, price: clickedPrice, time: this.bars[clickedBar] ? this.bars[clickedBar].time : null }
              });

              if (window.ChartingAPI && typeof window.ChartingAPI.saveCustomDrawings === 'function') {
                window.ChartingAPI.saveCustomDrawings(this, this.drawings);
              }
              this.selectedDrawingIdx = this.drawings.length - 1;
              this.drawingPoints = [];
              this.activeTool = null;
              this.dragMode = null;
              this._drawingP1Placed = false;
              this._touch1Completed = false;
              this.container.dispatchEvent(new CustomEvent('tool-deactivated'));
              this.render();
              if (window.DrawingFloatingToolbar) window.DrawingFloatingToolbar.show(this);
            }
          }

          if (this._justActivatedCrosshair) {
            // Finger was lifted right after holding to activate crosshair:
            // DO NOT dismiss! Keep the crosshair visible!
            this._justActivatedCrosshair = false;
            this._isCrosshairDragging = false;
          } else if (this._isCrosshairActiveMobile && this._isTap) {
            // Subsequent quick tap while crosshair was active -> dismiss crosshair!
            this._isCrosshairActiveMobile = false;
            this._isCrosshairDragging = false;
            this.render();
          } else {
            this._isCrosshairDragging = false;
          }

          if (this.dragMode === 'dragDrawing') {
            if (window.ChartingAPI && typeof window.ChartingAPI.saveCustomDrawings === 'function') {
              window.ChartingAPI.saveCustomDrawings(this, this.drawings);
            }
          }

          if (this.dragMode !== 'drawingPreview') {
            this.dragMode = null;
          }
          this._lastTouchDist = null;
          this._updateRealtimeButton();
        } else if (e.touches.length === 1) {
          const t = e.touches[0];
          this.dragMode = 'pan';
          this.panStart.x = t.clientX;
          this.panStart.y = t.clientY;
          this.panOffsetStart = this.offset;
          this._lastTouchDist = null;
        }
      });

      this.canvas.addEventListener('dblclick', (e) => {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        if (mouseX >= rect.width - this.paddingRight) {
          this.priceScaleOffset = 0;
          this.priceScaleZoom = 1.0;
          this.render();
        } else if (mouseY >= rect.height - this.paddingBottom) {
          this.resetView();
        }
      });

      window.addEventListener('keydown', (e) => {
        if ((e.key === 'Delete' || e.key === 'Backspace') && this.selectedDrawingIdx !== null && this.selectedDrawingIdx !== undefined) {
          const tag = document.activeElement?.tagName;
          if (tag === 'INPUT' || tag === 'TEXTAREA') return;
          this.drawings.splice(this.selectedDrawingIdx, 1);
          this.selectedDrawingIdx = null;
          this.render();
          if (window.DrawingFloatingToolbar) {
            window.DrawingFloatingToolbar.hide();
          }
        }
      });
    }

    _fireCrosshairEvent(x, y) {
      const hoverIdx = this.xToBar(x);
      const crosshairEvent = {
        time: this.bars[hoverIdx]?.time || null,
        logical: hoverIdx,
        point: { x, y },
        seriesData: this.bars[hoverIdx] || null
      };
      this._crosshairMoveListeners.forEach(fn => { try { fn(crosshairEvent); } catch(_) {} });
    }
  }

  window.BacktestxChartCore = BacktestxChartCore;
})(window);