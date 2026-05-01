import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Calculator from './components/Calculator';
import HistoryPage from './pages/HistoryPage';
import { HistoryProvider } from './hooks/useHistory.jsx';

function AppContent() {
  const [activeTab, setActiveTab] = useState('calculator');
  const navigate = useNavigate();

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(tab === 'calculator' ? '/' : '/history');
  };

  return (
    <div className="app">
      <header className="header">
        <h1>FountainPDL's Resolution Calculator</h1>
        <p className="subtitle">Professional Screen Resolution Analysis Tool</p>
      </header>

      <nav className="nav">
        <button
          className={`nav-link ${activeTab === 'calculator' ? 'active' : ''}`}
          onClick={() => handleTabChange('calculator')}
        >
          Calculator
        </button>
        <button
          className={`nav-link ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => handleTabChange('history')}
        >
          History
        </button>
      </nav>

      <main className="container">
        <Routes>
          <Route path="/" element={<Calculator />} />
          <Route path="/history" element={<HistoryPage />} />
        </Routes>
      </main>

      <div className="big-emoji">🙂</div>
      <footer className="footer">
        <p>FountainPDL's Resolution Calculator © 2026</p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <HistoryProvider>
      <AppContent />
    </HistoryProvider>
  );
}
