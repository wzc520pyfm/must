import React, { useState } from 'react';
import './App.css';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to Must Playground</h1>
        <p>This is a testing environment for the Must internationalization tool.</p>
      </header>

      <main className="main-content">
        <section className="counter-section">
          <h2>Counter Example</h2>
          <p>Current count: {count}</p>
          <button onClick={() => setCount(count + 1)}>
            Increment Counter
          </button>
          <button onClick={() => setCount(0)}>
            Reset Counter
          </button>
        </section>

        <section className="features-section">
          <h2>Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <h3>Auto Extract</h3>
              <p>Automatically extract text from your code</p>
            </div>
            <div className="feature-card">
              <h3>Auto Translate</h3>
              <p>Translate text to multiple languages</p>
            </div>
            <div className="feature-card">
              <h3>Easy to Use</h3>
              <p>Simple CLI commands for quick setup</p>
            </div>
          </div>
        </section>

        <section className="instructions">
          <h2>How to Test</h2>
          <ol>
            <li>Run <code>pnpm must</code> in the playground directory</li>
            <li>Check the generated <code>i18n/strings</code> directory</li>
            <li>Review the extracted texts and translations</li>
          </ol>
        </section>
      </main>

      <footer className="app-footer">
        <p>Built with React and Vite</p>
        <p>Powered by Must - Automated i18n Tool</p>
      </footer>
    </div>
  );
}

export default App;
