const { useState } = React;

function TrustWheel({ score }) {
    const radius = 15.9155;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;
    
    let color = "#ef4444"; 
    if (score > 40) color = "#f59e0b"; 
    if (score > 75) color = "#22c55e"; 

    return (
        <div className="card" style={{ textAlign: "center" }}>
            <h3>Trust Score</h3>
            <svg viewBox="0 0 36 36" style={{ maxWidth: "80%", margin: "0 auto", display: "block" }}>
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#eee" strokeWidth="3.8" />
                <path 
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                    fill="none" 
                    stroke={color} 
                    strokeWidth="2.8" 
                    strokeDasharray={`${score}, 100`} 
                    style={{ transition: "stroke-dasharray 1s ease-out" }}
                />
                <text x="18" y="20.35" fill="#666" fontSize="0.5em" textAnchor="middle" fontWeight="bold">{score}%</text>
            </svg>
            <p style={{ fontWeight: "bold", marginTop: "10px" }}>
                {score > 70 ? "Looks Safe" : "Proceed with Caution"}
            </p>
        </div>
    );
}

function App() {
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const analyze = async () => {
        if (text.length < 10) {
            alert("Please paste a longer text.");
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
            } else {
                alert("Error: " + data.detail);
            }
        } catch (error) {
            alert("Could not connect to backend.");
        }
        setLoading(false);
    };

    return (
        <div className="container">
            <header>
                <h1>⚖️ Legal Lens (React)</h1>
                <p>Paste a Terms of Service agreement below</p>
            </header>

            <div className="card">
                <textarea 
                    placeholder="Paste legal text here..." 
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />
                <button onClick={analyze} disabled={loading}>
                    {loading ? "Consulting AI..." : "Analyze Agreement"}
                </button>
            </div>

            {result && (
                <div className="results-grid">
                    <TrustWheel score={result.trust_score} />
                    <div className="card">
                        <h3>📝 Summary</h3>
                        <p>{result.summary}</p>
                        
                        <h3 style={{ marginTop: "20px", color: "var(--danger)" }}>🚩 Red Flags</h3>
                        {result.gotchas.map((item, index) => (
                            <div key={index} className="gotcha-item">⚠️ {item}</div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);