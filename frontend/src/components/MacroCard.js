import React from 'react';

const MACRO_ICONS = {
    'BTC': '₿',
    'USDT.D': '$',
    'TOTAL': 'Σ',
    'TOTAL2': 'Σ²',
    'TOTAL3': 'Σ³',
    'OTHERS': '◎',
};

function formatTime(minutes) {
    if (minutes === null || minutes === undefined) return '—';
    if (minutes < 1) return 'NOW';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
}

function MacroCard({ macro, delay }) {
    const icon = MACRO_ICONS[macro.symbol] || '●';

    return (
        <div
            className="macro-card"
            style={{ animationDelay: `${delay}s` }}
        >
            <div className="macro-header">
                <div className="macro-icon">{icon}</div>
                <div>
                    <div className="macro-name">{macro.display_name}</div>
                    <div className="macro-symbol">{macro.symbol}</div>
                </div>
            </div>

            <div className="macro-indicators">
                <div className="macro-indicator">
                    <span className="indicator-label">MONTHLY TREND</span>
                    <span className={`indicator-value ${macro.monthly_trend}`}>
                        {macro.monthly_trend === 'bullish' ? '▲ BULL' : '▼ BEAR'}
                    </span>
                </div>

                <div className="macro-indicator">
                    <span className="indicator-label">MONTHLY MACD</span>
                    <span className={`indicator-value ${macro.monthly_macd}`}>
                        {macro.monthly_macd === 'bullish' ? '▲ BULL' : '▼ BEAR'}
                    </span>
                </div>
            </div>

            <div className="card-footer">
                <div className="update-info">UPDATED</div>
                <span className="update-time">
                    {formatTime(macro.last_updated_minutes_ago)}
                </span>
            </div>
        </div>
    );
}

export default MacroCard;
