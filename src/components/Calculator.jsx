import { useState, useEffect, useCallback } from 'react';
import { useHistory } from '../hooks/useHistory.jsx';

// ---------- Utilities ----------
function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}

function simplifiedRatio(w, h) {
  const divisor = gcd(w, h);
  let rw = w / divisor;
  let rh = h / divisor;
  if (rw < rh) [rw, rh] = [rh, rw];
  return `${rw}:${rh}`;
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
  return simplifiedRatio(w, h);
}

const PRESETS = {
  standard: [
    { label: '144p (256×144)', w: 256, h: 144 },
    { label: '360p (640×360)', w: 640, h: 360 },
    { label: '720p HD (1280×720)', w: 1280, h: 720 },
    { label: '1080p FHD (1920×1080)', w: 1920, h: 1080 },
    { label: '2K QHD (2560×1440)', w: 2560, h: 1440 },
    { label: '4K UHD (3840×2160)', w: 3840, h: 2160 },
    { label: '8K (7680×4320)', w: 7680, h: 4320 },
  ],
  phones: [
    { label: 'iPhone 15 Pro (1179×2556)', w: 1179, h: 2556 },
    { label: 'iPhone 15 Pro Max (1284×2778)', w: 1284, h: 2778 },
    { label: 'iPhone 14 Pro (1170×2532)', w: 1170, h: 2532 },
    { label: 'iPhone SE (750×1334)', w: 750, h: 1334 },
    { label: 'Samsung Galaxy S24 (1080×2340)', w: 1080, h: 2340 },
    { label: 'Samsung Galaxy S24 Ultra (1440×3088)', w: 1440, h: 3088 },
    { label: 'Google Pixel 8 (1080×2400)', w: 1080, h: 2400 },
    { label: 'Google Pixel 8 Pro (1344×2992)', w: 1344, h: 2992 },
    { label: 'OnePlus 12 (1080×2412)', w: 1080, h: 2412 },
  ],
  tablets: [
    { label: 'iPad Pro 12.9" (2048×2732)', w: 2048, h: 2732 },
    { label: 'iPad Pro 11" (1668×2388)', w: 1668, h: 2388 },
    { label: 'iPad Air (1640×2360)', w: 1640, h: 2360 },
    { label: 'iPad 10.9" (2160×1620)', w: 2160, h: 1620 },
    { label: 'iPad Mini (1620×2160)', w: 1620, h: 2160 },
    { label: 'Surface Pro 9 (2880×1920)', w: 2880, h: 1920 },
    { label: 'Samsung Galaxy Tab S9 (2560×1600)', w: 2560, h: 1600 },
    { label: 'Amazon Fire HD 10 (2000×1200)', w: 2000, h: 1200 },
  ],
  laptops: [
    { label: 'MacBook Pro 16" (3456×2234)', w: 3456, h: 2234 },
    { label: 'MacBook Pro 14" (3024×1964)', w: 3024, h: 1964 },
    { label: 'MacBook Air 13" (2560×1664)', w: 2560, h: 1664 },
    { label: 'MacBook Air 15" (2880×1800)', w: 2880, h: 1800 },
    { label: 'Dell XPS 15 (3840×2400)', w: 3840, h: 2400 },
    { label: 'Dell XPS 13 FHD (1920×1080)', w: 1920, h: 1080 },
    { label: 'Surface Laptop 5 (2256×1504)', w: 2256, h: 1504 },
    { label: 'ThinkPad X1 Carbon (2560×1600)', w: 2560, h: 1600 },
  ],
  monitors: [
    { label: 'Desktop FHD (1920×1080)', w: 1920, h: 1080 },
    { label: 'Desktop QHD (2560×1440)', w: 2560, h: 1440 },
    { label: 'Desktop 4K (3840×2160)', w: 3840, h: 2160 },
    { label: 'Desktop 5K (5120×2880)', w: 5120, h: 2880 },
    { label: 'Ultrawide 21:9 (3440×1440)', w: 3440, h: 1440 },
    { label: 'Super Ultrawide 32:9 (5120×1440)', w: 5120, h: 1440 },
    { label: 'Dual Monitor Setup (3840×1080)', w: 3840, h: 1080 },
    { label: 'Triple Monitor Setup (5760×1080)', w: 5760, h: 1080 },
  ],
};

