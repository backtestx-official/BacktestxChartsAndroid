// datafeed.js - Self-contained Demo Datafeed providing realistic historical OHLCV data & live real-time candle tick streaming
(function(window) {
  // Helper to map resolution to milliseconds
  function resolutionToMs(resolution) {
    if (!resolution) return 60 * 1000;
    const str = String(resolution).trim();
    const map = {
      '1S': 1000, '1s': 1000, '5S': 5000, '5s': 5000,
      '1': 60000, '1m': 60000,
      '2': 120000, '2m': 120000,
      '3': 180000, '3m': 180000,
      '5': 300000, '5m': 300000,
      '10': 600000, '10m': 600000,
      '15': 900000, '15m': 900000,
      '30': 1800000, '30m': 1800000,
      '45': 2700000, '45m': 2700000,
      '60': 3600000, '1H': 3600000, '1h': 3600000,
      '120': 7200000, '2H': 7200000, '2h': 7200000,
      '180': 10800000, '3H': 10800000, '3h': 10800000,
      '240': 14400000, '4H': 14400000, '4h': 14400000,
      '360': 21600000, '6H': 21600000, '6h': 21600000,
      '720': 43200000, '12H': 43200000, '12h': 43200000,
      '1D': 86400000, '1d': 86400000, 'D': 86400000,
      '1W': 7 * 86400000, '1w': 7 * 86400000, 'W': 7 * 86400000,
      '1M': 30 * 86400000, 'M': 30 * 86400000
    };
    if (map[str]) return map[str];

    const match = str.match(/^(\d+)([a-zA-Z]*)$/);
    if (match) {
      const val = parseInt(match[1], 10);
      const unit = (match[2] || 'm').toLowerCase();
      if (unit === 's') return val * 1000;
      if (unit === 'm') return val * 60 * 1000;
      if (unit === 'h') return val * 3600 * 1000;
      if (unit === 'd') return val * 86400 * 1000;
      if (unit === 'w') return val * 7 * 86400 * 1000;
      if (unit === 'm') return val * 30 * 86400 * 1000;
    }
    return 60 * 1000;
  }

  // Base price lookup for common symbols
  function getBasePrice(symbol) {
    const sym = String(symbol || 'BTCUSD').toUpperCase();
    if (sym.includes('BTC')) return 67450.00;
    if (sym.includes('ETH')) return 2635.50;
    if (sym.includes('SOL')) return 178.20;
    if (sym.includes('AAPL')) return 232.50;
    if (sym.includes('TSLA')) return 218.40;
    if (sym.includes('NVDA')) return 141.80;
    if (sym.includes('GOOG')) return 166.20;
    if (sym.includes('AMZN')) return 187.30;
    return 1000.00;
  }

  class DemoDatafeed {
    constructor() {
      this._subs = {};
      this._barsCache = {};
    }

    // ─── Symbol Resolution ───────────────────────────────────────────────────
    async resolveSymbol(symbolName) {
      if (window.ChartingAPI && typeof window.ChartingAPI.resolveCustomSymbol === 'function') {
        return new Promise((resolve, reject) => {
          window.ChartingAPI.resolveCustomSymbol(symbolName, resolve, reject);
        });
      }

      const name = String(symbolName || 'BTCUSD').toUpperCase();
      const base = getBasePrice(name);
      const isCrypto = name.includes('BTC') || name.includes('ETH') || name.includes('SOL') || name.includes('USDT');

      return {
        name: name,
        description: `${name} Demo Live Feed`,
        type: isCrypto ? 'crypto' : 'stock',
        exchange: 'BACKTESTX DEMO',
        minmov: 1,
        pricescale: base > 1000 ? 100 : 100,
        has_intraday: true,
        supported_resolutions: ['1S', '5S', '1m', '2m', '3m', '5m', '10m', '15m', '30m', '45m', '1H', '2H', '3H', '4H', '6H', '12H', '1D', '1W', '1M'],
      };
    }

    // ─── Historical Bars Generation ──────────────────────────────────────────
    async getBars(symbolName, resolution, from, to, onResult) {
      const symbol = String(symbolName || 'BTCUSD').toUpperCase();
      const intervalMs = resolutionToMs(resolution);
      const now = Date.now();
      const toMs = (to && to * 1000 < now) ? to * 1000 : now;
      const fromMs = (from && from * 1000) ? from * 1000 : (toMs - 500 * intervalMs);

      // Number of bars to generate
      const maxBars = 1000;
      const count = Math.min(maxBars, Math.max(300, Math.floor((toMs - fromMs) / intervalMs)));
      const basePrice = getBasePrice(symbol);
      const volatility = basePrice > 10000 ? 0.0025 : 0.004;

      const bars = [];
      let currentClose = basePrice * (0.92 + Math.random() * 0.16);
      const firstBarTime = toMs - (count - 1) * intervalMs;

      for (let i = 0; i < count; i++) {
        const barTime = Math.floor((firstBarTime + i * intervalMs) / intervalMs) * intervalMs;
        const open = currentClose;
        // Natural geometric random walk
        const changePercent = (Math.random() - 0.492) * volatility;
        const close = Math.round(Math.max(1, open * (1 + changePercent)) * 100) / 100;
        const wickHigh = Math.random() * (open * volatility * 0.75);
        const wickLow = Math.random() * (open * volatility * 0.75);
        const high = Math.round(Math.max(open, close) + wickHigh * 100) / 100;
        const low = Math.round(Math.max(0.01, Math.min(open, close) - wickLow) * 100) / 100;
        const volume = Math.round(Math.random() * 45 + 15);

        bars.push({
          time: barTime,
          open: open,
          high: Math.max(high, open, close),
          low: Math.min(low, open, close),
          close: close,
          volume: volume
        });

        currentClose = close;
      }

      // Cache the last generated bar for this symbol/resolution stream
      const cacheKey = `${symbol}_${resolution}`;
      this._barsCache[cacheKey] = bars[bars.length - 1];

      // Return generated bars
      setTimeout(() => {
        onResult({ bars: bars, noData: bars.length === 0 });
      }, 20);
    }

    // ─── Real-time Live Candle Streaming ─────────────────────────────────────
    subscribeBars(symbolName, resolution, onRealtimeCallback, subscriberUID) {
      console.log(`📡 [DemoDatafeed] Subscribing live ticks for: ${symbolName} (${resolution}) with UID ${subscriberUID}`);
      
      const symbol = String(symbolName || 'BTCUSD').toUpperCase();
      const intervalMs = resolutionToMs(resolution);
      const cacheKey = `${symbol}_${resolution}`;

      // Initialize current active candle
      const now = Date.now();
      const currentCandleTime = Math.floor(now / intervalMs) * intervalMs;
      const cached = this._barsCache[cacheKey];

      let activeBar;
      if (cached && cached.time === currentCandleTime) {
        activeBar = { ...cached };
      } else {
        const prevPrice = cached ? cached.close : getBasePrice(symbol);
        activeBar = {
          time: currentCandleTime,
          open: prevPrice,
          high: prevPrice,
          low: prevPrice,
          close: prevPrice,
          volume: 1
        };
      }

      // Clean up any existing subscription for this UID
      if (this._subs[subscriberUID]) {
        clearInterval(this._subs[subscriberUID].timer);
      }

      // Run live real-time tick generator (ticks every 600ms - 900ms)
      const basePrice = getBasePrice(symbol);
      const tickVolatility = basePrice > 10000 ? 0.0006 : 0.001;

      const timer = setInterval(() => {
        const currentTime = Date.now();
        const expectedBarTime = Math.floor(currentTime / intervalMs) * intervalMs;

        if (expectedBarTime > activeBar.time) {
          // ─── A NEW CANDLE HAS OPENED ───
          const newOpen = activeBar.close;
          activeBar = {
            time: expectedBarTime,
            open: newOpen,
            high: newOpen,
            low: newOpen,
            close: newOpen,
            volume: Math.round(Math.random() * 3 + 1)
          };
          console.log(`🕯️ [DemoDatafeed] New live candle opened at: ${new Date(expectedBarTime).toLocaleTimeString()} (${symbol})`);
        } else {
          // ─── LIVE PRICE FLICKER ON CURRENT CANDLE ───
          const delta = (Math.random() - 0.495) * (activeBar.close * tickVolatility);
          const newClose = Math.round(Math.max(1, activeBar.close + delta) * 100) / 100;
          activeBar.close = newClose;
          activeBar.high = Math.max(activeBar.high, newClose);
          activeBar.low = Math.min(activeBar.low, newClose);
          activeBar.volume += Math.round(Math.random() * 2 + 1);
        }

        // Emit live updated candle to subscriber
        if (typeof onRealtimeCallback === 'function') {
          onRealtimeCallback({ ...activeBar });
        }
      }, 750);

      this._subs[subscriberUID] = {
        timer: timer,
        symbol: symbol,
        resolution: resolution
      };
    }

    unsubscribeBars(subscriberUID) {
      console.log(`🔌 [DemoDatafeed] Unsubscribing UID: ${subscriberUID}`);
      const sub = this._subs[subscriberUID];
      if (sub) {
        if (sub.timer) clearInterval(sub.timer);
        delete this._subs[subscriberUID];
      }
    }
  }

  // Expose to window as Datafeed so App.js and chart engine connect seamlessly
  window.Datafeed = DemoDatafeed;
  window.DemoDatafeed = DemoDatafeed;
})(window);
