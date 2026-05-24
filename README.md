# 📈 TradeSignal Bot

> AI-driven crypto trading signals with real-time market analysis — powered by MiMo V2.5

## Why This Exists

Crypto markets never sleep, but traders do. The 24/7 nature of digital asset trading means that by the time you wake up, a key support level has broken, a whale wallet has moved, or a macro event has shifted sentiment — and your position is underwater. Most retail traders rely on static indicator thresholds (RSI > 70 = sell) that generate noisy, context-blind signals. They lack the bandwidth to simultaneously monitor on-chain flows, social sentiment, technical patterns, and macro correlations across dozens of trading pairs.

TradeSignal Bot solves this by deploying MiMo V2.5 — Nous Research's reasoning model — as a multi-agent market analysis system that synthesizes technical indicators, on-chain data, news sentiment, and historical pattern recognition into clear, actionable trading signals. Each signal comes with a confidence score, risk assessment, suggested position sizing, and stop-loss levels — not just a raw BUY or SELL flag.

The dashboard puts everything a trader needs in one terminal-style view: live candlestick charts, signal cards with entry/exit targets, portfolio P&L tracking, and a watchlist with real-time updates. Whether you're a day trader managing leveraged positions or a long-term holder looking for optimal accumulation zones, TradeSignal Bot gives you institutional-level market intelligence without the Bloomberg Terminal subscription.

## Architecture

```
┌─────────────────┐
│  Market Data     │   Exchange APIs, on-chain feeds,
│  (Live Stream)   │   order book snapshots, trade history
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Technical        │   MiMo V2.5 — pattern recognition,
│ Analysis Agent   │   indicator synthesis, multi-timeframe
│ (MiMo V2.5)     │   confluence detection
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Signal Generator │   MiMo V2.5 — entry/exit/hold decisions,
│ (MiMo V2.5)     │   confidence scoring, target calculation
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Risk Agent       │   Position sizing, stop-loss placement,
│ (Risk评估)       │   portfolio exposure limits, drawdown check
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Alert System    │   Push notifications, Telegram bot,
│  (Delivery)      │   email, webhook integrations
└─────────────────┘
```

## Token Consumption Model

| Agent | Tokens/Op | Frequency | Daily/User (est.) |
|-------|-----------|-----------|-------------------|
| Technical Analysis | 300K | ~50 scans/day | 15M |
| Signal Generator | 400K | ~20 signals/day | 8M |
| Risk Agent | 200K | ~20 assessments/day | 4M |
| **Total** | **900K** | — | **~27M** |

> Token estimates based on monitoring 10 trading pairs across 4 timeframes with 5-minute intervals.

## Features

- 🕯️ **Candlestick chart visualization** — CSS-rendered OHLC charts with configurable timeframes (1m, 5m, 1h, 4h, 1D)
- 🚦 **Live signal cards** — BUY / SELL / HOLD signals with entry price, take-profit targets, and stop-loss levels
- 📊 **Portfolio tracking** — Real-time P&L table with position sizing, leverage, and ROI per trade
- 🎯 **Multi-timeframe analysis** — 1m through monthly confluence scoring for higher-probability signals
- 🔗 **On-chain intelligence** — Whale wallet tracking, exchange flow analysis, and smart money indicators
- 📱 **Alert delivery** — Telegram, Discord, email, and webhook notifications with configurable thresholds
- 🛡️ **Risk management** — Automatic position sizing based on account equity and max drawdown rules
- 🧠 **Sentiment analysis** — News and social media sentiment scoring as signal confirmation layer
- 📈 **Backtesting** — Historical signal performance with win rate, Sharpe ratio, and max drawdown metrics

## Tech Stack

- **Frontend:** Vanilla HTML5, CSS3, JavaScript (ES6+)
- **AI Engine:** MiMo V2.5 by Nous Research
- **Architecture:** Zero-dependency — no external frameworks or build tools
- **Charting:** Custom CSS candlestick renderer (no charting library)
- **Data:** WebSocket feeds for real-time price data, REST APIs for historical data

## Quick Start

```bash
# Clone the repository
git clone https://github.com/your-org/TradeSignal-Bot.git
cd TradeSignal-Bot

# Open the trading terminal
open index.html

# Or serve locally
python3 -m http.server 8080
```

1. Open `index.html` in your browser
2. The terminal loads with pre-configured market data and sample signals
3. Click signal cards to expand the full analysis with entry/exit/stop levels
4. Switch timeframes using the chart controls
5. Review your portfolio P&L in the tracking table
6. To connect live data, add your exchange API keys in `js/config.js`

## Project Structure

```
TradeSignal-Bot/
├── index.html               # Trading terminal entry point
├── css/
│   ├── main.css             # Terminal theme and layout
│   ├── charts.css           # Candlestick chart styles
│   └── signals.css          # Signal card and indicator styles
├── js/
│   ├── app.js               # Main application controller
│   ├── market-data.js       # Exchange API integration
│   ├── analysis-agent.js    # MiMo V2.5 technical analysis
│   ├── signal-gen.js        # Signal generation and scoring
│   ├── risk-agent.js        # Risk assessment and sizing
│   ├── portfolio.js         # Portfolio tracking and P&L
│   └── config.js            # API keys and trading parameters
├── data/
│   ├── pairs/               # Supported trading pair definitions
│   └── historical/          # Cached historical data for demo
├── assets/
│   └── icons/               # Signal and status icons
└── README.md
```

---

> Built with MiMo V2.5 — [Nous Research](https://nousresearch.com)
