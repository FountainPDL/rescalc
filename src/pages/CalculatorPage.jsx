import { useState, useCallback, useEffect } from 'react';
import Calculator from '../components/Calculator';
import useHistory from '../hooks/useHistory';

export default function CalculatorPage() {
  const { addEntry } = useHistory();
  const [currentRes, setCurrentRes] = useState({ width: 1920, height: 1080 });

  const handleCalculate = useCallback((w, h) => {
    setCurrentRes({ width: w, height: h });
    addEntry({ width: w, height: h, timestamp: Date.now() });
  }, [addEntry]);

  return <Calculator onCalculate={handleCalculate} initialWidth={1920} initialHeight={1080} />;
}