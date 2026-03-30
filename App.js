const { useState, useEffect } = React;

function TrustWheel({ score }) {
    // Gradient interpolator for red (0) -> yellow (50) -> green (100)
    const getGradientColor = (s) => {
        if (s <= 50) {
            const pct = s / 50;
            const r = Math.round(239 + pct * (245 - 239));
            const g = Math.round(68 + pct * (158 - 68));
            const b = Math.round(68 - pct * (68 - 11));
            return `rgb(${r}, ${g}, ${b})`;
        }
        const pct = (s - 50) / 50;
        const r = Math.round(245 - pct * (245 - 16));
        const g = Math.round(158 + pct * (185 - 158));
        const b = Math.round(11 + pct * (129 - 11));
        return `rgb(${r}, ${g}, ${b})`;
    };

    const color = getGradientColor(score);
    
    let verdict = "CRITICAL RISK";
    if (score >= 40) verdict = "CAUTION";
    if (score >= 75) verdict = "SAFE";

    const bgPulse = color.replace('rgb', 'rgba').replace(')', ', 0.1)');

    return (
        <div className="verdict-container">
            <h4 className="verdict-subtitle">PROTOCOL VERDICT</h4>
            <div className="wheel-wrapper">
                <svg viewBox="0 0 36 36" className="circular-chart">
                    {/* Inner dark circle to create depth */}
                    <circle cx="18" cy="18" r="14" fill="#1c1c1c" />
                    
                    <path className="circle-bg"
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path className="circle"
                        stroke={color}
                        strokeDasharray={`${score}, 100`}
                        style={{ filter: `drop-shadow(0px 0px 3px ${color})` }}
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                </svg>
                <div className="wheel-score">
                    <span className="score-val">{score}</span>
                    <span className="score-text">SCORE</span>
                </div>
            </div>
            
            <div className="verdict-badge" style={{ borderColor: color, color: color, background: bgPulse }}>
                {verdict}
            </div>
            <p className="verdict-desc">
                Proceed with awareness. This service contains structural disadvantages for the user that are standard but restrictive.
            </p>

            <div className="mini-stats">
                <div className="stat-row">
                    <span>PRIVACY</span>
                    <div className="bar-bg"><div className="bar-fill" style={{width: '70%', background: '#FF6B00'}}></div></div>
                </div>
                <div className="stat-row">
                    <span>LIABILITY</span>
                    <div className="bar-bg"><div className="bar-fill" style={{width: '40%', background: '#ef4444'}}></div></div>
                </div>
                <div className="stat-row">
                    <span>CONTROL</span>
                    <div className="bar-bg"><div className="bar-fill" style={{width: '60%', background: '#049EFF'}}></div></div>
                </div>
            </div>

            <button className="download-btn">Download Full Report (PDF)</button>
        </div>
    );
}

