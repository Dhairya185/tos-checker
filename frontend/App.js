const { useState, useEffect } = React;

function App() {
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

    const handleStart = () => {
        window.location.href = 'analyzer.html';
    };

    return <LandingPage onStart={handleStart} isDark={isDark} toggleTheme={toggleTheme} />;
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);