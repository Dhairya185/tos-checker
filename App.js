const { useState } = React;

function TrustWheel({ score }) {
    let color = "#ef4444";
    let verdict = "Unsafe";
    let bgPulse = "rgba(239, 68, 68, 0.1)";

    if (score > 40) {
        color = "#f59e0b";
        verdict = "Questionable";
        bgPulse = "rgba(245, 158, 11, 0.1)";
    }
    if (score > 75) {
        color = "#10b981";
        verdict = "Safe";
        bgPulse = "rgba(16, 185, 129, 0.1)";
    }

    return (
        <div className="card" style={{ textAlign: "center", display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <h3 style={{color: '#64748b', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '1px'}}>Trust Score</h3>
            
            <div style={{ position: 'relative', width: '200px', height: '200px', margin: '20px auto' }}>
                <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                          fill="none" stroke="#f1f5f9" strokeWidth="2.5" />
                    
                    <path 
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                        fill="none" 
                        stroke={color} 
                        strokeWidth="2.5" 
                        strokeDasharray={`${score}, 100`} 
                        strokeLinecap="round"
                        style={{ transition: "stroke-dasharray 1.5s ease-in-out" }}
                    />
                </svg>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: '800', color: color }}>{score}%</div>
                </div>
            </div>

            <div className="trust-verdict" style={{ color: color, background: bgPulse, padding: '5px 15px', borderRadius: '20px' }}>
                {verdict}
            </div>
        </div>
    );
}

function App() {
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

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
                setResult(data);
                setTimeout(() => {
                    const resultsElement = document.getElementById('results-area');
                    if (resultsElement) resultsElement.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            } else {
                alert("Server Error: " + data.detail);
            }
        } catch (error) {
            console.error(error);
            alert("Could not connect to the Python Backend. Is it running?");
        }
        setLoading(false);
    };

    return (
        <div className="container">
            <header>
                <h1>⚖️ Legal Lens</h1>
                <p>AI-Powered Terms of Service Scanner</p>
            </header>

            <div className="card">
                <textarea 
                    placeholder="Paste the Terms of Service here to detect hidden traps..." 
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />
                <button onClick={analyze} disabled={loading}>
                    {loading ? (
                        <span>Analyzing Legalese...</span>
                    ) : (
                        "Analyze Agreement"
                    )}
                </button>
            </div>

            {result && (
                <div id="results-area" className="results-grid">
                    
                    <TrustWheel score={result.trust_score} />

                    <div className="card">
                        <h3 style={{ borderBottom: '2px solid #f1f5f9', paddingBottom: '10px', marginBottom: '15px' }}>
                            📝 Executive Summary
                        </h3>
                        <p className="summary-text">{result.summary}</p>
                        
                        <h3 style={{ marginTop: "30px", color: "#b91c1c", display: 'flex', alignItems: 'center', gap: '8px' }}>
                            🚩 Detected Red Flags
                        </h3>
                        
                        {result.gotchas.length === 0 ? (
                            <p style={{color: '#10b981', fontStyle: 'italic'}}>No major red flags detected. (But always read carefully!)</p>
                        ) : (
                            result.gotchas.map((item, index) => (
                                <div key={index} className="gotcha-item">
                                    <span>⚠️</span> {item}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);