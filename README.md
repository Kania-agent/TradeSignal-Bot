# TradeSignal Bot 📊

A fully functional crypto trading signal generator that fetches real Bitcoin prices and provides technical analysis-based trading signals.

## Features

- **Real-time Bitcoin Price** — Fetches live BTC/USD data from CoinGecko API
- **Technical Indicators** — RSI (14), SMA (20), EMA (12), MACD, and crossover detection
- **Signal Generation** — BUY / SELL / HOLD signals with strength percentage (10-100%)
- **Portfolio Tracker** — Add holdings, track P/L, persisted via localStorage
- **Signal History** — Keeps last 50 signals with timestamps
- **Auto-refresh** — Updates every 60 seconds automatically

## How Signals Work

The bot scores multiple indicators:
- **RSI < 30** → Strong buy (oversold) | **RSI > 70** → Strong sell (overbought)
- **Price vs SMA20** — deviation signals overbought/oversold
- **EMA12/SMA20 crossover** — bullish or bearish trend detection
- **MACD** — positive = bullish momentum, negative = bearish

A composite score determines the signal and its confidence strength.

## Files

| File | Description |
|------|-------------|
| `index.html` | Main HTML structure with cards for price, signal, portfolio, history |
| `style.css` | Dark theme styling with responsive grid layout |
| `app.js` | Core application logic (300+ lines) — API, indicators, signals, portfolio |
| `README.md` | This file |

## Usage

Open `index.html` in any modern browser. No build step or server required.

## Disclaimer

This tool is for **educational purposes only**. It does not constitute financial advice. Technical analysis on simulated historical data should not be used as the sole basis for trading decisions.
