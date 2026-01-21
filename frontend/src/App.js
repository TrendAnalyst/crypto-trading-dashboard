import React, { useState, useEffect, useCallback } from 'react';
import CoinCard from './components/CoinCard';
import MacroCard from './components/MacroCard';

function App() {
    const [activeTab, setActiveTab] = useState('assets');
    const [coins, setCoins] = useState([]);
    const [macros, setMacros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [countdown, setCountdown] = useState(3);

    const fetchData = useCallback(async () => {
        try {
            const [coinsRes, macrosRes] = await Promise.all([
                fetch('/api/coins'),
                fetch('/api/macro')
            ]);

            if (coinsRes.ok) {
                const coinsData = await coinsRes.json();
                setCoins(coinsData.coins);
            }

            if (macrosRes.ok) {
                const macrosData = await macrosRes.json();
                setMacros(macrosData.macros);
            }

            setLastUpdate(new Date());
            setLoading(false);
            setCountdown(3);
        } catch (error) {
            console.error('Fetch error:', error);
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();

        const interval = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    fetchData();
                    return 3;
                }
                return prev - 1;
            });
        }, 1000);

        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') fetchData();
        });

        return () => clearInterval(interval);
    }, [fetchData]);

    // Calculate Market Verdict from macro data
    const calculateVerdict = () => {
        if (macros.length === 0) return { verdict: 'LOADING', bullish: 0, bearish: 0 };
        
        let bullishCount = 0;
        let bearishCount = 0;
        
        macros.forEach(macro => {
            if (macro.monthly_trend === 'bullish') bullishCount++;
            else bearishCount++;
            if (macro.monthly_macd === 'bullish') bullishCount++;
            else bearishCount++;
        });
        
        const total = bullishCount + bearishCount;
        const verdict = bullishCount > bearishCount ? 'BULLISH' : 'BEARISH';
        
        return { verdict, bullish: bullishCount, bearish: bearishCount, total };
    };

    const verdictData = calculateVerdict();

    return (
        <div className="app-container">
            {/* Header */}
            <header className="header">
                <div className="header-left">
                    <div className="logo-icon">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                    </div>
                    <div className="header-title">
                        <h1>CRYPTO TERMINAL</h1>
                        <p>TradingView Signals</p>
                    </div>
                </div>
                
                <div className="header-right">
                    <div className="status-badge">
                        <span style={{ color: '#8e8e93' }}>{coins.length}</span>
                        <span style={{ color: '#636366' }}>ASSETS</span>
                    </div>
                    <div className="status-badge">
                        <div className="live-dot"></div>
                        <span style={{ color: '#00d26a' }}>LIVE</span>
                        <span style={{ color: '#636366' }}>{countdown}s</span>
                    </div>
                </div>
            </header>

            {/* Tabs */}
            <div className="tabs-container">
                <div className="tabs">
                    <button 
                        className={`tab ${activeTab === 'assets' ? 'active' : ''}`}
                        onClick={() => setActiveTab('assets')}
                    >
                        ASSETS
                    </button>
                    <button 
                        className={`tab ${activeTab === 'macro' ? 'active' : ''}`}
                        onClick={() => setActiveTab('macro')}
                    >
                        MACRO
                    </button>
                </div>
            </div>

            {/* Market Verdict Panel - Only on Macro Tab */}
            {activeTab === 'macro' && !loading && (
                <div className="market-verdict">
                    <div className="verdict-main">
                        <div className={`verdict-icon ${verdictData.verdict.toLowerCase()}`}>
                            {verdictData.verdict === 'BULLISH' ? '↗' : '↘'}
                        </div>
                        <div className="verdict-text">
                            <h3>Market Verdict</h3>
                            <div className={`verdict-status ${verdictData.verdict.toLowerCase()}`}>
                                {verdictData.verdict}
                            </div>
                        </div>
                    </div>
                    <div className="verdict-stats">
                        <div className="verdict-stat">
                            <div className="verdict-stat-label">Bullish</div>
                            <div className="verdict-stat-value bullish">{verdictData.bullish}/{verdictData.total}</div>
                        </div>
                        <div className="verdict-stat">
                            <div className="verdict-stat-label">Bearish</div>
                            <div className="verdict-stat-value bearish">{verdictData.bearish}/{verdictData.total}</div>
                        </div>
                        <div className="verdict-stat">
                            <div className="verdict-stat-label">Confidence</div>
                            <div className="verdict-stat-value" style={{ color: '#ff9500' }}>
                                {verdictData.total > 0 ? Math.round((Math.max(verdictData.bullish, verdictData.bearish) / verdictData.total) * 100) : 0}%
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Content */}
            {loading ? (
                <div className="loading">
                    <div className="spinner"></div>
                    <p className="loading-text">LOADING DATA...</p>
                </div>
            ) : (
                <div className="cards-grid">
                    {activeTab === 'assets' ? (
                        coins.map((coin, index) => (
                            <CoinCard 
                                key={coin.symbol} 
                                coin={coin} 
                                delay={index * 0.05} 
                            />
                        ))
                    ) : (
                        macros.map((macro, index) => (
                            <MacroCard 
                                key={macro.symbol} 
                                macro={macro} 
                                delay={index * 0.05} 
                            />
                        ))
                    )}
                </div>
            )}

            {/* Footer */}
            <footer className="footer">
                <span>POWERED BY TRADINGVIEW WEBHOOKS</span>
                <span>
                    LAST SYNC: {lastUpdate ? lastUpdate.toLocaleTimeString('de-DE', { 
                        hour: '2-digit', 
                        minute: '2-digit', 
                        second: '2-digit' 
                    }) : '—'}
                </span>
            </footer>
        </div>
    );
}

export default App;
