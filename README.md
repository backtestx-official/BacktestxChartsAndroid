# Android BacktestxCharts

**BacktestxChartsAndroid** is a native Android wrapper library for the custom **BacktestX Lightweight Charting Engine** (built on HTML5 Canvas). It enables you to render high-performance, interactive trading charts directly in Android apps using native Kotlin or Java code.

---

## Features

- **Native Wrapper:** Exposes a native `BacktestxChartView` subclass of `FrameLayout`.
- **Zero Web Configuration:** Automatically configures WebView settings, DOM storage, javascript interfaces, and loads local assets.
- **Custom Drawings:** Native finger-drag tools for placing Trend Lines, Fibonaccis, and Buy/Sell markers.
- **Technical Indicators:** Ready-to-use indicators (SMA, EMA, MACD, RSI, Bollinger Bands).
- **Scale Support:** Support for custom scales (Yield Curves, Option Strikes, and Standard Time-series).
- **Custom Candle Renderers:** Hollow candles, bars, lines, and Heikin-Ashi support.

---

## Requirements

- **Android SDK 21+** (Android 5.0+)
- **Kotlin 1.8.0+**
- **Java 17+** (or Java 11+)

---

## Installation

### Add Repository Configuration
Add JitPack to your project-level repository configurations (typically in `settings.gradle` or root `build.gradle`):

```gradle
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
        maven { url 'https://jitpack.io' } // Required for JitPack builds
    }
}
```

### Add Library Dependency
Add the following dependency coordinates to your app-level `build.gradle` configuration:

```gradle
dependencies {
    implementation 'com.github.backtestx-official:BacktestxChartsAndroid:1.0.0'
}
```

---

## Usage

### 1. Declare View in Layout XML
Add the custom chart view directly inside your XML layout resource:

```xml
<com.backtestx.charts.BacktestxChartView
    android:id="@+id/backtestxChartView"
    android:layout_width="match_parent"
    android:layout_height="match_parent" />
```

### 2. Initializing and Binding Data (Kotlin)
Reference the view inside your Activity or Fragment and push your data directly using a JSON string:

```kotlin
import com.backtestx.charts.BacktestxChartView

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val chartView = findViewById<BacktestxChartView>(R.id.backtestxChartView)

        // Bind data formatted in OHLC format
        val jsonData = """
        [
          {"time": "2018-10-19", "open": 180.34, "high": 180.99, "low": 178.57, "close": 179.85},
          {"time": "2018-10-22", "open": 180.82, "high": 181.40, "low": 177.56, "close": 178.75}
        ]
        """.trimIndent()

        chartView.updateData(jsonData)
    }
}
```

### 3. Switch Symbols & Resolutions
Trigger symbol changes dynamically:

```kotlin
// Switch timeframe to 1 hour (1H) for Ethereum
chartView.changeSymbol("ETHUSD", "1H")
```

---

## Advanced API Controls

If you need advanced functionality or wish to invoke custom JavaScript functions on your engine directly, you can fetch the underlying `WebView` instance:

```kotlin
val rawWebView = chartView.getWebView()

// Programmatically add a technical indicator
rawWebView.post {
    rawWebView.evaluateJavascript("javascript:window.chart.addIndicator('rsi', { period: 14 });", null)
}
```

---

## License

This project is licensed under the MIT License - see the `LICENSE` file for details.
