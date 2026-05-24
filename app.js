/**
 * TradeSignal Bot - Crypto Trading Signal Generator
 * Fetches real BTC price, calculates technical indicators,
 * generates BUY/SELL/HOLD signals, and tracks portfolio.
 */

const TradeSignal = (function () {
    'use strict';

    // ── State ──────────────────────────────────────────────
    const API_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true';
    const STORAGE_KEY = 'tradesignal_portfolio';
    const HISTORY_KEY = 'tradesignal_history';

    let currentPrice = 0;
    let priceHistory = [];
    let holdings = [];
    let signalHistory = [];
    let refreshInterval = null;

    // ── Initialization ─────────────────────────────────────
    function init() {
        loadPortfolio();
        loadHistory();
        renderPortfolio();
        renderHistory();
        refresh();
        // Auto-refresh every 60 seconds
        refreshInterval = setInterval(refresh, 60000);
    }

    // ── API Fetch ──────────────────────────────────────────
    async function fetchPrice() {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('API request failed');
            const data = await response.json();
            const btc = data.bitcoin;

            currentPrice = btc.usd;
            const change24h = btc.usd_24h_change || 0;
            const volume = btc.usd_24h_vol || 0;
            const marketCap = btc.usd_market_cap || 0;

            updatePriceDisplay(currentPrice, change24h, volume, marketCap);
            generateSimulatedHistory(currentPrice);
            calculateAndDisplaySignal();
            updatePortfolioValues();

            document.getElementById('last-updated').textContent =
                'Updated: ' + new Date().toLocaleTimeString();
        } catch (err) {
            console.error('Fetch error:', err);
            document.getElementById('last-updated').textContent = 'API Error';
            // Use fallback price if we had one before
            if (currentPrice > 0) {
                generateSimulatedHistory(currentPrice);
                calculateAndDisplaySignal();
            }
        }
    }

    function refresh() {
        fetchPrice();
    }

    // ── Price Display ──────────────────────────────────────
    function updatePriceDisplay(price, change, volume, mcap) {
        document.getElementById('btc-price').textContent = formatCurrency(price);

        const changeEl = document.getElementById('btc-change');
        const sign = change >= 0 ? '+' : '';
        changeEl.textContent = sign + change.toFixed(2) + '%';
        changeEl.className = 'change ' + (change >= 0 ? 'up' : 'down');

        // Estimate high/low from current price and change
        const high = price * (1 + Math.abs(change) / 200);
        const low = price * (1 - Math.abs(change) / 200);
        document.getElementById('btc-high').textContent = formatCurrency(high);
        document.getElementById('btc-low').textContent = formatCurrency(low);
        document.getElementById('btc-volume').textContent = formatLargeNumber(volume);
        document.getElementById('btc-mcap').textContent = formatLargeNumber(mcap);
    }

    // ── Simulated Historical Data ──────────────────────────
    function generateSimulatedHistory(basePrice) {
        priceHistory = [];
        const periods = 50;
        let price = basePrice * (0.92 + Math.random() * 0.08);

        for (let i = 0; i < periods; i++) {
            // Random walk with slight mean reversion toward basePrice
            const drift = (basePrice - price) * 0.02;
            const volatility = price * 0.015 * (Math.random() - 0.5);
            price = Math.max(price + drift + volatility, basePrice * 0.7);
            priceHistory.push(price);
        }
        // Ensure last price is the actual current price
        priceHistory.push(basePrice);
    }

    // ── Technical Indicators ───────────────────────────────

    /**
     * Calculate RSI (Relative Strength Index) over a given period
     */
    function calculateRSI(data, period) {
        if (data.length < period + 1) return 50; // neutral default

        const recent = data.slice(-(period + 1));
        let gains = 0;
        let losses = 0;

        for (let i = 1; i < recent.length; i++) {
            const change = recent[i] - recent[i - 1];
            if (change > 0) {
                gains += change;
            } else {
                losses += Math.abs(change);
            }
        }

        const avgGain = gains / period;
        const avgLoss = losses / period;

        if (avgLoss === 0) return 100;
        const rs = avgGain / avgLoss;
        const rsi = 100 - (100 / (1 + rs));
        return Math.round(rsi * 100) / 100;
    }

    /**
     * Calculate Simple Moving Average
     */
    function calculateSMA(data, period) {
        if (data.length < period) return data[data.length - 1] || 0;
        const slice = data.slice(-period);
        const sum = slice.reduce((a, b) => a + b, 0);
        return sum / period;
    }

    /**
     * Calculate Exponential Moving Average
     */
    function calculateEMA(data, period) {
        if (data.length < period) return data[data.length - 1] || 0;

        const multiplier = 2 / (period + 1);
        // Start with SMA as the first EMA value
        let ema = calculateSMA(data.slice(0, period), period);

        for (let i = period; i < data.length; i++) {
            ema = (data[i] - ema) * multiplier + ema;
        }
        return ema;
    }

    /**
     * Calculate MACD (Moving Average Convergence Divergence)
     */
    function calculateMACD(data) {
        const ema12 = calculateEMA(data, 12);
        const ema26 = calculateEMA(data, 26);
        return ema12 - ema26;
    }

    /**
     * Detect SMA/EMA crossover
     */
    function detectCrossover(data) {
        const sma = calculateSMA(data, 20);
        const ema = calculateEMA(data, 12);
        const prevSma = calculateSMA(data.slice(0, -1), 20);
        const prevEma = calculateEMA(data.slice(0, -1), 12);

        if (prevEma <= prevSma && ema > sma) return 'bullish_cross';
        if (prevEma >= prevSma && ema < sma) return 'bearish_cross';
        return ema > sma ? 'above' : 'below';
    }

    // ── Signal Generation ──────────────────────────────────

    /**
     * Generate a trading signal based on multiple indicators.
     * Returns { signal, strength, reasons[] }
     */
    function generateSignal(data) {
        const rsi = calculateRSI(data, 14);
        const sma20 = calculateSMA(data, 20);
        const ema12 = calculateEMA(data, 12);
        const macd = calculateMACD(data);
        const crossover = detectCrossover(data);
        const currentPrice = data[data.length - 1];

        let buyScore = 0;
        let sellScore = 0;
        const reasons = [];

        // RSI Analysis
        if (rsi < 30) {
            buyScore += 2;
            reasons.push('RSI oversold (' + rsi.toFixed(1) + ') — strong buy signal');
        } else if (rsi < 40) {
            buyScore += 1;
            reasons.push('RSI below 40 (' + rsi.toFixed(1) + ') — mild buy signal');
        } else if (rsi > 70) {
            sellScore += 2;
            reasons.push('RSI overbought (' + rsi.toFixed(1) + ') — strong sell signal');
        } else if (rsi > 60) {
            sellScore += 1;
            reasons.push('RSI above 60 (' + rsi.toFixed(1) + ') — mild sell signal');
        } else {
            reasons.push('RSI neutral (' + rsi.toFixed(1) + ')');
        }

        // Price vs SMA20
        if (currentPrice > sma20 * 1.02) {
            sellScore += 1;
            reasons.push('Price above SMA20 — potential overbought');
        } else if (currentPrice < sma20 * 0.98) {
            buyScore += 1;
            reasons.push('Price below SMA20 — potential undervalued');
        }

        // EMA vs SMA crossover
        if (crossover === 'bullish_cross') {
            buyScore += 2;
            reasons.push('Bullish EMA/SMA crossover detected');
        } else if (crossover === 'bearish_cross') {
            sellScore += 2;
            reasons.push('Bearish EMA/SMA crossover detected');
        } else if (crossover === 'above') {
            buyScore += 1;
            reasons.push('EMA12 above SMA20 — uptrend');
        } else {
            sellScore += 1;
            reasons.push('EMA12 below SMA20 — downtrend');
        }

        // MACD
        if (macd > 0) {
            buyScore += 1;
            reasons.push('MACD positive (' + macd.toFixed(2) + ')');
        } else {
            sellScore += 1;
            reasons.push('MACD negative (' + macd.toFixed(2) + ')');
        }

        // Determine signal
        const total = buyScore + sellScore;
        let signal, strength;

        if (buyScore > sellScore + 1) {
            signal = 'BUY';
            strength = Math.min(100, Math.round((buyScore / Math.max(total, 1)) * 100));
        } else if (sellScore > buyScore + 1) {
            signal = 'SELL';
            strength = Math.min(100, Math.round((sellScore / Math.max(total, 1)) * 100));
        } else {
            signal = 'HOLD';
            strength = Math.round(50 + (buyScore - sellScore) * 5);
        }

        strength = Math.max(10, Math.min(100, strength));

        return {
            signal: signal,
            strength: strength,
            reasons: reasons,
            indicators: { rsi, sma20, ema12, macd, crossover }
        };
    }

    // ── Display Signal ─────────────────────────────────────

    function calculateAndDisplaySignal() {
        if (priceHistory.length < 20) return;

        const result = generateSignal(priceHistory);
        const { signal, strength, reasons, indicators } = result;

        // Update signal display
        const display = document.getElementById('signal-display');
        display.className = 'signal-display signal-' + signal.toLowerCase();

        const icons = { BUY: '🟢', SELL: '🔴', HOLD: '⏸️' };
        document.getElementById('signal-icon').textContent = icons[signal] || '⏸️';
        document.getElementById('signal-text').textContent = signal;

        // Update strength bar
        document.getElementById('strength-bar').style.width = strength + '%';
        document.getElementById('strength-text').textContent = strength + '%';

        // Update indicators
        document.getElementById('rsi-value').textContent = indicators.rsi.toFixed(2);
        document.getElementById('sma-value').textContent = formatCurrency(indicators.sma20);
        document.getElementById('ema-value').textContent = formatCurrency(indicators.ema12);

        const crossLabels = {
            bullish_cross: '🟢 Bullish Cross',
            bearish_cross: '🔴 Bearish Cross',
            above: '📈 EMA > SMA',
            below: '📉 EMA < SMA'
        };
        document.getElementById('cross-value').textContent =
            crossLabels[indicators.crossover] || indicators.crossover;

        // Update reason text
        document.getElementById('signal-reason').innerHTML =
            '<strong>Analysis:</strong><br>' + reasons.join('<br>');

        // Save to history
        addSignalToHistory(signal, strength, currentPrice);
    }

    // ── Signal History ─────────────────────────────────────

    function addSignalToHistory(signal, strength, price) {
        const entry = {
            time: new Date().toLocaleString(),
            signal: signal,
            strength: strength,
            price: price
        };
        signalHistory.unshift(entry);
        if (signalHistory.length > 50) signalHistory.pop();
        saveHistory();
        renderHistory();
    }

    function loadHistory() {
        try {
            const data = localStorage.getItem(HISTORY_KEY);
            if (data) signalHistory = JSON.parse(data);
        } catch (e) { signalHistory = []; }
    }

    function saveHistory() {
        try {
            localStorage.setItem(HISTORY_KEY, JSON.stringify(signalHistory));
        } catch (e) { /* ignore */ }
    }

    function clearHistory() {
        signalHistory = [];
        saveHistory();
        renderHistory();
    }

    function renderHistory() {
        const container = document.getElementById('history-list');
        if (signalHistory.length === 0) {
            container.innerHTML = '<p class="empty-msg">No signals generated yet.</p>';
            return;
        }
        container.innerHTML = signalHistory.slice(0, 20).map(function (s) {
            return '<div class="history-item">' +
                '<span>' + s.time + '</span>' +
                '<span>$' + s.price.toLocaleString() + '</span>' +
                '<span class="hi-signal ' + s.signal + '">' + s.signal + ' (' + s.strength + '%)</span>' +
                '</div>';
        }).join('');
    }

    // ── Portfolio Management ───────────────────────────────

    function loadPortfolio() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            if (data) holdings = JSON.parse(data);
        } catch (e) { holdings = []; }
    }

    function savePortfolio() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(holdings));
        } catch (e) { /* ignore */ }
    }

    function addHolding() {
        const symbolEl = document.getElementById('asset-symbol');
        const qtyEl = document.getElementById('asset-qty');
        const priceEl = document.getElementById('asset-price');

        const symbol = symbolEl.value.trim().toUpperCase();
        const qty = parseFloat(qtyEl.value);
        const buyPrice = parseFloat(priceEl.value);

        if (!symbol || isNaN(qty) || qty <= 0 || isNaN(buyPrice) || buyPrice <= 0) {
            alert('Please fill in all fields with valid values.');
            return;
        }

        holdings.push({
            id: Date.now(),
            symbol: symbol,
            qty: qty,
            buyPrice: buyPrice,
            addedAt: new Date().toLocaleDateString()
        });

        savePortfolio();
        renderPortfolio();
        updatePortfolioValues();

        symbolEl.value = '';
        qtyEl.value = '';
        priceEl.value = '';
    }

    function removeHolding(id) {
        holdings = holdings.filter(function (h) { return h.id !== id; });
        savePortfolio();
        renderPortfolio();
        updatePortfolioValues();
    }

    function renderPortfolio() {
        const container = document.getElementById('portfolio-list');
        if (holdings.length === 0) {
            container.innerHTML = '<p class="empty-msg">No holdings yet. Add your first position above.</p>';
            return;
        }
        container.innerHTML = holdings.map(function (h) {
            const currentVal = h.symbol === 'BTC' ? h.qty * currentPrice : h.qty * h.buyPrice;
            const invested = h.qty * h.buyPrice;
            const pl = currentVal - invested;
            const plClass = pl >= 0 ? 'positive' : 'negative';
            const plSign = pl >= 0 ? '+' : '';

            return '<div class="holding-row">' +
                '<div class="holding-info">' +
                '<span class="symbol">' + h.symbol + '</span>' +
                '<span class="meta"> &times; ' + h.qty + ' @ $' + h.buyPrice.toLocaleString() + '</span>' +
                '</div>' +
                '<span class="holding-pl ' + plClass + '">' + plSign + formatCurrency(pl) + '</span>' +
                '<button class="btn btn-sm" onclick="TradeSignal.removeHolding(' + h.id + ')">✕</button>' +
                '</div>';
        }).join('');
    }

    function updatePortfolioValues() {
        let totalInvested = 0;
        let totalCurrent = 0;

        holdings.forEach(function (h) {
            const invested = h.qty * h.buyPrice;
            totalInvested += invested;
            if (h.symbol === 'BTC') {
                totalCurrent += h.qty * currentPrice;
            } else {
                totalCurrent += h.qty * h.buyPrice; // use buy price for non-BTC
            }
        });

        const pl = totalCurrent - totalInvested;
        const plSign = pl >= 0 ? '+' : '';

        document.getElementById('portfolio-total').textContent =
            'Total: ' + formatCurrency(totalCurrent);
        document.getElementById('total-invested').textContent = formatCurrency(totalInvested);
        document.getElementById('total-current').textContent = formatCurrency(totalCurrent);

        const plEl = document.getElementById('total-pl');
        plEl.textContent = plSign + formatCurrency(pl);
        plEl.style.color = pl >= 0 ? 'var(--green)' : 'var(--red)';
    }

    // ── Formatting Helpers ─────────────────────────────────

    function formatCurrency(value) {
        return '$' + Number(value).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    function formatLargeNumber(value) {
        if (value >= 1e12) return '$' + (value / 1e12).toFixed(2) + 'T';
        if (value >= 1e9) return '$' + (value / 1e9).toFixed(2) + 'B';
        if (value >= 1e6) return '$' + (value / 1e6).toFixed(2) + 'M';
        if (value >= 1e3) return '$' + (value / 1e3).toFixed(2) + 'K';
        return '$' + value.toFixed(2);
    }

    // ── Boot ───────────────────────────────────────────────
    document.addEventListener('DOMContentLoaded', init);

    // Public API
    return {
        refresh: refresh,
        addHolding: addHolding,
        removeHolding: removeHolding,
        clearHistory: clearHistory,
        // Expose for testing
        _calculateRSI: calculateRSI,
        _calculateSMA: calculateSMA,
        _calculateEMA: calculateEMA,
        _generateSignal: generateSignal
    };
})();
