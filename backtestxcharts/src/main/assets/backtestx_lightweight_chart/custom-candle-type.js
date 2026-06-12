// custom-candle-type.js - Developer-customizable script to register custom candle types/renderers
(function(window) {
  // Ensure the ChartingAPI is registered on window before using
  if (!window.ChartingAPI) {
    console.error("ChartingAPI not loaded yet.");
    return;
  }
  
  // Example: Register a custom candle type.
  // Developers can define their custom renderer function here.
  // The function takes the following arguments:
  // - ctx: CanvasRenderingContext2D
  // - visibleBars: Array of bar objects: { time, open, high, low, close, volume }
  // - slot: Total width allocated per candle (including gap)
  // - bodyW: Calculated candle body width
  // - chartH: Total height of the price scale clip area
  // - priceToY: Helper function to convert price to Y coordinate
  // - themeColors: Active theme colors: { bullColor, bearColor }
  // - xOffset: Starting X position on the canvas for the visible bars
  // - chartInstance: The chart widget context
  
  /*
  window.ChartingAPI.registerCandleType('my_custom_candles', function(ctx, visibleBars, slot, bodyW, chartH, priceToY, themeColors, xOffset, chartInstance) {
    ctx.save();
    ctx.strokeStyle = '#ff9800'; // Custom orange color
    ctx.lineWidth = 1.5;
    
    visibleBars.forEach((bar, index) => {
      const x = xOffset + index * slot + slot / 2;
      const yOpen = priceToY(bar.open);
      const yClose = priceToY(bar.close);
      const yHigh = priceToY(bar.high);
      const yLow = priceToY(bar.low);
      
      // Draw wick
      ctx.beginPath();
      ctx.moveTo(x, yHigh);
      ctx.lineTo(x, yLow);
      ctx.stroke();
      
      // Draw body
      ctx.fillStyle = bar.close >= bar.open ? '#26a69a' : '#ef5350';
      ctx.fillRect(x - bodyW / 2, Math.min(yOpen, yClose), bodyW, Math.max(1, Math.abs(yClose - yOpen)));
    });
    ctx.restore();
  });
  */

  console.log("🔌 [ChartingAPI] Loaded custom developer candle types successfully.");
})(window);
