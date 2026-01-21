import React from 'react';

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
    if (minutes === null || minutes === undefined) return '—';
    if (minutes < 1) return 'NOW';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
}

function CoinCard({ coin, delay }) {
    const score = calculateScore(coin.trends);
    const isRecent = coin.last_updated_minutes_ago !== null && coin.last_updated_minutes_ago < 1;

    const renderTrend = (timeframe, trend) => {
        if (!trend) {
            return (
                <div className="trend-badge">
                    <span className="trend-timeframe">{timeframe}</span>
                    <span className="trend-value neutral">—</span>
                </div>
            );
        }

        const isUp = trend === 'uptrend';
        return (
            <div className="trend-badge">
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
                        <span className="signal-emoji">○</span>
                        <span className="signal-text awaiting">AWAITING</span>
                    </div>
                </div>
            );
        }

        const isBuy = signal.type === 'buy';
        return (
            <div className={`signal-container ${isBuy ? 'buy' : 'sell'}`}>
                <div className="signal-content">
                    <span className="signal-emoji">{isBuy ? '◉' : '◉'}</span>
                    <div>
                        <span className={`signal-text ${isBuy ? 'buy' : 'sell'}`}>
                            {isBuy ? 'BUY' : 'SELL'}
                        </span>
                        <div className="signal-time">
                            {formatTime(signal.minutes_ago)} ago
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
                    <div className="coin-icon">
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
                <div className="update-info">UPDATED</div>
                <span className={`update-time ${isRecent ? 'recent' : ''}`}>
                    {formatTime(coin.last_updated_minutes_ago)}
                </span>
            </div>
        </div>
    );
}

export default CoinCard;
