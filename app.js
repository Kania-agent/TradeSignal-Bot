// TradeSignal Bot — app.js

// Candlestick chart data (OHLC approximations)
const candleData = [
    { o: 65200, h: 65800, l: 64900, c: 65600 },
    { o: 65600, h: 66100, l: 65300, c: 65900 },
    { o: 65900, h: 66400, l: 65700, c: 66200 },
    { o: 66200, h: 66800, l: 66000, c: 66100 },
    { o: 66100, h: 66500, l: 65800, c: 65800 },
    { o: 65800, h: 66200, l: 65500, c: 66000 },
    { o: 66000, h: 66900, l: 65900, c: 66700 },
    { o: 66700, h: 67200, l: 66500, c: 67000 },
    { o: 67000, h: 67500, l: 66800, c: 67300 },
    { o: 67300, h: 67800, l: 67100, c: 67600 },
    { o: 67600, h: 68200, l: 67400, c: 68000 },
    { o: 68000, h: 68500, l: 67800, c: 68300 },
    { o: 68300, h: 68600, l: 67900, c: 68100 },
    { o: 68100, h: 68400, l: 67600, c: 67800 },
    { o: 67800, h: 68100, l: 67500, c: 68000 },
    { o: 68000, h: 68700, l: 67900, c: 68500 },
    { o: 68500, h: 69000, l: 68300, c: 68800 },
    { o: 68800, h: 69100, l: 68400, c: 68600 },
    { o: 68600, h: 68900, l: 68200, c: 68300 },
    { o: 68300, h: 68700, l: 68000, c: 68500 },
    { o: 68500, h: 68800, l: 67800, c: 67900 },
    { o: 67900, h: 68200, l: 67600, c: 68100 },
    { o: 68100, h: 68600, l: 67900, c: 68400 },
    { o: 68400, h: 69000, l: 68300, c: 68800 },
    { o: 68800, h: 69200, l: 68600, c: 69000 },
    { o: 69000, h: 69400, l: 68800, c: 69100 },
    { o: 69100, h: 69300, l: 68500, c: 68600 },
    { o: 68600, h: 68900, l: 68300, c: 68700 },
    { o: 68700, h: 69000, l: 68400, c: 68900 },
    { o: 68900, h: 69200, l: 68600, c: 68800 },
    { o: 68800, h: 69100, l: 68200, c: 68300 },
    { o: 68300, h: 68600, l: 67900, c: 68100 },
    { o: 68100, h: 68500, l: 68000, c: 68400 },
    { o: 68400, h: 68700, l: 68100, c: 68200 },
    { o: 68200, h: 68600, l: 67800, c: 67900 },
    { o: 67900, h: 68300, l: 67700, c: 68200 },
    { o: 68200, h: 68500, l: 67900, c: 68100 },
    { o: 68100, h: 68400, l: 67600, c: 67800 },
    { o: 67800, h: 68200, l: 67700, c: 68100 },
    { o: 68100, h: 68500, l: 68000, c: 68300 },
];

function renderChart() {
    const chart = document.getElementById('candlestickChart');
    const prices = candleData.flatMap(d => [d.h, d.l]);
    const minP = Math.min(...prices);
    const maxP = Math.max(...prices);
    const range = maxP - minP;

    chart.innerHTML = candleData.map(d => {
        const bodyBottom = ((Math.min(d.o, d.c) - minP) / range) * 100;
        const bodyTop = ((Math.max(d.o, d.c) - minP) / range) * 100;
        const bodyHeight = Math.max(bodyTop - bodyBottom, 2);
        const wickTop = ((d.h - minP) / range) * 100;
        const wickBottom = ((d.l - minP) / range) * 100;
        const isGreen = d.c >= d.o;

        return `<div class="candle ${isGreen ? 'green' : 'red'}">
            <div class="candle-wick" style="bottom:${wickBottom}%;height:${wickTop - wickBottom}%"></div>
            <div class="candle-body" style="position:absolute;bottom:${bodyBottom}%;height:${bodyHeight}%"></div>
        </div>`;
    }).join('');
}

