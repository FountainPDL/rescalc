import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'rescalc_history';
const MAX_ITEMS = 100;

function useHistory() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setHistory(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
      console.warn('History storage full, pruning...');
      const pruned = history.slice(0, Math.floor(MAX_ITEMS / 2));
      setHistory(pruned);
    }
  }, [history]);

  const addEntry = useCallback(({ width, height }) => {
    const entry = {
      id: uuidv4(),
      width,
      height,
      timestamp: Date.now(),
      date: new Date().toLocaleString(),
    };
    setHistory(prev => [entry, ...prev].slice(0, MAX_ITEMS));
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const removeEntry = useCallback((id) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  }, []);

  return { history, addEntry, clearHistory, removeEntry };
}

export { useHistory };
export default useHistory;