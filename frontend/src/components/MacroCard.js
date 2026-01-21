import React from 'react';

// Vision UI inspired gradients for macro indicators
const MACRO_STYLES = {
    'BTC': { 
        gradient: 'linear-gradient(310deg, #f5365c, #f56036)', 
        glow: 'rgba(245, 54, 92, 0.4)',
        icon: '₿'
    },
    'USDT.D': { 
        gradient: 'linear-gradient(310deg, #01b574, #0ff0b3)', 
        glow: 'rgba(1, 181, 116, 0.4)',
        icon: '$'
    },
    'TOTAL': { 
        gradient: 'linear-gradient(310deg, #0075ff, #21d4fd)', 
        glow: 'rgba(33, 212, 253, 0.4)',
        icon: 'Σ'
    },
    'TOTAL2': { 
        gradient: 'linear-gradient(310deg, #7928ca, #ff0080)', 
        glow: 'rgba(121, 40, 202, 0.4)',
        icon: 'Σ²'
    },
    'TOTAL3': { 
        gradient: 'linear-gradient(310deg, #ec4899, #f472b6)', 
        glow: 'rgba(236, 72, 153, 0.4)',
        icon: 'Σ³'
    },
    'OTHERS': { 
        gradient: 'linear-gradient(310deg, #06b6d4, #22d3ee)', 
        glow: 'rgba(6, 182, 212, 0.4)',
        icon: '◎'
    },
};

function getStyle(symbol) {
    return MACRO_STYLES[symbol] || {
        gradient: 'linear-gradient(310deg, #7928ca, #ff0080)',
        glow: 'rgba(121, 40, 202, 0.4)',
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
                        boxShadow: `0 0 25px ${style.glow}`
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
