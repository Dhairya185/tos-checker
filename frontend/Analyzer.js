const { useState } = React;

const API_BASE_URL = (() => {
    const origin = window.location.origin;
    const hostname = window.location.hostname;
    // If running on local dev servers (Live Server 5500, Vite 3000, etc.) or file:/// protocol
    if (!hostname || hostname === "localhost" || hostname === "127.0.0.1") {
        // If frontend is served directly by the backend itself (port 8000)
        if (window.location.port === "8000") {
            return origin;
        }
        // Otherwise, target the local backend port 8000
        return "http://127.0.0.1:8000";
    }
    // When deployed (e.g. Hugging Face Spaces), use the same origin
    return origin;
})();

function TrustWheel({ score }) {
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
            <h4 className="verdict-subtitle" style={{ fontWeight: 'normal' }}>PROTOCOL VERDICT</h4>
            <div className="wheel-wrapper">
                <svg viewBox="0 0 36 36" className="circular-chart">
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
                    <span className="score-val" style={{ fontWeight: 'normal' }}>{score}</span>
                    <span className="score-text" style={{ fontWeight: 'normal' }}>SCORE</span>
                </div>
            </div>
            
            <div className="verdict-badge" style={{ borderColor: color, color: color, background: bgPulse, fontWeight: 'normal' }}>
                {verdict}
            </div>
            <p className="verdict-desc" style={{ fontWeight: 'normal' }}>
                Proceed with awareness. This service contains structural disadvantages for the user that are standard but restrictive.
            </p>

            <div className="mini-stats">
                <div className="stat-row">
                    <span style={{ fontWeight: 'normal' }}>PRIVACY</span>
                    <div className="bar-bg"><div className="bar-fill" style={{width: '70%', background: '#FF6B00'}}></div></div>
                </div>
                <div className="stat-row">
                    <span style={{ fontWeight: 'normal' }}>LIABILITY</span>
                    <div className="bar-bg"><div className="bar-fill" style={{width: '40%', background: '#ef4444'}}></div></div>
                </div>
                <div className="stat-row">
                    <span style={{ fontWeight: 'normal' }}>CONTROL</span>
                    <div className="bar-bg"><div className="bar-fill" style={{width: '60%', background: '#049EFF'}}></div></div>
                </div>
            </div>

            <button className="download-btn" style={{ fontWeight: 'normal' }}>Download Full Report (PDF)</button>
        </div>
    );
}

