package com.backtestx.charts

import android.annotation.SuppressLint
import android.content.Context
import android.util.AttributeSet
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.FrameLayout

class BacktestxChartView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : FrameLayout(context, attrs, defStyleAttr) {

    private val webView: WebView = WebView(context)

    init {
        addView(webView, LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT))
        setupWebView()
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun setupWebView() {
        val settings = webView.settings
        settings.javaScriptEnabled = true
        settings.allowFileAccess = true
        settings.allowContentAccess = true
        settings.domStorageEnabled = true
        settings.loadWithOverviewMode = true
        settings.useWideViewPort = true
        
        // Ensure web content loads internally instead of launching external browser
        webView.webViewClient = object : WebViewClient() {
            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
            }
        }
        
        // Load the local chart from module assets
        webView.loadUrl("file:///android_asset/backtestx_lightweight_chart/index.html")
    }

    /**
     * Get reference to the raw WebView for advanced JavaScript operations.
     */
    fun getWebView(): WebView {
        return webView
    }

    /**
     * Update chart data dynamically using a JSON string of candles/bars.
     * @param jsonData JSON array string representing the bar data.
     */
    fun updateData(jsonData: String) {
        val jsCode = "javascript:if(window.chart){window.chart.bars = $jsonData; window.chart.render();}"
        webView.post {
            webView.evaluateJavascript(jsCode, null)
        }
    }

    /**
     * Switch timeframe and symbol.
     * @param symbol The new asset symbol (e.g. "BTCUSD")
     * @param resolution The interval (e.g. "1D", "30m")
     */
    fun changeSymbol(symbol: String, resolution: String) {
        val jsCode = "javascript:if(window.chart){window.chart.symbol = '$symbol'; window.chart.resolution = '$resolution'; window.chart.loadData();}"
        webView.post {
            webView.evaluateJavascript(jsCode, null)
        }
    }
}
