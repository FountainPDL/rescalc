import { useHistory } from '../hooks/useHistory.jsx';
import ResolutionCard from '../components/ResolutionCard';

export default function HistoryPage() {
  const { history, clearHistory, removeEntry } = useHistory();

  return (
    <div className="card">
      <h2 style={{ color: 'var(--primary-purple)' }}>Calculation History</h2>
      {history.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)' }}>No calculations yet. Go calculate something!</p>
      ) : (
        <>
          <div className="result-grid">
            {history.map(entry => (
              <ResolutionCard
                key={entry.id}
                width={entry.width}
                height={entry.height}
                date={entry.date}
                onDelete={() => removeEntry(entry.id)}
                showActions={true}
              />
            ))}
          </div>
          <button className="danger" onClick={clearHistory} style={{ marginTop: '1rem' }}>
            Clear All History
          </button>
        </>
      )}
    </div>
  );
}
