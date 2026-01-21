import React from 'react';

const MACRO_COLORS = {
    'BTC': { gradient: 'linear-gradient(135deg, rgba(251, 146, 60, 0.2), rgba(249, 115, 22, 0.1))', border: 'rgba(251, 146, 60, 0.3)', color: '#fb923c', icon: '₿' },
    'USDT.D': { gradient: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(22, 163, 74, 0.1))', border: 'rgba(34, 197, 94, 0.3)', color: '#22c55e', icon: '$' },
    'TOTAL': { gradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.1))', border: 'rgba(59, 130, 246, 0.3)', color: '#3b82f6', icon: 'Σ' },
    'TOTAL2': { gradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(124, 58, 237, 0.1))', border: 'rgba(139, 92, 246, 0.3)', color: '#8b5cf6', icon: 'Σ²' },
    'TOTAL3': { gradient: 'linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(219, 39, 119, 0.1))', border: 'rgba(236, 72, 153, 0.3)', color: '#ec4899', icon: 'Σ³' },
    'OTHERS': { gradient: 'linear-gradient(135deg, rgba(34, 211, 238, 0.2), rgba(6, 182, 212, 0.1))', border: 'rgba(34, 211, 238, 0.3)', color: '#22d3ee', icon: '◎' },
};

function getStyle(symbol) {
    return MACRO_COLORS[symbol] || {
        gradient: 'linear-gradient(135deg, rgba(124, 58, 237, 0.2), rgba(79, 70, 229, 0.1))',
        border: 'rgba(124, 58, 237, 0.3)',
        color: '#a78bfa',
        icon: '●'
    };
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

function MacroCard({ macro, delay }) {
    const style = getStyle(macro.symbol);

    return (
        <div
            className="macro-card"
            style={{ animationDelay: `${delay}s` }}
        >
            <div className="macro-header">
                <div
                    className="macro-icon"
                    style={{
                        background: style.gradient,
                        borderColor: style.border,
                        color: style.color
                    }}
                >
                    {style.icon}
                </div>
                <div>
                    <div className="macro-name">{macro.display_name}</div>
                    <div className="macro-symbol">{macro.symbol}</div>
                </div>
            </div>

            <div className="macro-indicators">
                <div className={`macro-indicator ${macro.monthly_trend}`}>
                    <span className="indicator-label">Monthly Trend</span>
                    <span className={`indicator-value ${macro.monthly_trend}`}>
                        {macro.monthly_trend === 'bullish' ? '▲ BULLISH' : '▼ BEARISH'}
                    </span>
                </div>

                <div className={`macro-indicator ${macro.monthly_macd}`}>
                    <span className="indicator-label">Monthly MACD</span>
                    <span className={`indicator-value ${macro.monthly_macd}`}>
                        {macro.monthly_macd === 'bullish' ? '▲ BULLISH' : '▼ BEARISH'}
                    </span>
                </div>
            </div>

            <div className="card-footer">
                <div className="update-info">
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Updated
                </div>
                <span className="update-time">
                    {formatTime(macro.last_updated_minutes_ago)}
                </span>
            </div>
        </div>
    );
}

export default MacroCard;
