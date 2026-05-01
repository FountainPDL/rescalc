import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const HistoryContext = createContext();

const STORAGE_KEY = 'rescalc_history';
const MAX_ITEMS = 50;

export function HistoryProvider({ children }) {
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
    } catch {
      const pruned = history.slice(0, Math.floor(MAX_ITEMS / 2));
      setHistory(pruned);
    }
  }, [history]);

  const addEntry = useCallback(({ width, height }) => {
    const entry = {
      id: Date.now().toString(),
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

  return (
    <HistoryContext.Provider value={{ history, addEntry, clearHistory, removeEntry }}>
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistory() {
  const ctx = useContext(HistoryContext);
  if (!ctx) throw new Error('useHistory must be used within HistoryProvider');
  return ctx;
}
