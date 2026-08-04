{
  const _0xe61908 = "538618da8cbe9432";
  let _0x0c46a7 = Math.floor(Math.random() * 524);
  const _0x63a55a = Array.from({length: 3}, (_, i) => i + 524).reduce((acc, val) => acc + val, 0);
  if (_0x0c46a7 < 0) { console.log(_0xe61908); }
  (function() { return _0x63a55a > 0 ? _0xe61908 : ""; })();
}
(function(window) {
    class SettingsPopup {
        constructor() {
            this.modal = null;
            this.activeTab = 'Symbol';
            this.chart = null;
            
            // Add required CSS
            if (!document.getElementById('backtestx-settings-css')) {
                const style = document.createElement('style');
                style.id = 'backtestx-settings-css';
                style.textContent = `
                    .bx-settings-overlay {
                        position: fixed;
                        top: 0; left: 0; right: 0; bottom: 0;
                        background: rgba(0,0,0,0.4);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 99999;
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                    }
                    .bx-settings-modal {
                        background: var(--bg-color, #ffffff);
                        border-radius: 8px;
                        width: 600px;
                        max-width: 90vw;
                        height: 500px;
                        max-height: 90vh;
                        display: flex;
                        flex-direction: column;
                        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                        overflow: hidden;
                    }
                    .light-theme .bx-settings-modal {
                        --bg-color: #ffffff;
                        --text-color: #131722;
                        --border-color: #e0e3eb;
                        --tab-bg: #f0f3fa;
                        --tab-active-bg: #131722;
                        --tab-active-color: #ffffff;
                        --tab-hover: #e0e3eb;
                        --btn-bg: #2962ff;
                        --btn-color: #ffffff;
                    }
                    body:not(.light-theme) .bx-settings-modal {
                        --bg-color: #1e222d;
                        --text-color: #d1d4dc;
                        --border-color: #2a2e39;
                        --tab-bg: #2a2e39;
                        --tab-active-bg: #d1d4dc;
                        --tab-active-color: #1e222d;
                        --tab-hover: #363a45;
                        --btn-bg: #2962ff;
                        --btn-color: #ffffff;
                    }
                    
                    .bx-settings-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 16px 20px;
                        border-bottom: 1px solid var(--border-color);
                        color: var(--text-color);
                        font-weight: 600;
                        font-size: 16px;
                    }
                    .bx-settings-close {
                        cursor: pointer;
                        color: #787b86;
                        font-size: 20px;
                        line-height: 1;
                    }
                    .bx-settings-close:hover { color: var(--text-color); }
                    
                    .bx-settings-body {
                        display: flex;
                        flex: 1;
                        overflow: hidden;
                    }
                    .bx-settings-sidebar {
                        width: 160px;
                        border-right: 1px solid var(--border-color);
                        padding: 12px 8px;
                        display: flex;
                        flex-direction: column;
                        gap: 4px;
                    }
                    .bx-settings-tab {
                        padding: 10px 12px;
                        border-radius: 4px;
                        cursor: pointer;
                        color: var(--text-color);
                        font-size: 13px;
                        transition: background 0.2s;
                    }
                    .bx-settings-tab:hover {
                        background: var(--tab-hover);
                    }
                    .bx-settings-tab.active {
                        background: var(--tab-active-bg);
                        color: var(--tab-active-color);
                        font-weight: 500;
                    }
                    
                    .bx-settings-content {
                        flex: 1;
                        padding: 20px;
                        overflow-y: auto;
                        color: var(--text-color);
                        font-size: 14px;
                    }
                    
                    .bx-settings-footer {
                        display: flex;
                        justify-content: space-between;
                        padding: 16px 20px;
                        border-top: 1px solid var(--border-color);
                    }
                    
                    .bx-btn {
                        padding: 8px 24px;
                        border-radius: 4px;
                        border: none;
                        font-size: 14px;
                        cursor: pointer;
                        font-weight: 500;
                    }
                    .bx-btn-secondary {
                        background: transparent;
                        color: var(--text-color);
                        border: 1px solid var(--border-color);
                    }
                    .bx-btn-primary {
                        background: var(--btn-bg);
                        color: var(--btn-color);
                    }
                    .bx-btn-template {
                        background: transparent;
                        color: var(--text-color);
                        border: 1px solid var(--border-color);
                        display: flex;
                        align-items: center;
                        gap: 6px;
                    }
                    .bx-settings-section {
                        margin-bottom: 24px;
                    }
                    .bx-settings-section h4 {
                        margin: 0 0 12px 0;
                        font-size: 14px;
                        font-weight: 600;
                    }
                    .bx-settings-row {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 12px;
                    }
                    .bx-settings-row label {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        cursor: pointer;
                        font-size: 13px;
                    }
                    .color-pickers {
                        display: flex;
                        gap: 4px;
                    }
                    .color-pickers input[type="color"] {
                        width: 24px;
                        height: 24px;
                        padding: 0;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                        background: none;
                    }
                    .color-pickers input[type="color"]::-webkit-color-swatch-wrapper {
                        padding: 0;
                    }
                    .color-pickers input[type="color"]::-webkit-color-swatch {
                        border: none;
                        border-radius: 4px;
                    }
                `;
                document.head.appendChild(style);
            }
        }

        show(chart) {
            this.chart = chart;
            if (!this.chart.options.chartSettings) {
                this.chart.options.chartSettings = {}; try { localStorage.removeItem('bx_chart_settings'); } catch(e) {}
            }
            if (!this.chart.options.chartSettings.symbol) {
                this.chart.options.chartSettings.symbol = {};
            }
            if (this.modal) {
                this.close();
            }
            this.render();
        }

        close() {
            if (this.modal && this.modal.parentNode) {
                this.modal.parentNode.removeChild(this.modal);
            }
            this.modal = null;
        }

        setTab(tabName) {
            this.activeTab = tabName;
            if (this.modal) {
                const tabs = this.modal.querySelectorAll('.bx-settings-tab');
                tabs.forEach(t => {
                    if (t.dataset.tab === tabName) {
                        t.classList.add('active');
                    } else {
                        t.classList.remove('active');
                    }
                });
                const content = this.modal.querySelector('.bx-settings-content');
                if (tabName === 'Symbol') {
                    const cs = this.chart.options.chartSettings.symbol;
                    const cType = this.chart.chartType || 'candlestick';

                    if (cType === 'line' || cType === 'area') {
                        content.innerHTML = `
                            <div class="bx-settings-section">
                                <h4>Line</h4>
                                <div class="bx-settings-row">
                                    <label>Color</label>
                                    <div class="color-pickers">
                                        <input type="color" id="bx-color-line" value="${cs.lineColor || '#2962ff'}">
                                    </div>
                                </div>
                            </div>
                        `;
                        const bindColor = (id, key) => {
                            const el = document.getElementById(id);
                            if(el) el.addEventListener('input', (e) => { cs[key] = e.target.value; this.chart.render(); try { localStorage.setItem('bx_chart_settings', JSON.stringify(this.chart.options.chartSettings)); } catch(e) {} });
                        };
                        bindColor('bx-color-line', 'lineColor');
                    } else if (cType === 'bar') {
                        content.innerHTML = `
                            <div class="bx-settings-section">
                                <h4>Bars</h4>
                                <div class="bx-settings-row">
                                    <label>Up Color</label>
                                    <div class="color-pickers">
                                        <input type="color" id="bx-color-bar-up" value="${cs.bodyBull || '#26a69a'}">
                                    </div>
                                </div>
                                <div class="bx-settings-row">
                                    <label>Down Color</label>
                                    <div class="color-pickers">
                                        <input type="color" id="bx-color-bar-down" value="${cs.bodyBear || '#ef5350'}">
                                    </div>
                                </div>
                            </div>
                        `;
                        const bindColor = (id, key) => {
                            const el = document.getElementById(id);
                            if(el) el.addEventListener('input', (e) => { cs[key] = e.target.value; this.chart.render(); try { localStorage.setItem('bx_chart_settings', JSON.stringify(this.chart.options.chartSettings)); } catch(e) {} });
                        };
                        bindColor('bx-color-bar-up', 'bodyBull');
                        bindColor('bx-color-bar-down', 'bodyBear');
                    } else {
                        // Default for candlestick, hollow_candle, heikin_ashi
                        content.innerHTML = `
                            <div class="bx-settings-section">
                                <h4>Candles</h4>
                                <div class="bx-settings-row">
                                    <label><input type="checkbox" id="bx-cb-body" ${cs.showBody !== false ? 'checked' : ''}> Body</label>
                                    <div class="color-pickers">
                                        <input type="color" id="bx-color-body-bull" value="${cs.bodyBull || '#26a69a'}">
                                        <input type="color" id="bx-color-body-bear" value="${cs.bodyBear || '#ef5350'}">
                                    </div>
                                </div>
                                <div class="bx-settings-row">
                                    <label><input type="checkbox" id="bx-cb-borders" ${cs.showBorders !== false ? 'checked' : ''}> Borders</label>
                                    <div class="color-pickers">
                                        <input type="color" id="bx-color-border-bull" value="${cs.borderBull || '#26a69a'}">
                                        <input type="color" id="bx-color-border-bear" value="${cs.borderBear || '#ef5350'}">
                                    </div>
                                </div>
                                <div class="bx-settings-row">
                                    <label><input type="checkbox" id="bx-cb-wick" ${cs.showWick !== false ? 'checked' : ''}> Wick</label>
                                    <div class="color-pickers">
                                        <input type="color" id="bx-color-wick-bull" value="${cs.wickBull || '#26a69a'}">
                                        <input type="color" id="bx-color-wick-bear" value="${cs.wickBear || '#ef5350'}">
                                    </div>
                                </div>
                            </div>
                        `;

                        // Bind events for live preview
                        const bindColor = (id, key) => {
                            const el = document.getElementById(id);
                            if(el) el.addEventListener('input', (e) => { cs[key] = e.target.value; this.chart.render(); try { localStorage.setItem('bx_chart_settings', JSON.stringify(this.chart.options.chartSettings)); } catch(e) {} });
                        };
                        const bindCheck = (id, key) => {
                            const el = document.getElementById(id);
                            if(el) el.addEventListener('change', (e) => { cs[key] = e.target.checked; this.chart.render(); try { localStorage.setItem('bx_chart_settings', JSON.stringify(this.chart.options.chartSettings)); } catch(e) {} });
                        };
                        bindCheck('bx-cb-body', 'showBody');
                        bindColor('bx-color-body-bull', 'bodyBull');
                        bindColor('bx-color-body-bear', 'bodyBear');
                        bindCheck('bx-cb-borders', 'showBorders');
                        bindColor('bx-color-border-bull', 'borderBull');
                        bindColor('bx-color-border-bear', 'borderBear');
                        bindCheck('bx-cb-wick', 'showWick');
                        bindColor('bx-color-wick-bull', 'wickBull');
                        bindColor('bx-color-wick-bear', 'wickBear');
                    }
                } else if (tabName === 'Status line') {
                    if (!this.chart.options.chartSettings.statusLine) {
                        this.chart.options.chartSettings.statusLine = {};
                    }
                    const sl = this.chart.options.chartSettings.statusLine;
                    content.innerHTML = `
                        <div class="bx-settings-section">
                            <h4>INSTRUMENT</h4>
                            <div class="bx-settings-row">
                                <label><input type="checkbox" id="bx-cb-sl-title" ${sl.showTitle !== false ? 'checked' : ''}> Title</label>
                            </div>
                        </div>
                    `;
                    const bindCheck = (id, key) => {
                        const el = document.getElementById(id);
                        if(el) el.addEventListener('change', (e) => { sl[key] = e.target.checked; this.chart.render(); try { localStorage.setItem('bx_chart_settings', JSON.stringify(this.chart.options.chartSettings)); } catch(e) {} });
                    };
                    bindCheck('bx-cb-sl-title', 'showTitle');
                } else if (tabName === 'Scales and lines') {
                    if (!this.chart.options.chartSettings.timeScale) {
                        this.chart.options.chartSettings.timeScale = {};
                    }
                    const ts = this.chart.options.chartSettings.timeScale;
                    content.innerHTML = `
                        <div class="bx-settings-section">
                            <h4>TIME SCALE</h4>
                            <div class="bx-settings-row">
                                <label>Date format</label>
                                <select id="bx-sel-date-format" class="bx-settings-select">
                                    <option value="yyyy-mm-dd" ${ts.dateFormat === 'yyyy-mm-dd' ? 'selected' : ''}>yyyy-mm-dd</option>
                                    <option value="dd-mm-yyyy" ${ts.dateFormat === 'dd-mm-yyyy' ? 'selected' : ''}>dd-mm-yyyy</option>
                                    <option value="default" ${(ts.dateFormat !== 'yyyy-mm-dd' && ts.dateFormat !== 'dd-mm-yyyy') ? 'selected' : ''}>default</option>
                                </select>
                            </div>
                            <div class="bx-settings-row">
                                <label>Time hours format</label>
                                <select id="bx-sel-time-format" class="bx-settings-select">
                                    <option value="12-hours" ${ts.timeFormat === '12-hours' ? 'selected' : ''}>12-hours</option>
                                    <option value="24-hours" ${(ts.timeFormat !== '12-hours') ? 'selected' : ''}>24-hours</option>
                                </select>
                            </div>
                        </div>
                    `;
                    const bindSelect = (id, key) => {
                        const el = document.getElementById(id);
                        if (el) el.addEventListener('change', (e) => { ts[key] = e.target.value; this.chart.render(); try { localStorage.setItem('bx_chart_settings', JSON.stringify(this.chart.options.chartSettings)); } catch(e) {} });
                    };
                    bindSelect('bx-sel-date-format', 'dateFormat');
                    bindSelect('bx-sel-time-format', 'timeFormat');
                } else if (tabName === 'Canvas') {
                    if (!this.chart.options.chartSettings.canvas) {
                        this.chart.options.chartSettings.canvas = {};
                    }
                    const cv = this.chart.options.chartSettings.canvas;
                    content.innerHTML = `
                        <div class="bx-settings-section">
                            <h4>CHART BASIC STYLES</h4>
                            <div class="bx-settings-row">
                                <label>Background</label>
                                <div class="color-pickers" style="display:flex; align-items:center; gap:8px;">
                                    <select id="bx-sel-bg-type" class="bx-settings-select">
                                        <option value="solid" ${cv.bgType !== 'gradient' ? 'selected' : ''}>Solid</option>
                                        <option value="gradient" ${cv.bgType === 'gradient' ? 'selected' : ''}>Gradient</option>
                                    </select>
                                    <input type="color" id="bx-color-bg" value="${cv.bgColor || (document.body.classList.contains('light-theme') ? '#ffffff' : '#131722')}">
                                </div>
                            </div>
                            <div class="bx-settings-row">
                                <label>Grid lines</label>
                                <div class="color-pickers" style="display:flex; align-items:center; gap:8px;">
                                    <select id="bx-sel-grid-type" class="bx-settings-select">
                                        <option value="none" ${cv.gridType === 'none' ? 'selected' : ''}>None</option>
                                        <option value="solid" ${cv.gridType === 'solid' ? 'selected' : ''}>Solid</option>
                                        <option value="dashed" ${(cv.gridType !== 'none' && cv.gridType !== 'solid') ? 'selected' : ''}>Dashed</option>
                                    </select>
                                    <input type="color" id="bx-color-grid" value="${cv.gridColor || (document.body.classList.contains('light-theme') ? '#e0e3eb' : '#2a2e39')}">
                                </div>
                            </div>
                        </div>
                    `;
                    const bindSelect = (id, key) => {
                        const el = document.getElementById(id);
                        if (el) el.addEventListener('change', (e) => { cv[key] = e.target.value; this.chart.render(); try { localStorage.setItem('bx_chart_settings', JSON.stringify(this.chart.options.chartSettings)); } catch(e) {} });
                    };
                    const bindColor = (id, key) => {
                        const el = document.getElementById(id);
                        if(el) el.addEventListener('input', (e) => { cv[key] = e.target.value; this.chart.render(); try { localStorage.setItem('bx_chart_settings', JSON.stringify(this.chart.options.chartSettings)); } catch(e) {} });
                    };
                    bindSelect('bx-sel-bg-type', 'bgType');
                    bindColor('bx-color-bg', 'bgColor');
                    bindSelect('bx-sel-grid-type', 'gridType');
                    bindColor('bx-color-grid', 'gridColor');
                } else {
                    content.innerHTML = `<h3>${tabName}</h3><p>Settings for ${tabName} will be available here.</p>`;
                }
            }
        }

        render() {
            this.modal = document.createElement('div');
            this.modal.className = 'bx-settings-overlay';
            this.modal.innerHTML = `
                <div class="bx-settings-modal">
                    <div class="bx-settings-header">
                        <span>Settings</span>
                        <span class="bx-settings-close">&times;</span>
                    </div>
                    <div class="bx-settings-body">
                        <div class="bx-settings-sidebar">
                            <div class="bx-settings-tab" data-tab="Symbol">Symbol</div>
                            <div class="bx-settings-tab" data-tab="Status line">Status line</div>
                            <div class="bx-settings-tab" data-tab="Scales and lines">Scales and lines</div>
                            <div class="bx-settings-tab" data-tab="Canvas">Canvas</div>
                        </div>
                        <div class="bx-settings-content">
                        </div>
                    </div>
                    <div class="bx-settings-footer">
                        <div>
                            <button class="bx-btn bx-btn-secondary" id="bx-settings-reset" style="background: transparent; border: none; box-shadow: none;">Defaults</button>
                        </div>
                        <div style="display: flex; gap: 8px;">
                            <button class="bx-btn bx-btn-secondary bx-settings-cancel">Cancel</button>
                            <button class="bx-btn bx-btn-primary bx-settings-ok">Ok</button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(this.modal);

            // Bind events
            this.modal.querySelector('.bx-settings-close').addEventListener('click', () => this.close());
            this.modal.querySelector('.bx-settings-cancel').addEventListener('click', () => this.close());
            this.modal.querySelector('.bx-settings-ok').addEventListener('click', () => {
                // Apply logic would go here
                this.close();
            });
            this.modal.querySelector('#bx-settings-reset').addEventListener('click', () => {
                this.chart.options.chartSettings = {}; try { localStorage.removeItem('bx_chart_settings'); } catch(e) {}
                this.chart.render(); try { localStorage.setItem('bx_chart_settings', JSON.stringify(this.chart.options.chartSettings)); } catch(e) {}
                this.setTab(this.activeTab);
            });
            
            // Close on overlay click
            this.modal.addEventListener('mousedown', (e) => {
                if (e.target === this.modal) this.close();
            });

            // Tabs
            const tabs = this.modal.querySelectorAll('.bx-settings-tab');
            tabs.forEach(t => {
                t.addEventListener('click', () => {
                    this.setTab(t.dataset.tab);
                });
            });

            // Init default tab
            this.setTab(this.activeTab);
        }
    }

    window.SettingsPopup = new SettingsPopup();
})(window);