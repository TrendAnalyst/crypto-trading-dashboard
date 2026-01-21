import React from 'react';

const COIN_COLORS = {
    'HYPE': { gradient: 'linear-gradient(135deg, rgba(167, 139, 250, 0.2), rgba(139, 92, 246, 0.1))', border: 'rgba(167, 139, 250, 0.3)', color: '#a78bfa' },
    'VIRTUAL': { gradient: 'linear-gradient(135deg, rgba(34, 211, 238, 0.2), rgba(59, 130, 246, 0.1))', border: 'rgba(34, 211, 238, 0.3)', color: '#22d3ee' },
    'FARTCOIN': { gradient: 'linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(249, 115, 22, 0.1))', border: 'rgba(251, 191, 36, 0.3)', color: '#fbbf24' },
    'PEPE': { gradient: 'linear-gradient(135deg, rgba(52, 211, 153, 0.2), rgba(34, 197, 94, 0.1))', border: 'rgba(52, 211, 153, 0.3)', color: '#34d399' },
    'DOGE': { gradient: 'linear-gradient(135deg, rgba(250, 204, 21, 0.2), rgba(251, 191, 36, 0.1))', border: 'rgba(250, 204, 21, 0.3)', color: '#facc15' },
};

function getStyle(name) {
    return COIN_COLORS[name] || {
        gradient: 'linear-gradient(135deg, rgba(124, 58, 237, 0.2), rgba(79, 70, 229, 0.1))',
        border: 'rgba(124, 58, 237, 0.3)',
        color: '#a78bfa'
    };
}

function calculateScore(trends) {
    let score = 0;
    if (trends['1w'] === 'uptrend') score += 6;
    else if (trends['1w'] === 'downtrend') score -= 6;
    if (trends['3d'] === 'uptrend') score += 3;
    else if (trends['3d'] === 'downtrend') score -= 3;
    if (trends['1d'] === 'uptrend') score += 1;
    else if (trends['1d'] === 'downtrend') score -= 1;
    return score;
}

function formatTime(minutes) {
    if (minutes === null || minutes === undefined) return 'Never';
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

function CoinCard({ coin, delay }) {
    const style = getStyle(coin.display_name);
    const score = calculateScore(coin.trends);
    const isRecent = coin.last_updated_minutes_ago !== null && coin.last_updated_minutes_ago < 1;

    const renderTrend = (timeframe, trend) => {
        if (!trend) {
            return (
                <div className="trend-badge neutral">
                    <span className="trend-timeframe">{timeframe}</span>
                    <span className="trend-value neutral">—</span>
                </div>
            );
        }

        const isUp = trend === 'uptrend';
        return (
            <div className={`trend-badge ${isUp ? 'uptrend' : 'downtrend'}`}>
                <span className="trend-timeframe">{timeframe}</span>
                <span className={`trend-value ${isUp ? 'up' : 'down'}`}>
                    <span className="trend-icon">{isUp ? '▲' : '▼'}</span>
                    {isUp ? 'UP' : 'DOWN'}
                </span>
            </div>
        );
    };

    const renderSignal = () => {
        const signal = coin.last_signal;
        if (!signal || !signal.type) {
            return (
                <div className="signal-container awaiting">
                    <div className="signal-content">
                        <span className="signal-text awaiting">Awaiting signal...</span>
                    </div>
                </div>
            );
        }

        const isBuy = signal.type === 'buy';
        return (
            <div className={`signal-container ${isBuy ? 'buy' : 'sell'}`}>
                <div className="signal-content">
                    <span className="signal-emoji">{isBuy ? '💎' : '🔻'}</span>
                    <div>
                        <span className={`signal-text ${isBuy ? 'buy' : 'sell'}`}>
                            {isBuy ? 'BUY' : 'SELL'} SIGNAL
                        </span>
                        <div className="signal-time">
                            <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {formatTime(signal.minutes_ago)}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div
            className={`coin-card ${isRecent ? 'recent-update' : ''}`}
            style={{ animationDelay: `${delay}s` }}
        >
            <div className="card-header">
                <div className="coin-info">
                    <div
                        className="coin-icon"
                        style={{
                            background: style.gradient,
                            borderColor: style.border,
                            color: style.color
                        }}
                    >
                        {coin.display_name.substring(0, 2)}
                    </div>
                    <div>
                        <div className="coin-name">{coin.display_name}</div>
                        <div className="coin-symbol">{coin.symbol}</div>
                    </div>
                </div>
                <div className={`trend-score ${score >= 3 ? 'positive' : score <= -3 ? 'negative' : 'neutral'}`}>
                    {score >= 3 ? '↗' : score <= -3 ? '↘' : '→'}
                </div>
            </div>

            <div className="trends">
                {renderTrend('1W', coin.trends['1w'])}
                {renderTrend('3D', coin.trends['3d'])}
                {renderTrend('1D', coin.trends['1d'])}
            </div>

            {renderSignal()}

            <div className="card-footer">
                <div className="update-info">
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Updated
                </div>
                <span className={`update-time ${isRecent ? 'recent' : ''}`}>
                    {formatTime(coin.last_updated_minutes_ago)}
                </span>
            </div>
        </div>
    );
}

export default CoinCard;
