import useHistory from '../hooks/useHistory';
import HistoryList from '../components/HistoryList';

export default function HistoryPage() {
  const { history, clearHistory } = useHistory();
  return (
    <div className="card">
      <h2 style={{color: 'var(--primary-purple)'}}>Calculation History</h2>
      {history.length === 0 ? (
        <p style={{color: 'var(--text-secondary)'}}>No calculations yet.</p>
      ) : (
        <>
          <HistoryList history={history} />
          <button className="danger" onClick={clearHistory} style={{marginTop: '1rem'}}>Clear History</button>
        </>
      )}
    </div>
  );
}