const signals = [
    { pair: 'BTC/USDT', type: 'buy', entry: '$67,800', target: '$72,500', confidence: '87%' },
    { pair: 'ETH/USDT', type: 'buy', entry: '$3,420', target: '$3,800', confidence: '82%' },
    { pair: 'SOL/USDT', type: 'sell', entry: '$148.50', target: '$132.00', confidence: '74%' },
    { pair: 'AVAX/USDT', type: 'hold', entry: '$38.20', target: '—', confidence: '65%' },
    { pair: 'LINK/USDT', type: 'buy', entry: '$14.80', target: '$17.50', confidence: '79%' },
    { pair: 'DOT/USDT', type: 'sell', entry: '$7.40', target: '$6.10', confidence: '71%' },
];

function renderSignals() {
    document.getElementById('signalsList').innerHTML = signals.map(s => `
        <div class="signal-card ${s.type}">
            <div class="signal-top">
                <span class="signal-pair">${s.pair}</span>
                <span class="signal-badge ${s.type}">${s.type}</span>
            </div>
            <div class="signal-details">
                <span>Entry: ${s.entry}</span>
                <span>Target: ${s.target}</span>
                <span>${s.confidence}</span>
            </div>
        </div>
    `).join('');
}

const portfolio = [
    { asset: 'Bitcoin', icon: '₿', color: '#f7931a', holdings: '0.45 BTC', value: '$30,529', change: '+3.21%', pos: true },
    { asset: 'Ethereum', icon: 'Ξ', color: '#627eea', holdings: '4.2 ETH', value: '$14,364', change: '+1.87%', pos: true },
    { asset: 'Solana', icon: '◎', color: '#9945ff', holdings: '120 SOL', value: '$17,820', change: '-2.14%', pos: false },
    { asset: 'Chainlink', icon: '⬡', color: '#375bd2', holdings: '500 LINK', value: '$7,400', change: '+0.95%', pos: true },
    { asset: 'Avalanche', icon: '▲', color: '#e84142', holdings: '250 AVAX', value: '$9,550', change: '-1.32%', pos: false },
];

function renderPortfolio() {
    document.getElementById('portfolioBody').innerHTML = portfolio.map(p => `
        <tr>
            <td>
                <span class="asset-name">
                    <span class="asset-icon" style="background:${p.color};color:#fff">${p.icon}</span>
                    ${p.asset}
                </span>
            </td>
            <td>${p.holdings}</td>
            <td style="font-weight:700">${p.value}</td>
            <td class="${p.pos ? 'change-pos' : 'change-neg'}">${p.change}</td>
            <td><button class="action-btn">Trade</button></td>
        </tr>
    `).join('');
}

const indicators = [
    { label: 'RSI (14)', value: '62.4', signal: 'neutral' },
    { label: 'MACD', value: '+245', signal: 'bullish' },
    { label: 'EMA 50', value: '$67,200', signal: 'bullish' },
    { label: 'Volume', value: '2.4B', signal: 'bullish' },
    { label: 'Bollinger', value: 'Upper', signal: 'neutral' },
    { label: 'Stochastic', value: '71.3', signal: 'bearish' },
];

function renderIndicators() {
    document.getElementById('indicatorsGrid').innerHTML = indicators.map(i => `
        <div class="indicator-card">
            <div class="indicator-label">${i.label}</div>
            <div class="indicator-value">${i.value}</div>
            <div class="indicator-signal ${i.signal}">${i.signal}</div>
        </div>
    `).join('');
}

// Clock
function updateClock() {
    const now = new Date();
    document.getElementById('clock').textContent = now.toLocaleTimeString('en-US', { hour12: false });
}

// Simulate price updates
function simulatePrice() {
    const priceEl = document.getElementById('currentPrice');
    const changeEl = document.getElementById('priceChange');
    const base = 67842.50;
    const variation = (Math.random() - 0.48) * 200;
    const price = base + variation;
    const change = ((price - base) / base * 100);
    priceEl.textContent = '$' + price.toFixed(2);
    changeEl.textContent = (change >= 0 ? '+' : '') + change.toFixed(2) + '%';
    changeEl.className = 'pair-change ' + (change >= 0 ? 'positive' : 'negative');
}

document.addEventListener('DOMContentLoaded', () => {
    renderChart();
    renderSignals();
    renderPortfolio();
    renderIndicators();
    updateClock();
    setInterval(updateClock, 1000);
    setInterval(simulatePrice, 3000);
});
