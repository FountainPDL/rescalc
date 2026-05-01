import { Link } from 'react-router-dom';

export default function HistoryList({ history }) {
  return (
    <div className="result-grid">
      {history.map(entry => (
        <div key={entry.id} className="result-card">
          <div className="result-title">{entry.width}×{entry.height}</div>
          <div className="result-details">{entry.date}</div>
          <Link to="/" style={{color: 'var(--light-purple)', marginTop: '0.5rem', display:'inline-block'}}>Use this</Link>
        </div>
      ))}
    </div>
  );
}