export default function Calculator({ onCalculate, initialWidth = 1920, initialHeight = 1080 }) {
  const { addEntry } = useHistory();

  const [width, setWidth] = useState(initialWidth);
  const [height, setHeight] = useState(initialHeight);
  const [diagonal, setDiagonal] = useState('');
  const [dpi, setDpi] = useState('');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [densityDisplay, setDensityDisplay] = useState('--');
  const [results, setResults] = useState([]);
  const [customPercent, setCustomPercent] = useState(30);
  const [percentResult, setPercentResult] = useState(null);
  const [reverseWidth, setReverseWidth] = useState('');
  const [reverseHeight, setReverseHeight] = useState('');
  const [reverseResult, setReverseResult] = useState(null);
  const [openDropdowns, setOpenDropdowns] = useState(new Set());
  const [customW, setCustomW] = useState('');
  const [customH, setCustomH] = useState('');

  useEffect(() => {
    if (!width || !height) return setAspectRatio('--');
    setAspectRatio(getAspectRatio(width, height));
  }, [width, height]);

  useEffect(() => {
    const w = Number(width);
    const h = Number(height);
    const diag = parseFloat(diagonal);
    const dpiVal = parseFloat(dpi);
    if (diag && w && h) {
      const ppi = Math.round(Math.sqrt(w * w + h * h) / diag);
      setDensityDisplay(ppi + ' PPI');
      if (!dpiVal) setDpi(ppi.toString());
    } else if (dpiVal && w && h) {
      setDensityDisplay(Math.round(dpiVal * w / 1080) + ' DPI');
    } else {
      setDensityDisplay('--');
    }
  }, [width, height, diagonal, dpi]);

  const toggleDropdown = (id) => {
    setOpenDropdowns(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const loadPreset = (e) => {
    if (!e.target.value) return;
    const [w, h] = e.target.value.split(',').map(Number);
    setWidth(w);
    setHeight(h);
  };

  const calculate = () => {
    const w = Number(width);
    const h = Number(height);
    if (!w || !h) return alert('Enter valid width and height');
    addEntry({ width: w, height: h });
    if (onCalculate) onCalculate(w, h);
    const aspect = w / h;
    const percents = [
      { name: '75% Smaller', percent: -75 },
      { name: '50% Smaller', percent: -50 },
      { name: '25% Smaller', percent: -25 },
      { name: 'Current', percent: 0 },
      { name: '25% Larger', percent: 25 },
      { name: '50% Larger', percent: 50 },
      { name: '100% Larger', percent: 100 },
      { name: '200% Larger', percent: 200 },
    ];
    setResults(percents.map(({ name, percent }) => {
      const nw = Math.round(w * (1 + percent / 100));
      const nh = Math.round(nw / aspect);
      return {
        name,
        width: nw,
        height: nh,
        megapixels: ((nw * nh) / 1000000).toFixed(2),
        aspectRatio: getAspectRatio(nw, nh),
        percent,
      };
    }));
  };

  const applyPercentage = (add) => {
    const w = Number(width), h = Number(height), pct = Number(customPercent);
    if (!w || !h || isNaN(pct)) return alert('Enter valid values');
    const m = add ? 1 + pct / 100 : 1 - pct / 100;
    const nw = Math.round(w * m), nh = Math.round(h * m);
    setPercentResult(`<strong>${add ? 'Added' : 'Subtracted'} ${pct}%</strong><br>New Resolution: ${nw} × ${nh}<br>Aspect Ratio: ${getAspectRatio(nw, nh)}`);
  };

  const reverseCalculate = () => {
    const ow = Number(width), oh = Number(height);
    const nw = parseInt(reverseWidth), nh = parseInt(reverseHeight);
    if (!ow || !oh || !nw || !nh) return alert('Enter valid values in all fields');
    const wp = ((nw - ow) / ow * 100).toFixed(2);
    const hp = ((nh - oh) / oh * 100).toFixed(2);
    const diff = Math.abs(parseFloat(wp) - parseFloat(hp));
    const ok = diff < 0.1;
    setReverseResult({
      className: ok ? 'info-box' : 'warning-box',
      html: `<strong>Percentage Change:</strong><br>Width: ${wp > 0 ? '+' : ''}${wp}%<br>Height: ${hp > 0 ? '+' : ''}${hp}%<br>${ok ? '<br>✓ Proportional!' : '<br>⚠ Aspect ratio changed!'}`
    });
  };

  return (
    <div>
      <div className="card">
        <h2 style={{ color: 'var(--primary-purple)' }}>Current Resolution</h2>
        <div className="input-row">
          <label>Width:</label>
          <input type="number" value={width} onChange={e => setWidth(e.target.value)} />
          <label>Height:</label>
          <input type="number" value={height} onChange={e => setHeight(e.target.value)} />
          <div className="aspect-display">{aspectRatio}</div>
        </div>
        <div className="input-row">
          <label>Diagonal (in):</label>
          <input type="number" value={diagonal} onChange={e => setDiagonal(e.target.value)} placeholder="Optional" step="0.1" />
          <label>DPI/PPI:</label>
          <input type="number" value={dpi} onChange={e => setDpi(e.target.value)} placeholder="Optional" step="1" />
          <div className="aspect-display">{densityDisplay}</div>
        </div>
        <button onClick={calculate}>Calculate All Resolutions</button>

        <div className="dropdown-section">
          <div className="dropdown-header" onClick={() => toggleDropdown('presets')}>
            <span style={{ color: 'var(--light-purple)' }}>📐 Load Resolution Preset</span>
            <span className={`arrow ${openDropdowns.has('presets') ? 'open' : ''}`}>▼</span>
          </div>
          {openDropdowns.has('presets') && (
            <div className="dropdown-content active">
              {Object.entries(PRESETS).map(([cat, items]) => (
                <div className="device-category" key={cat}>
                  <h4>{cat === 'standard' ? 'Standard' : cat === 'phones' ? '📱 Phones' : cat === 'tablets' ? '📱 Tablets' : cat === 'laptops' ? '💻 Laptops' : '🖥️ Monitors'}</h4>
                  <select onChange={loadPreset}>
                    <option value="">-- Select --</option>
                    {items.map(p => <option key={p.label} value={`${p.w},${p.h}`}>{p.label}</option>)}
                  </select>
                </div>
              ))}
              <div className="custom-device">
                <h4>✏️ Custom Device</h4>
                <label>Width:</label>
                <input type="number" value={customW} onChange={e => setCustomW(e.target.value)} placeholder="Width" style={{ width: '100%', marginBottom: '0.5rem' }} />
                <label>Height:</label>
                <input type="number" value={customH} onChange={e => setCustomH(e.target.value)} placeholder="Height" style={{ width: '100%', marginBottom: '0.5rem' }} />
                <button className="secondary" onClick={() => { if (customW && customH) { setWidth(Number(customW)); setHeight(Number(customH)); } }}>Load Custom</button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <h2 style={{ color: 'var(--accent-red)' }}>Custom Percentage Calculator</h2>
        <label>Percentage:</label>
        <input type="number" value={customPercent} onChange={e => setCustomPercent(e.target.value)} step="0.1" style={{ width: '100%', marginBottom: '1rem' }} />
        <div className="button-group">
          <button className="secondary" onClick={() => applyPercentage(true)}>Add Percentage</button>
          <button className="danger" onClick={() => applyPercentage(false)}>Subtract Percentage</button>
        </div>
        {percentResult && <div className="info-box" dangerouslySetInnerHTML={{ __html: percentResult }} />}

        <div className="dropdown-section">
          <div className="dropdown-header" onClick={() => toggleDropdown('reverse')}>
            <span style={{ color: 'var(--accent-red)' }}>🔄 Find Percentage Difference</span>
            <span className={`arrow ${openDropdowns.has('reverse') ? 'open' : ''}`}>▼</span>
          </div>
          {openDropdowns.has('reverse') && (
            <div className="dropdown-content active">
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Enter new resolution:</p>
              <label>New Width:</label>
              <input type="number" value={reverseWidth} onChange={e => setReverseWidth(e.target.value)} style={{ width: '100%', marginBottom: '1rem' }} />
              <label>New Height:</label>
              <input type="number" value={reverseHeight} onChange={e => setReverseHeight(e.target.value)} style={{ width: '100%', marginBottom: '1rem' }} />
              <button onClick={reverseCalculate}>Calculate Difference</button>
              {reverseResult && <div className={reverseResult.className} style={{ marginTop: '1rem' }} dangerouslySetInnerHTML={{ __html: reverseResult.html }} />}
            </div>
          )}
        </div>
      </div>

      {results.length > 0 && (
        <div className="card">
          <h2 style={{ color: 'var(--primary-purple)' }}>Calculated Resolutions</h2>
          <div className="result-grid">
            {results.map((r, i) => (
              <div key={i} className="result-card">
                <div className="result-title">{r.name}</div>
                <div className="result-res">{r.width} × {r.height}</div>
                <div className="result-details">
                  {r.percent !== 0 ? (r.percent > 0 ? '+' : '') + r.percent + '%' : 'Original'}<br />
                  {r.megapixels} MP | {r.aspectRatio}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
