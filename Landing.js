const LandingPage = ({ onStart, isDark, toggleTheme }) => {
    return (
        <div className="landing-wrapper">
            <nav className="landing-nav">
                <div className="landing-logo">TOS.AI</div>
                <div className="landing-links">
                    <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({top:0, behavior:'smooth'}); }} className="active">Home</a>
                    <a href="#about">About</a>
                    <a href="#how-it-works">How it Works</a>
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

            <section className="hero-section">
                <div className="hero-content">
                    <div className="security-badge">SECURITY INTELLIGENCE</div>
                    <h1 className="hero-title">
                        Guardian of Your <span className="text-primary">Legal</span> Privacy.
                    </h1>
                    <p className="hero-description">
                        In an era of hidden clauses, TOS.AI architecturally deconstructs complex legal documents into human-readable insights. Stop agreeing blindly.
                    </p>
                    <div className="hero-actions">
                        <button type="button" className="primary-btn" onClick={onStart}>Start Your Analysis</button>
                        <button type="button" className="secondary-btn">View Sample Report</button>
                    </div>
                </div>
                <div className="hero-image-stack">
                    <div className="hero-backdrop"></div>
                    <img src="https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=800&auto=format&fit=crop" alt="Legal Architecture" className="hero-photo" />
                    <div className="accuracy-card">
                        <div className="accuracy-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                                <path d="m9 12 2 2 4-4"/>
                            </svg>
                        </div>
                        <h4>99.8% Accuracy</h4>
                        <p>Our LLM-driven engine parses 1,000+ words per second to find every liability shift.</p>
                    </div>
                </div>
            </section>

            <section id="about" className="why-matters-section">
                <div className="why-header">
                    <h2>Why TOS Analysis <span className="border-bottom-primary">Matters</span></h2>
                    <p className="why-quote">"The average user spends less than 6 seconds reading terms that govern their entire digital identity."</p>
                </div>
                
                <div className="cards-grid">
                    <div className="feature-card">
                        <div className="card-icon text-primary">
                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-gavel">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                <path d="M13 10l7.383 7.418c.823 .82 .823 2.148 0 2.967a2.11 2.11 0 0 1 -2.976 0l-7.407 -7.385" />
                                <path d="M6 9l4 4" />
                                <path d="M13 10l-4 -4" />
                                <path d="M3 21h7" />
                                <path d="M6.793 15.793l-3.586 -3.586a1 1 0 0 1 0 -1.414l2.293 -2.293l.5 .5l3 -3l-.5 -.5l2.293 -2.293a1 1 0 0 1 1.414 0l3.586 3.586a1 1 0 0 1 0 1.414l-2.293 2.293l-.5 -.5l-3 3l.5 .5l-2.293 2.293a1 1 0 0 1 -1.414 0" />
                            </svg>
                        </div>
                        <h3>Unfair Terms</h3>
                        <p>We detect hidden clauses that strip you of your right to class-action lawsuits or force unfavorable arbitration locations.</p>
                        <div className="card-tag">RISK LEVEL: HIGH</div>
                    </div>
                    <div className="feature-card">
                        <div className="card-icon text-primary">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                                <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                                <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                                <line x1="2" y1="2" x2="22" y2="22" />
                            </svg>
                        </div>
                        <h3>Privacy Risks</h3>
                        <p>Detailed tracking of how your data is harvested, shared with third-party brokers, and used for algorithmic profiling.</p>
                        <div className="card-tag">DATA PROTECTION</div>
                    </div>
                    <div className="feature-card">
                        <div className="card-icon text-primary">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="4" x2="12" y2="16" />
                                <line x1="12" y1="20" x2="12.01" y2="20" />
                            </svg>
                        </div>
                        <h3>Liability Shifts</h3>
                        <p>Identification of "hold harmless" agreements where the company deflects responsibility for security breaches or data loss.</p>
                        <div className="card-tag">LEGAL SHARE</div>
                    </div>
                </div>
            </section>

            <section id="how-it-works" className="steps-section">
                <div className="steps-content">
                    <h2>A Seamless Path to Legal Clarity.</h2>
                    <p>Designed for the modern professional who values time and transparency. No law degree required.</p>
                    <div className="abstract-graphic"></div>
                </div>
                <div className="steps-list">
                    <div className="step-item">
                        <div className="step-number">01</div>
                        <div className="step-text">
                            <h3>Paste the Text</h3>
                            <p>Simply copy the entire Terms of Service or Privacy Policy text and paste it into our secure, encrypted analyzer portal.</p>
                        </div>
                    </div>
                    <div className="step-item">
                        <div className="step-number">02</div>
                        <div className="step-text">
                            <h3>AI Analysis</h3>
                            <p>Our specialized legal models scan for over 460 unique risk indicators, cross-referencing against consumer protection laws.</p>
                        </div>
                    </div>
                    <div className="step-item">
                        <div className="step-number">03</div>
                        <div className="step-text">
                            <h3>Understand Results</h3>
                            <p>Receive a prioritized summary of concerns, translated into plain English, with actionable advice on whether to proceed.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="cta-section">
                <div className="cta-box">
                    <h2>Ready to secure your digital rights?</h2>
                    <p>Join over 50,000 users who have exposed hidden clauses using TOS.AI.</p>
                    <button type="button" className="primary-btn big-btn" onClick={onStart}>Analyze Now</button>
                </div>
            </section>

            <footer id="contact" className="landing-footer">
                <div className="footer-logo">TOS.AI <span className="copyright">© 2026 TOS.AI Architectural Methodologies for Legal Analysis.</span></div>
                <div className="footer-links">
                    <a href="#">Privacy Policy</a>
                    <a href="#">Terms of Service</a>
                    <a href="#">Legal Notice</a>
                </div>
            </footer>
        </div>
    );
};
