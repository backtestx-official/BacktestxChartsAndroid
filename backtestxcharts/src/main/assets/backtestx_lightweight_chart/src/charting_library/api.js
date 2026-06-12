// api.js - Public Charting API for custom candle renderers and drawing tools
(function(window) {
  // Registries
  const candleRegistry = {};
  const drawingsRegistry = {};
  const indicatorsRegistry = {};
  const scalesRegistry = {};
  const customIntervals = [];
  let pendingWatermarkSettings = null;

  const ChartingAPI = {
    /**
     * Register a new candle renderer
     * @param {string} type - Name of the candle type
     * @param {function} renderFn - Renderer function
     */
    registerCandleType: function(type, renderFn) {
      candleRegistry[type.toLowerCase()] = renderFn;
      console.log(`🔌 [ChartingAPI] Registered candle renderer: ${type}`);
    },

    /**
     * Retrieve a candle renderer function by name
     * @param {string} type - Name of the candle type
     * @returns {function|null} - The renderer function or null if not found
     */
    getCandleRenderer: function(type) {
      return candleRegistry[type.toLowerCase()] || null;
    },

    /**
     * Get a list of all registered candle types
     * @returns {string[]}
     */
    getAvailableCandleTypes: function() {
      return Object.keys(candleRegistry);
    },

    /**
     * Register a custom drawing tool configuration
     * @param {string} type - Name of the custom drawing
     * @param {object} config - Configuration object: { clicks, render, renderPreview, hitTest }
     */
    registerCustomDrawing: function(type, config) {
      drawingsRegistry[type.toLowerCase()] = config;
      console.log(`🔌 [ChartingAPI] Registered custom drawing tool: ${type}`);
    },

    /**
     * Retrieve a custom drawing configuration by name
     * @param {string} type - Name of the drawing tool
     * @returns {object|null} - The configuration object or null
     */
    getCustomDrawing: function(type) {
      return drawingsRegistry[type.toLowerCase()] || null;
    },

    /**
     * Get list of all registered custom drawing types
     * @returns {string[]}
     */
    getAvailableCustomDrawings: function() {
      return Object.keys(drawingsRegistry);
    },

    /**
     * Save the drawings of the chart to LocalStorage
     * @param {object} chart - Chart instance
     * @returns {boolean} - True if successful
     */
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

    /**
     * Load drawings for the chart's current symbol from LocalStorage
     * @param {object} chart - Chart instance
     * @returns {array} - Array of loaded drawings
     */
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

    /**
     * Register a Y-axis price scale drawing label renderer
     * @param {function} renderFn - Renderer function
     */
    registerPriceScaleDrawingLabel: function(renderFn) {
      ChartingAPI.drawPriceScaleDrawingLabel = renderFn;
      console.log("🔌 [ChartingAPI] Registered price scale drawing label renderer");
    },

    /**
     * Register a X-axis timescale drawing label renderer
     * @param {function} renderFn - Renderer function
     */
    registerTimescaleDrawingLabel: function(renderFn) {
      ChartingAPI.drawTimescaleDrawingLabel = renderFn;
      console.log("🔌 [ChartingAPI] Registered timescale drawing label renderer");
    },

    /**
     * Register a technical indicator renderer
     * @param {string} type - Name of the indicator
     * @param {object} config - Configuration object: { name, type, params, calculate, render }
     */
    registerIndicator: function(type, config) {
      indicatorsRegistry[type.toLowerCase()] = config;
      console.log(`🔌 [ChartingAPI] Registered technical indicator: ${type}`);
    },

    /**
     * Retrieve a technical indicator by name
     * @param {string} type - Name of the indicator
     * @returns {object|null}
     */
    getIndicator: function(type) {
      return indicatorsRegistry[type.toLowerCase()] || null;
    },

    /**
     * Get list of all registered technical indicators
     * @returns {string[]}
     */
    getAvailableIndicators: function() {
      return Object.keys(indicatorsRegistry);
    },

    /**
     * Register a custom interval for the resolution picker dropdown
     * @param {string} resolution
     */
    registerCustomInterval: function(resolution) {
      if (!customIntervals.includes(resolution)) {
        customIntervals.push(resolution);
        console.log(`🔌 [ChartingAPI] Registered custom interval: ${resolution}`);
      }
    },

    /**
     * Get all developer-registered custom intervals
     * @returns {string[]}
     */
    getCustomIntervals: function() {
      return customIntervals;
    },

    /**
     * Get the SmartLoader class
     * @returns {class|null}
     */
    getSmartLoader: function() {
      return window.SmartLoader || null;
    },

    /**
     * Set watermark settings dynamically and trigger a chart re-render
     * @param {object} settings
     */
    setWatermark: function(settings) {
      if (window.Watermarks) {
        window.Watermarks.settings = {
          ...window.Watermarks.settings,
          ...settings
        };
      } else {
        pendingWatermarkSettings = {
          ...pendingWatermarkSettings,
          ...settings
        };
      }
      if (window.chart && typeof window.chart.render === 'function') {
        window.chart.render();
      }
      console.log("🔌 [ChartingAPI] Watermark settings updated:", settings);
    },

    /**
     * Get current watermark settings
     * @returns {object}
     */
    getWatermark: function() {
      return window.Watermarks ? window.Watermarks.settings : (pendingWatermarkSettings || {});
    },

    /**
     * Get pending watermark settings (used internally by water-marks.js)
     * @returns {object|null}
     */
    getPendingWatermarkSettings: function() {
      return pendingWatermarkSettings;
    },

    /**
     * Register a new custom horizontal scale helper
     * @param {string} type - Name of the scale (e.g. 'yield-curve')
     * @param {object} scaleObj - Scale helper object: { barToX, xToBar, getVisibleRange, drawTimeScale, drawTimeBadge }
     */
    registerHorizontalScale: function(type, scaleObj) {
      scalesRegistry[type.toLowerCase()] = scaleObj;
      console.log(`🔌 [ChartingAPI] Registered horizontal scale: ${type}`);
    },

    /**
     * Retrieve a horizontal scale helper by name
     * @param {string} type - Name of the scale
     * @returns {object|null} - The scale helper object or null
     */
    getHorizontalScale: function(type) {
      return scalesRegistry[type.toLowerCase()] || null;
    },

    /**
     * Get a list of all registered horizontal scales
     * @returns {string[]}
     */
    getAvailableHorizontalScales: function() {
      return Object.keys(scalesRegistry);
    }
  };

  // Attach to window
  window.ChartingAPI = ChartingAPI;
})(window);
