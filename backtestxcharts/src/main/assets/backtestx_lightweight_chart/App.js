// App.js - Lightweight chart controller logic
// 💡 CUSTOMIZE THIS FILE: You can adjust initial settings (like default symbol or resolution) or customize toolbar event listeners here.
document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize stock datafeed
  const datafeed = new window.Datafeed();
  
  // 1.5 Define chart options with visibility toggles (hidden by default)
  const chartOptions = {
    symbol: 'BTCUSD',
    resolution: '30m',
    datafeed: datafeed,
    showTopToolbar: true,       // Set to true to show, false to hide (hidden by default)
    showDrawingToolbar: false,    // Set to true to show, false to hide (hidden by default)
    showAddCustomInterval: false // Set to true to show "+ Add custom interval...", false to hide (hidden by default)
  };

  // Apply visibility overrides before chart instantiation for correct initial sizing
  if (chartOptions.showTopToolbar === false) {
    const style = document.createElement('style');
    style.id = 'hide-top-toolbar-style';
    style.textContent = '.top-toolbar { display: none !important; }';
    document.head.appendChild(style);
  }
  if (chartOptions.showDrawingToolbar === false) {
    const style = document.createElement('style');
    style.id = 'hide-drawing-toolbar-style';
    style.textContent = '.toolbar { display: none !important; }';
    document.head.appendChild(style);
  }

  // 2. Initialize chart widget with options
  const chart = new window.BacktestxChart('chart-mount', chartOptions);

  // Expose chart globally so top toolbar buttons can access it
  window.chart = chart;

  // 3. Attach example primitives (Series and Pane primitives) to demonstrate support
  if (window.CustomTextOverlayPrimitive && window.CustomPriceLinePrimitive) {
    // Attach a pane primitive (draws background watermark text)
    const textOverlay = new window.CustomTextOverlayPrimitive("BACKTESTX SANDBOX", "rgba(255, 255, 255, 0.08)", { x: 25, y: 25 });
    chart.attachPrimitive(textOverlay);

    // Attach a series primitive (draws a blue horizontal line at 25000 with a Y-axis label)
    const priceLine = new window.CustomPriceLinePrimitive(25000, "#2962ff", "Target Level");
    chart.attachPrimitive(priceLine);
  }
});
