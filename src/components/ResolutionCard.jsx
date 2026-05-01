import { useCallback } from 'react';

function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}

function getAspectRatio(w, h) {
  if (!w || !h) return '--';
  const ratio = Math.max(w, h) / Math.min(w, h);
  const knownRatios = [
    { value: 4 / 3, label: '4:3' },
    { value: 16 / 10, label: '16:10' },
    { value: 16 / 9, label: '16:9' },
    { value: 18 / 9, label: '18:9' },
    { value: 19.5 / 9, label: '19.5:9' },
    { value: 20 / 9, label: '20:9' },
    { value: 21 / 9, label: '21:9' },
  ];
  const tolerance = 0.02;
  for (const r of knownRatios) {
    if (Math.abs(ratio - r.value) < tolerance) return r.label;
  }
  const divisor = gcd(w, h);
  let rw = w / divisor;
  let rh = h / divisor;
  if (rw < rh) [rw, rh] = [rh, rw];
  return `${rw}:${rh}`;
}

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
  const megapixels = ((width * height) / 1000000).toFixed(2);

  const handleSelect = useCallback(() => {
    if (onSelect) onSelect(width, height);
  }, [width, height, onSelect]);

  return (
    <div className="result-card">
      <div className="result-title">
        {label || `${width} × ${height}`}
      </div>
      {label && (
        <div className="result-res">
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
                width: 'auto',
                padding: '0.3rem 0.6rem',
                fontSize: '0.8rem',
              }}
            >
              Use
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete()}
              className="danger"
              style={{
                width: 'auto',
                padding: '0.3rem 0.6rem',
                fontSize: '0.8rem',
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
