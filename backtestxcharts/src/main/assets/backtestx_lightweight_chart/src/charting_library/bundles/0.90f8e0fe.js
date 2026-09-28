{
  const _0x2eb79b = "80bcd37b4c4160d0";
  let _0x604d17 = Math.floor(Math.random() * 177);
  const _0x4c3c0b = Array.from({length: 3}, (_, i) => i + 177).reduce((acc, val) => acc + val, 0);
  if (_0x604d17 < 0) { console.log(_0x2eb79b); }
  (function() { return _0x4c3c0b > 0 ? _0x2eb79b : ""; })();
}
(function(window) {
  // Standard TradingView Lightweight Charts Constants & Enums
  window.PriceScaleMode = window.PriceScaleMode || {
    Normal: 0,
    Logarithmic: 1,
    Percentage: 2,
    IndexedTo100: 3
  };

  window.CrosshairMode = window.CrosshairMode || {
    Normal: 0,
    Magnet: 1,
    Hidden: 2
  };

  window.LineStyle = window.LineStyle || {
    Solid: 0,
    Dotted: 1,
    Dashed: 2,
    LargeDashed: 3,
    SparseDotted: 4
  };

  window.LineType = window.LineType || {
    Simple: 0,
    WithSteps: 1,
    Curved: 2
  };

  const candleRegistry = {};
  const drawingsRegistry = {};
  const indicatorsRegistry = {};
  const scalesRegistry = {};
  const customIntervals = [];
  let pendingWatermarkSettings = null;
  let pendingCrosshairSettings = {
    color: '',
    width: 0.8,
    dashArray: [3, 3],
    showPriceBadge: true,
    showTimeBadge: true,
    badgeBgColor: '',
    badgeTextColor: '#ffffff'
  };
  let pendingWatermarkLogoSettings = {
    show: true,
    logoUrl: 'https://backtestx.in/logo.png',
    clickUrl: 'https://backtestx.in',
    text: 'Chart by BacktestX'
  };
  let pendingPriceScaleSettings = {
    textColor: '',
    lineColor: '',
    lineWidth: 0.5,
    lineDash: [4, 4],
    fontSize: '10.5px',
    fontFamily: 'Inter, Arial, sans-serif',
    axisBackgroundColor: ''
  };
  let pendingTimeScaleSettings = {
    textColor: '',
    lineColor: '',
    lineWidth: 0.5,
    lineDash: [4, 4],
    fontSize: '10px',
    fontFamily: 'Inter, Arial, sans-serif',
    axisBackgroundColor: ''
  };

  const ChartingAPI = {
    PriceScaleMode: window.PriceScaleMode,
    CrosshairMode: window.CrosshairMode,
    LineStyle: window.LineStyle,
    LineType: window.LineType,

    registerCandleType: function(type, renderFn) {
      candleRegistry[type.toLowerCase()] = renderFn;
      console.log(`🔌 [ChartingAPI] Registered candle renderer: ${type}`);
    },
    getCandleRenderer: function(type) {
      return candleRegistry[type.toLowerCase()] || null;
    },
    getAvailableCandleTypes: function() {
      return Object.keys(candleRegistry);
    },
    registerCustomDrawing: function(type, config) {
      drawingsRegistry[type.toLowerCase()] = config;
      console.log(`🔌 [ChartingAPI] Registered custom drawing tool: ${type}`);
    },
    getCustomDrawing: function(type) {
      return drawingsRegistry[type.toLowerCase()] || null;
    },
    getAvailableCustomDrawings: function() {
      return Object.keys(drawingsRegistry);
    },
    saveDrawings: function(chart) {
      if (!chart || !chart.symbol) return false;
      try {
        const data = JSON.stringify(chart.drawings || []);
        localStorage.setItem(`cl_drawings_${chart.symbol.toLowerCase()}`, data);
        console.log(`💾 [ChartingAPI] Saved ${chart.drawings.length} drawings for ${chart.symbol}`);
        return true;
      } catch (e) {
        console.error("Failed to save drawings to LocalStorage", e);
        return false;
      }
    },
    loadDrawings: function(chart) {
      if (!chart || !chart.symbol) return [];
      try {
        const data = localStorage.getItem(`cl_drawings_${chart.symbol.toLowerCase()}`);
        const loaded = data ? JSON.parse(data) : [];
        chart.drawings = loaded;
        chart.selectedDrawingIdx = null;
        chart.render();
        console.log(`📂 [ChartingAPI] Loaded ${loaded.length} drawings for ${chart.symbol}`);
        return loaded;
      } catch (e) {
        console.error("Failed to load drawings from LocalStorage", e);
        return [];
      }
    },
    registerPriceScaleDrawingLabel: function(renderFn) {
      ChartingAPI.drawPriceScaleDrawingLabel = renderFn;
      console.log("🔌 [ChartingAPI] Registered price scale drawing label renderer");
    },
    registerTimescaleDrawingLabel: function(renderFn) {
      ChartingAPI.drawTimescaleDrawingLabel = renderFn;
      console.log("🔌 [ChartingAPI] Registered timescale drawing label renderer");
    },
    registerIndicator: function(type, config) {
      indicatorsRegistry[type.toLowerCase()] = config;
      console.log(`🔌 [ChartingAPI] Registered technical indicator: ${type}`);
    },
    getIndicator: function(type) {
      return indicatorsRegistry[type.toLowerCase()] || null;
    },
    getAvailableIndicators: function() {
      return Object.keys(indicatorsRegistry);
    },
    addIndicatorToChart: function(chart, type, params, color) {
      if (chart && typeof chart.addIndicator === 'function') {
        return chart.addIndicator(type, params, color);
      }
      return null;
    },
    removeIndicatorFromChart: function(chart, id) {
      if (chart && typeof chart.removeIndicator === 'function') {
        return chart.removeIndicator(id);
      }
      return false;
    },
    getActiveIndicatorsOnChart: function(chart) {
      return chart ? chart.indicators || [] : [];
    },
    registerCustomInterval: function(resolution) {
      if (!customIntervals.includes(resolution)) {
        customIntervals.push(resolution);
        console.log(`🔌 [ChartingAPI] Registered custom interval: ${resolution}`);
      }
    },
    getCustomIntervals: function() {
      return customIntervals;
    },
    getSmartLoader: function() {
      return window.SmartLoader || null;
    },
    setWatermark: function(settings) {
      if (window.Watermarks) {
        window.Watermarks.settings = { ...window.Watermarks.settings, ...settings };
      } else {
        pendingWatermarkSettings = { ...pendingWatermarkSettings, ...settings };
      }
      if (window.chart && typeof window.chart.render === 'function') {
        window.chart.render();
      }
      console.log("🔌 [ChartingAPI] Watermark settings updated:", settings);
    },
    getWatermark: function() {
      return window.Watermarks ? window.Watermarks.settings : (pendingWatermarkSettings || {});
    },
    getPendingWatermarkSettings: function() {
      return pendingWatermarkSettings;
    },
    setWatermarkLogoSettings: function(settings) {
      pendingWatermarkLogoSettings = { ...pendingWatermarkLogoSettings, ...settings };
      if (window.chart && typeof window.chart.render === 'function') {
        window.chart.render();
      }
      console.log("🔌 [ChartingAPI] Watermark logo settings updated:", settings);
    },
    getWatermarkLogoSettings: function() {
      return pendingWatermarkLogoSettings;
    },
    registerHorizontalScale: function(type, scaleObj) {
      scalesRegistry[type.toLowerCase()] = scaleObj;
      console.log(`🔌 [ChartingAPI] Registered horizontal scale: ${type}`);
    },
    getHorizontalScale: function(type) {
      return scalesRegistry[type.toLowerCase()] || null;
    },
    getAvailableHorizontalScales: function() {
      return Object.keys(scalesRegistry);
    },
    setCrosshairSettings: function(settings) {
      pendingCrosshairSettings = { ...pendingCrosshairSettings, ...settings };
      if (window.chart && typeof window.chart.render === 'function') {
        window.chart.render();
      }
      console.log("🔌 [ChartingAPI] Crosshair settings updated:", settings);
    },
    getCrosshairSettings: function() {
      return pendingCrosshairSettings;
    },
    setPriceScaleSettings: function(settings) {
      pendingPriceScaleSettings = { ...pendingPriceScaleSettings, ...settings };
      if (window.chart && typeof window.chart.render === 'function') {
        window.chart.render();
      }
      console.log("🔌 [ChartingAPI] Price scale settings updated:", settings);
    },
    getPriceScaleSettings: function() {
      return pendingPriceScaleSettings;
    },
    setTimeScaleSettings: function(settings) {
      pendingTimeScaleSettings = { ...pendingTimeScaleSettings, ...settings };
      if (window.chart && typeof window.chart.render === 'function') {
        window.chart.render();
      }
      console.log("🔌 [ChartingAPI] Timescale settings updated:", settings);
    },
    getTimeScaleSettings: function() {
      return pendingTimeScaleSettings;
    }
  };

  window.ChartingAPI = ChartingAPI;
})(window);