function App() {
    const [showLanding, setShowLanding] = useState(true);
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [isDark, setIsDark] = useState(() => !document.body.classList.contains('light-theme'));

    const toggleTheme = () => {
        setIsDark(prev => {
            if (prev) document.body.classList.add('light-theme');
            else document.body.classList.remove('light-theme');
            return !prev;
        });
    };

    const analyze = async () => {
        if (text.length < 10) {
            alert("Please paste the agreement text first.");
            return;
        }
        setLoading(true);
        try {
            const response = await fetch("http://127.0.0.1:8000/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: text })
            });
            const data = await response.json();
            if (response.ok) {
                // Safety assignment to prevent React rendering crashes
                if (!data.summary) data.summary = "No summary provided.";
                if (!data.gotchas) data.gotchas = [];
                if (typeof data.trust_score !== 'number') data.trust_score = 50;
                setResult(data);
                
                // Scroll to top when results appear
                setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
            } else {
                alert("Server Error: " + JSON.stringify(data.detail || data));
            }
        } catch (error) {
            console.error("Fetch error:", error);
            alert("Could not connect to the Backend. Please ensure the Python server (tos_checker.py) is running.");
        }
        setLoading(false);
    };

    const goHome = () => {
        setResult(null);
        setText("");
        setShowLanding(true);
        setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
    };

    const goAbout = () => {
        setResult(null);
        setText("");
        setShowLanding(true);
        setTimeout(() => {
            const el = document.getElementById('about');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 50);
    };

    const goContact = () => {
        setResult(null);
        setText("");
        setShowLanding(true);
        setTimeout(() => {
            const el = document.getElementById('contact');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 50);
    };

    if (showLanding) {
        // LandingPage is now available globally from Landing.js
        return <LandingPage onStart={() => setShowLanding(false)} isDark={isDark} toggleTheme={toggleTheme} />;
    }

    return (
        <div className="app-container">
            <header className="app-header">
                <div className="app-logo">TOS Analyzer</div>
                <div className="app-nav">
                    <span style={{ cursor: 'pointer' }} onClick={goHome}>Home</span>
                    <span style={{ cursor: 'pointer' }} onClick={goAbout}>About</span>
                    <span style={{ cursor: 'pointer' }} onClick={goContact}>Contact</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button type="button" className="theme-toggle-btn" onClick={toggleTheme}>
                        {isDark ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="5" />
                                <line x1="12" y1="1" x2="12" y2="3" />
                                <line x1="12" y1="21" x2="12" y2="23" />
                                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                                <line x1="1" y1="12" x2="3" y2="12" />
                                <line x1="21" y1="12" x2="23" y2="12" />
                                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                            </svg>
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                            </svg>
                        )}
                    </button>
                    <div className="app-avatar" style={{ display: 'flex', color: '#94a3b8' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 20a6 6 0 0 0-12 0" />
                            <circle cx="12" cy="10" r="4" />
                            <circle cx="12" cy="12" r="10" />
                        </svg>
                    </div>
                </div>
            </header>

            {!result ? (
                <div className="input-section">
                    <h2 style={{ marginBottom: '20px' }}>Document Analysis</h2>
                    <textarea 
                        className="dark-textarea"
                        placeholder="Paste the Terms of Service or Privacy Policy here to detect hidden traps..." 
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    />
                    <button type="button" className="analyze-btn" onClick={analyze} disabled={loading}>
                        {loading ? "Analyzing Document..." : "Run AI Analysis"}
                    </button>
                </div>
            ) : (
                <div className="dashboard-grid">
                    <div className="main-panel">
                        <div className="panel-header">
                            <span className="accent-label">ANALYSIS RESULTS</span>
                            <h1>Document Report</h1>
                        </div>

                        <div className="summary-box">
                            <h3>Executive Summary</h3>
                            <p dangerouslySetInnerHTML={{ __html: String(result.summary || '').replace(/(arbitration|privacy|data|third-party|liability)/gi, '<span class="highlight-orange">$&</span>') }}></p>
                            
                            <div className="summary-footer">
                                <div>
                                    <span className="meta-label">READING TIME</span>
                                    <span className="meta-val">45 Minutes saved</span>
                                </div>
                                <div>
                                    <span className="meta-label">COMPLEXITY</span>
                                    <span className="meta-val">Post-Graduate Level</span>
                                </div>
                            </div>
                        </div>

                        <div className="gotchas-section">
                            <div className="gotchas-header">
                                <h3>Critical Gotchas</h3>
                                <span className="risk-badge">{result.gotchas.length} HIGH RISK FOUND</span>
                            </div>

                            <div className="gotchas-list">
                                {result.gotchas.length === 0 ? (
                                    <p style={{color: '#10b981'}}>No major red flags detected!</p>
                                ) : (
                                    result.gotchas.map((item, index) => (
                                        <div key={index} className="gotcha-card">
                                            <div className="gotcha-icon">⚠️</div>
                                            <div className="gotcha-content">
                                                <h4>Detected Clause</h4>
                                                <p>{item}</p>
                                                <div className="tags">
                                                    <span className="tag">LEGAL</span>
                                                    <span className="tag">ATTENTION</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="side-panel">
                        <TrustWheel score={result.trust_score} />
                        
                        <div className="pro-tip">
                            <div className="tip-icon">📍</div>
                            <div>
                                <h4>Pro-Tip</h4>
                                <p>You can opt-out of the arbitration clause by sending a written notice to their legal headquarters within 30 days of registration.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);