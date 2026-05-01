import { Routes, Route, NavLink } from 'react-router-dom';
import CalculatorPage from './pages/CalculatorPage';
import HistoryPage from './pages/HistoryPage';

export default function App() {
  return (
    <div className="app">
      <header className="header">
        <h1>FountainPDL's Resolution Calculator</h1>
        <p className="subtitle">Professional Screen Resolution Analysis Tool</p>
      </header>

      <nav className="nav">
        <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Calculator</NavLink>
        <NavLink to="/history" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>History</NavLink>
      </nav>

      <main className="container">
        <Routes>
          <Route path="/" element={<CalculatorPage />} />
          <Route path="/history" element={<HistoryPage />} />
        </Routes>
      </main>

      <footer className="footer">
        <p>FountainPDL's Resolution Calculator © 2026</p>
      </footer>
    </div>
  );
}