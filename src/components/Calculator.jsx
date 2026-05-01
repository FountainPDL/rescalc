import { useState, useEffect, useCallback } from 'react';
import { useHistory } from '../hooks/useHistory';

// ---------- Utility functions (unchanged from original) ----------
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

function getAspectColor(ratio) {
  if (ratio.includes('16:9')) return '#2563EB';
  if (ratio.includes('20:9')) return '#7C3AED';
  if (ratio.includes('19.5')) return '#9333EA';
  if (ratio.includes('21:9')) return '#DC2626';
  if (ratio.includes('4:3')) return '#059669';
  return '#6B46C1';
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

// ---------- Component ----------
export default function Calculator({ onCalculate, initialWidth = 1920, initialHeight = 1080 }) {
  const { addEntry } = useHistory();

  // Main resolution inputs
  const [width, setWidth] = useState(initialWidth);
  const [height, setHeight] = useState(initialHeight);
  const [diagonal, setDiagonal] = useState('');
  const [dpi, setDpi] = useState('');

  // Calculated displays
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [densityDisplay, setDensityDisplay] = useState('--');
  const [results, setResults] = useState([]);

  // Custom percentage
  const [customPercent, setCustomPercent] = useState(30);
  const [percentResult, setPercentResult] = useState(null);

  // Reverse calculator
  const [reverseWidth, setReverseWidth] = useState('');
  const [reverseHeight, setReverseHeight] = useState('');
  const [reverseResult, setReverseResult] = useState(null);

  // Dropdown open states
  const [openDropdowns, setOpenDropdowns] = useState(new Set());

  // Update aspect ratio & density whenever relevant inputs change
  useEffect(() => {
    const w = Number(width);
    const h = Number(height);
    if (!w || !h) {
      setAspectRatio('--');
    } else {
      const ratio = getAspectRatio(w, h);
      setAspectRatio(ratio);
      document.getElementById('aspectBadge').style.background = getAspectColor(ratio);
    }
  }, [width, height]);

  useEffect(() => {
    const w = Number(width);
    const h = Number(height);
    const diag = parseFloat(diagonal);
    const dpiVal = parseFloat(dpi);

    if (diag && w && h) {
      const diagPixels = Math.sqrt(w * w + h * h);
      const ppi = Math.round(diagPixels / diag);
      setDensityDisplay(`${ppi} PPI`);
      if (!dpiVal) setDpi(ppi.toString());
    } else if (dpiVal && w && h) {
      const scaleFactor = w / 1080;
      const scaledDpi = Math.round(dpiVal * scaleFactor);
      setDensityDisplay(`${scaledDpi} DPI`);
    } else {
      setDensityDisplay('--');
    }
  }, [width, height, diagonal, dpi]);

  // Toggle dropdown
  const toggleDropdown = (id) => {
    setOpenDropdowns(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Load preset from any select
  const loadPreset = (e) => {
    const val = e.target.value;
    if (!val) return;
    const [w, h] = val.split(',').map(Number);
    setWidth(w);
    setHeight(h);
  };

  // Custom device
  const loadCustomDevice = () => {
    const w = parseInt(document.getElementById('customWidth').value);
    const h = parseInt(document.getElementById('customHeight').value);
    if (w && h) {
      setWidth(w);
      setHeight(h);
    } else {
      alert('Enter valid width and height');
    }
  };

  // Main calculate
  const calculate = () => {
    const w = Number(width);
    const h = Number(height);
    if (!w || !h) {
      alert('Please enter valid width and height');
      return;
    }

// addToHistory({ width: w, height: h });

// With:
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

    const calcs = percents.map(({ name, percent }) => {
      const nw = Math.round(w * (1 + percent / 100));
      const nh = Math.round(nw / aspect);
      const megapixels = ((nw * nh) / 1_000_000).toFixed(2);
      let dpiText = '';
      if (dpi) {
        const scaled = Math.round(Number(dpi) * (1 + percent / 100));
        dpiText = `<br>${scaled} DPI`;
      }
      return {
        name,
        width: nw,
        height: nh,
        megapixels,
        aspectRatio: getAspectRatio(nw, nh),
        dpiText,
        percent,
      };
    });

    setResults(calcs);
  };

  // Custom percentage add/subtract
  const applyPercentage = (add) => {
    const w = Number(width);
    const h = Number(height);
    const pct = Number(customPercent);

    if (!w || !h || isNaN(pct)) {
      alert('Please enter valid values');
      return;
    }

    const multiplier = add ? 1 + pct / 100 : 1 - pct / 100;
    const nw = Math.round(w * multiplier);
    const nh = Math.round(h * multiplier);
    let dpiText = '';
    if (dpi) {
      const scaledDpi = Math.round(Number(dpi) * multiplier);
      dpiText = `<br>Scaled DPI: ${scaledDpi}`;
    }

    setPercentResult({
      type: 'info-box',
      html: `<strong>${add ? 'Added' : 'Subtracted'} ${pct}%</strong><br>
             New Resolution: ${nw} × ${nh}<br>
             Aspect Ratio: ${getAspectRatio(nw, nh)}${dpiText}`,
    });
  };

  // Reverse calculate
  const reverseCalculate = () => {
    const origW = Number(width);
    const origH = Number(height);
    const newW = parseInt(reverseWidth);
    const newH = parseInt(reverseHeight);

    if (!origW || !origH || !newW || !newH) {
      alert('Enter valid values in all fields');
      return;
    }

    const widthPercent = ((newW - origW) / origW * 100).toFixed(2);
    const heightPercent = ((newH - origH) / origH * 100).toFixed(2);
    const diff = Math.abs(parseFloat(widthPercent) - parseFloat(heightPercent));
    const isProportional = diff < 0.1;

    setReverseResult({
      type: isProportional ? 'info-box' : 'warning-box',
      html: `<strong>Percentage Change:</strong><br>
             Width: ${widthPercent > 0 ? '+' : ''}${widthPercent}%<br>
             Height: ${heightPercent > 0 ? '+' : ''}${heightPercent}%<br>
             ${isProportional
                ? '<br>✓ Proportional scaling maintained!'
                : '<br>⚠ Warning: Aspect ratio changed!'}`,
    });
  };

  // Clear custom results when inputs change
  useEffect(() => {
    setPercentResult(null);
    setReverseResult(null);
    setResults([]);
  }, [width, height, diagonal, dpi]);

  return (
    <div>
      {/* Main Input Card */}
      <div className="card">
        <h2 style={{ color: 'var(--primary-purple)' }}>Current Resolution</h2>
        <div className="input-row">
          <label>Width:</label>
          <input type="number" value={width} onChange={e => setWidth(e.target.value)} />
          <label>Height:</label>
          <input type="number" value={height} onChange={e => setHeight(e.target.value)} />
          <div id="aspectBadge" className="aspect-display">{aspectRatio}</div>
        </div>
        <div className="input-row">
          <label>Screen Diagonal (inches):</label>
          <input type="number" value={diagonal} onChange={e => setDiagonal(e.target.value)} placeholder="Optional" step="0.1" />
          <label>DPI/PPI:</label>
          <input type="number" value={dpi} onChange={e => setDpi(e.target.value)} placeholder="Optional" step="1" />
          <div className="aspect-display">{densityDisplay}</div>
        </div>
        <button onClick={calculate}>Calculate All Resolutions</button>

        {/* Presets Dropdown */}
        <div className="dropdown-section">
          <div className="dropdown-header" onClick={() => toggleDropdown('presets')}>
            <span style={{ color: 'var(--light-purple)' }}>📐 Load Resolution Preset</span>
            <span className={`arrow ${openDropdowns.has('presets') ? 'open' : ''}`}>▼</span>
          </div>
          {openDropdowns.has('presets') && (
            <div className="dropdown-content active">
              {/* Standard */}
              <div className="device-category">
                <h4>Standard Resolutions</h4>
                <select onChange={loadPreset}>
                  <option value="">-- Select Resolution --</option>
                  {PRESETS.standard.map(p => (
                    <option key={p.label} value={`${p.w},${p.h}`}>{p.label}</option>
                  ))}
                </select>
              </div>
              {/* Phones */}
              <div className="device-category">
                <h4>📱 Phones</h4>
                <select onChange={loadPreset}>
                  <option value="">-- Select Phone --</option>
                  {PRESETS.phones.map(p => (
                    <option key={p.label} value={`${p.w},${p.h}`}>{p.label}</option>
                  ))}
                </select>
              </div>
              {/* Tablets */}
              <div className="device-category">
                <h4>📱 Tablets</h4>
                <select onChange={loadPreset}>
                  <option value="">-- Select Tablet --</option>
                  {PRESETS.tablets.map(p => (
                    <option key={p.label} value={`${p.w},${p.h}`}>{p.label}</option>
                  ))}
                </select>
              </div>
              {/* Laptops */}
              <div className="device-category">
                <h4>💻 Laptops</h4>
                <select onChange={loadPreset}>
                  <option value="">-- Select Laptop --</option>
                  {PRESETS.laptops.map(p => (
                    <option key={p.label} value={`${p.w},${p.h}`}>{p.label}</option>
                  ))}
                </select>
              </div>
              {/* Monitors */}
              <div className="device-category">
                <h4>🖥️ Monitors & Displays</h4>
                <select onChange={loadPreset}>
                  <option value="">-- Select Monitor --</option>
                  {PRESETS.monitors.map(p => (
                    <option key={p.label} value={`${p.w},${p.h}`}>{p.label}</option>
                  ))}
                </select>
              </div>
              {/* Custom device */}
              <div className="custom-device">
                <h4>✏️ Custom Device</h4>
                <div className="device-category">
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>Width:</label>
                  <input id="customWidth" type="number" placeholder="Enter width" style={{ width: '100%', marginBottom: '1rem' }} />
                </div>
                <div className="device-category">
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>Height:</label>
                  <input id="customHeight" type="number" placeholder="Enter height" style={{ width: '100%', marginBottom: '1rem' }} />
                </div>
                <button className="secondary" onClick={loadCustomDevice}>Load Custom Resolution</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Custom Percentage Card */}
      <div className="card">
        <h2 style={{ color: 'var(--accent-red)' }}>Custom Percentage Calculator</h2>
        <div className="device-category">
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Percentage:</label>
          <input
            type="number"
            value={customPercent}
            onChange={e => setCustomPercent(e.target.value)}
            step="0.1"
            style={{ width: '100%', marginBottom: '1rem' }}
          />
        </div>
        <div className="button-group">
          <button className="secondary" onClick={() => applyPercentage(true)}>Add Percentage</button>
          <button className="danger" onClick={() => applyPercentage(false)}>Subtract Percentage</button>
        </div>
        {percentResult && (
          <div className={percentResult.type} dangerouslySetInnerHTML={{ __html: percentResult.html }} />
        )}

        {/* Reverse Calculator Dropdown */}
        <div className="dropdown-section">
          <div className="dropdown-header" onClick={() => toggleDropdown('reverse')}>
            <span style={{ color: 'var(--accent-red)' }}>🔄 Find Percentage Difference</span>
            <span className={`arrow ${openDropdowns.has('reverse') ? 'open' : ''}`}>▼</span>
          </div>
          {openDropdowns.has('reverse') && (
            <div className="dropdown-content active">
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Enter new resolution to calculate the percentage change:</p>
              <div className="device-category">
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>New Width:</label>
                <input type="number" value={reverseWidth} onChange={e => setReverseWidth(e.target.value)} style={{ width: '100%', marginBottom: '1rem' }} />
              </div>
              <div className="device-category">
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>New Height:</label>
                <input type="number" value={reverseHeight} onChange={e => setReverseHeight(e.target.value)} style={{ width: '100%', marginBottom: '1rem' }} />
              </div>
              <button onClick={reverseCalculate}>Calculate Difference</button>
              {reverseResult && (
                <div className={reverseResult.type} dangerouslySetInnerHTML={{ __html: reverseResult.html }} />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Results Card */}
      {results.length > 0 && (
        <div className="card">
          <h2 style={{ color: 'var(--primary-purple)' }}>Calculated Resolutions</h2>
          <div className="result-grid">
            {results.map((calc, idx) => (
              <div key={idx} className="result-card">
                <div className="result-title">{calc.name}</div>
                <div className="result-res" style={{ fontSize: '1.5em', fontWeight: 700 }}>
                  {calc.width} × {calc.height}
                </div>
                <div className="result-details">
                  {calc.percent !== 0 ? (calc.percent > 0 ? '+' : '') + calc.percent + '%' : 'Original'}<br />
                  {calc.megapixels} MP | {calc.aspectRatio}
                  {calc.dpiText && <span dangerouslySetInnerHTML={{ __html: calc.dpiText }} />}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}