function AnalyzerApp() {
    const [isDark, setIsDark] = useState(() => {
        const saved = localStorage.getItem('tos_theme_dark');
        if (saved !== null) {
            const dark = JSON.parse(saved);
            if (!dark) document.body.classList.add('light-theme');
            return dark;
        }
        document.body.classList.add('light-theme');
        return false;
    });

    const toggleTheme = () => {
        setIsDark(prev => {
            const nextThemeDark = !prev;
            if (nextThemeDark) document.body.classList.remove('light-theme');
            else document.body.classList.add('light-theme');
            
            localStorage.setItem('tos_theme_dark', JSON.stringify(nextThemeDark));
            return nextThemeDark;
        });
    };

    const goHome = () => {
        window.location.href = 'index.html';
    };

    const goAbout = () => {
        window.location.href = 'index.html#how-it-works';
    };

    const goContact = () => {
        window.location.href = 'index.html#contact';
    };

    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [selectedModel, setSelectedModel] = useState("tos-custom-pro");

    const analyze = async () => {
        if (text.length < 10) {
            alert("Please paste the agreement text first.");
            return;
        }
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/analyze`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: text, model_choice: selectedModel })
            });
            const data = await response.json();
            if (response.ok) {
                if (!data.summary) data.summary = "No summary provided.";
                if (!data.gotchas) data.gotchas = [];
                if (typeof data.trust_score !== 'number') data.trust_score = 50;
                setResult(data);
                
                setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
            } else {
                alert("Server Error: " + JSON.stringify(data.detail || data));
            }
        } catch (error) {
            console.error(error);
            alert("Could not connect to the Backend. Please ensure the Python server is running.");
        }
        setLoading(false);
    };

    return (
        <div className="landing-wrapper">
            <nav className="landing-nav">
                <div className="landing-logo" style={{ fontWeight: 'normal' }}>TOS.AI</div>
                <div className="landing-links">
                    <a href="#" style={{ fontWeight: 'normal' }} onClick={(e) => { e.preventDefault(); goHome(); }}>Home</a>
                    <a href="#" style={{ fontWeight: 'normal' }} onClick={(e) => { e.preventDefault(); goAbout(); }}>How It Works</a>
                    <a href="#" style={{ fontWeight: 'normal' }} onClick={(e) => { e.preventDefault(); goContact(); }}>Contact</a>
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
            </nav>
            <div className="app-container" style={{ paddingTop: '20px', minHeight: 'auto' }}>

            {!result ? (
                <div className="input-section">
                    <h2 style={{ marginBottom: '20px', fontWeight: 'normal' }}>Document Analysis</h2>
                    
                    <div className="model-select-container">
                        <label className="model-select-label" style={{ fontWeight: 'normal' }}>Analysis Model Engine</label>
                        <select 
                            className="model-select-dropdown"
                            value={selectedModel}
                            onChange={(e) => setSelectedModel(e.target.value)}
                            style={{ fontWeight: 'normal' }}
                        >
                            <option value="tos-custom-pro">Free Tier (Local ML/Heuristic Classifier)</option>
                            <option value="gemini-2.5-flash">Pro Tier (Gemini 2.5 Flash API)</option>
                            <option value="gemini-2.5-pro">Pro Tier (Gemini 2.5 Pro API)</option>
                        </select>
                    </div>

                    <textarea 
                        className="dark-textarea"
                        placeholder="Paste the Terms of Service or Privacy Policy here to detect hidden traps..." 
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        style={{ fontWeight: 'normal' }}
                    />
                    <button type="button" className="analyze-btn" onClick={analyze} disabled={loading} style={{ fontWeight: 'normal' }}>
                        {loading ? "Analyzing Document..." : "Run AI Analysis"}
                    </button>
                </div>
            ) : (
                <div className="dashboard-grid">
                    <div className="main-panel">
                        <div className="panel-header">
                            <span className="accent-label" style={{ fontWeight: 'normal' }}>ANALYSIS RESULTS ({selectedModel === "tos-custom-pro" ? "FREE TIER" : "PRO TIER"})</span>
                            <h1 style={{ fontWeight: 'normal' }}>Document Report</h1>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 'normal' }}>
                                Analyzed using: <span>{
                                    selectedModel === "tos-custom-pro" 
                                    ? "Local ML Classifier (Offline)" 
                                    : selectedModel === "gemini-2.5-pro"
                                    ? "Gemini 2.5 Pro (Deep Risk Audit)"
                                    : "Gemini 2.5 Flash (Fast & Lightweight)"
                                }</span>
                            </p>
                        </div>

                        <div className="summary-box">
                            <h3 style={{ fontWeight: 'normal' }}>Executive Summary</h3>
                            <p style={{ fontWeight: 'normal' }} dangerouslySetInnerHTML={{ __html: String(result.summary || '') }}></p>
                            
                            <div className="summary-footer">
                                <div>
                                    <span className="meta-label" style={{ fontWeight: 'normal' }}>READING TIME</span>
                                    <span className="meta-val" style={{ fontWeight: 'normal' }}>45 Minutes saved</span>
                                </div>
                                <div>
                                    <span className="meta-label" style={{ fontWeight: 'normal' }}>COMPLEXITY</span>
                                    <span className="meta-val" style={{ fontWeight: 'normal' }}>Post-Graduate Level</span>
                                </div>
                            </div>
                        </div>

                        <div className="gotchas-section">
                            <div className="gotchas-header">
                                <h3 style={{ fontWeight: 'normal' }}>Critical Gotchas</h3>
                                <span className="risk-badge" style={{ fontWeight: 'normal' }}>{result.gotchas.length} HIGH RISK FOUND</span>
                            </div>

                            <div className="gotchas-list">
                                {result.gotchas.length === 0 ? (
                                    <p style={{color: '#10b981', fontWeight: 'normal'}}>No major red flags detected!</p>
                                ) : (
                                    result.gotchas.map((item, index) => (
                                        <div key={index} className="gotcha-card">
                                            <div className="gotcha-icon">⚠️</div>
                                            <div className="gotcha-content">
                                                <h4 style={{ fontWeight: 'normal' }}>Detected Clause</h4>
                                                <p style={{ fontWeight: 'normal' }}>{item}</p>
                                                <div className="tags">
                                                    <span className="tag" style={{ fontWeight: 'normal' }}>LEGAL</span>
                                                    <span className="tag" style={{ fontWeight: 'normal' }}>ATTENTION</span>
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
                                <h4 style={{ fontWeight: 'normal' }}>Pro-Tip</h4>
                                <p style={{ fontWeight: 'normal' }}>You can opt-out of the arbitration clause by sending a written notice to their legal headquarters within 30 days of registration.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<AnalyzerApp />);
