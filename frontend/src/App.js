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

        const handleVisibility = () => {
            if (document.visibilityState === 'visible') {
                fetchData();
            }
        };

        document.addEventListener('visibilitychange', handleVisibility);

        return () => {
            clearInterval(interval);
            document.removeEventListener('visibilitychange', handleVisibility);
        };
    }, [fetchData]);

    return (
        <div className="app-container">
            {/* Header */}
            <header className="header">
                <div className="header-left">
                    <div className="logo-icon">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                    </div>
                    <div className="header-title">
                        <h1>Crypto Trading</h1>
                        <p>Real-time TradingView Signals</p>
                    </div>
                </div>

                <div className="header-right">
                    <div className="status-badge">
                        <span style={{ fontWeight: 700, color: 'white' }}>{coins.length}</span>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Coins
                        </span>
                    </div>
                    <div className="status-badge">
                        <div className="live-dot"></div>
                        <span style={{ fontWeight: 600, color: '#22c55e' }}>Live</span>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace' }}>{countdown}s</span>
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
                        📊 Assets
                    </button>
                    <button
                        className={`tab ${activeTab === 'macro' ? 'active' : ''}`}
                        onClick={() => setActiveTab('macro')}
                    >
                        🌐 Macro
                    </button>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="loading">
                    <div className="spinner"></div>
                    <p className="loading-text">Loading dashboard...</p>
                </div>
            ) : (
                <div className="cards-grid">
                    {activeTab === 'assets' ? (
                        coins.map((coin, index) => (
                            <CoinCard
                                key={coin.symbol}
                                coin={coin}
                                delay={index * 0.08}
                            />
                        ))
                    ) : (
                        macros.map((macro, index) => (
                            <MacroCard
                                key={macro.symbol}
                                macro={macro}
                                delay={index * 0.08}
                            />
                        ))
                    )}
                </div>
            )}

            {/* Footer */}
            <footer className="footer">
                <span>Powered by TradingView Webhooks</span>
                <span>
                    Last sync: {lastUpdate ? lastUpdate.toLocaleTimeString('de-DE', {
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
