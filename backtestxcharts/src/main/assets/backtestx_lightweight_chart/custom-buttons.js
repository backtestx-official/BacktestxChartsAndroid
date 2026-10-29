// custom-buttons.js - Users can add their own top toolbar buttons here
(function(window) {
  if (!window.ChartingAPI) {
    console.error("🔌 [custom-buttons.js] ChartingAPI not found. Make sure api.js is loaded first.");
    return;
  }

  // ─── Register 1-Click Screenshot / Export PNG Button ───
  window.ChartingAPI.registerTopToolbarButton('btn_screenshot', {
    label: '',
    tooltip: 'Take a snapshot (Download PNG)',
    alignment: 'right',
    iconSvg: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
      <circle cx="12" cy="13" r="4"></circle>
    </svg>`,
    onClick: function(chart) {
      if (chart && typeof chart.takeScreenshot === 'function') {
        chart.takeScreenshot(true);
      }
    }
  });

  console.log("🔌 [custom-buttons.js] Loaded and registered custom buttons successfully.");
})(window);
