import { useCallback } from 'react';
import { getAspectRatio } from '../utils/resolutionUtils';

export default function ResolutionCard({
  width,
  height,
  label,
  date,
  onSelect,
  onDelete,
  showActions = true,
}) {
  const ratio = getAspectRatio(width, height);
  const megapixels = ((width * height) / 1_000_000).toFixed(2);

  const handleSelect = useCallback(() => {
    if (onSelect) onSelect(width, height);
  }, [width, height, onSelect]);

  return (
    <div className="result-card">
      <div className="result-title">
        {label || `${width} × ${height}`}
      </div>
      {label && (
        <div className="result-res" style={{ fontSize: '1.3em', fontWeight: 700 }}>
          {width} × {height}
        </div>
      )}
      <div className="result-details">
        {megapixels} MP | {ratio}
        {date && <br />}
        {date && <span style={{ opacity: 0.7 }}>{date}</span>}
      </div>
      {showActions && (
        <div style={{ marginTop: '0.8rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {onSelect && (
            <button
              onClick={handleSelect}
              style={{
                background: 'var(--primary-purple)',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '0.3rem 0.6rem',
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              Use
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(width, height)}
              style={{
                background: 'var(--accent-red)',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '0.3rem 0.6rem',
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}