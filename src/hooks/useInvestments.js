import { useState, useCallback, useMemo } from 'react';

function uuid() {
  return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36);
}
function load(key, fallback) {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback; }
  catch { return fallback; }
}
function save(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

const PRICE_TTL_MS = 5 * 60 * 1000;

function seedInvestments() {
  const holdings = [
    { id: uuid(), symbol: 'AAPL',    name: 'Apple Inc.',              type: 'stock',   quantity: 10,   avgCost: 168.50  },
    { id: uuid(), symbol: 'MSFT',    name: 'Microsoft Corp.',         type: 'stock',   quantity: 5,    avgCost: 375.00  },
    { id: uuid(), symbol: 'NVDA',    name: 'NVIDIA Corp.',            type: 'stock',   quantity: 3,    avgCost: 480.00  },
    { id: uuid(), symbol: 'QQQ',     name: 'Invesco QQQ ETF',         type: 'etf',     quantity: 8,    avgCost: 418.00  },
    { id: uuid(), symbol: 'SPY',     name: 'SPDR S&P 500 ETF',        type: 'etf',     quantity: 4,    avgCost: 487.00  },
    { id: uuid(), symbol: 'BTC-USD', name: 'Bitcoin',                 type: 'crypto',  quantity: 0.12, avgCost: 44000   },
    { id: uuid(), symbol: 'ETH-USD', name: 'Ethereum',                type: 'crypto',  quantity: 1.5,  avgCost: 2600    },
    { id: uuid(), symbol: 'MNQ=F',   name: 'Micro E-mini Nasdaq 100', type: 'futures', quantity: 1,    avgCost: 19800   },
  ];
  save('vault_investments', holdings);
  return holdings;
}

// Build a merged portfolio value time-series from per-symbol histories
function buildPortfolioHistory(historyData, holdings) {
  if (!historyData || holdings.length === 0) return [];

  // Collect every unique timestamp
  const allTs = new Set();
  for (const d of Object.values(historyData)) {
    (d.timestamps ?? []).forEach(ts => allTs.add(ts));
  }
  if (allTs.size === 0) return [];

  const sortedTs = [...allTs].sort((a, b) => a - b);

  // Build timestamp→price maps per symbol
  const priceMaps = {};
  for (const [sym, d] of Object.entries(historyData)) {
    const map = {};
    (d.timestamps ?? []).forEach((ts, i) => {
      if (d.closes[i] != null) map[ts] = d.closes[i];
    });
    priceMaps[sym] = map;
  }

  // Forward-fill missing prices per symbol
  const filled = {};
  for (const sym of Object.keys(priceMaps)) {
    filled[sym] = {};
    let last = null;
    for (const ts of sortedTs) {
      if (priceMaps[sym][ts] != null) last = priceMaps[sym][ts];
      if (last != null) filled[sym][ts] = last;
    }
  }

  // Compute portfolio value at each timestamp
  return sortedTs.map(ts => {
    let value = 0;
    for (const h of holdings) {
      const p = filled[h.symbol]?.[ts] ?? h.avgCost; // fall back to cost
      value += h.quantity * p;
    }
    return {
      ts,
      date: ts * 1000,
      value: Math.round(value * 100) / 100,
    };
  });
}

export function useInvestments() {
  const [holdings, setHoldings] = useState(() => {
    const s = load('vault_investments', null);
    return s === null ? seedInvestments() : s;
  });

  const [prices,        setPrices]        = useState(() => load('vault_prices_cache', {}));
  const [pricesLoading, setPricesLoading] = useState(false);
  const [pricesError,   setPricesError]   = useState(null);
  const [lastUpdated,   setLastUpdated]   = useState(() => load('vault_prices_ts', null));

  const [historyData,    setHistoryData]    = useState({});
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError,   setHistoryError]   = useState(null);
  const [historyRange,   setHistoryRange]   = useState('1M');

  function persistHoldings(next) { setHoldings(next); save('vault_investments', next); }

  const addHolding    = useCallback(h  => persistHoldings(prev => [...prev, { ...h, id: uuid() }]), []);
  const updateHolding = useCallback((id, patch) => persistHoldings(prev => prev.map(h => h.id === id ? { ...h, ...patch } : h)), []);
  const deleteHolding = useCallback(id => persistHoldings(prev => prev.filter(h => h.id !== id)), []);

  const refreshPrices = useCallback(async (forceSymbols) => {
    const syms = forceSymbols ?? holdings.map(h => h.symbol);
    if (syms.length === 0) return;
    if (!forceSymbols && lastUpdated && Date.now() - new Date(lastUpdated).getTime() < PRICE_TTL_MS) return;

    setPricesLoading(true); setPricesError(null);
    try {
      const res = await fetch('/api/prices', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbols: syms }),
      });
      if (!res.ok) throw new Error(`Price API ${res.status}`);
      const data = await res.json();
      const ts = new Date().toISOString();
      setPrices(data); setLastUpdated(ts);
      save('vault_prices_cache', data); save('vault_prices_ts', ts);
    } catch (e) { setPricesError(e.message); }
    finally { setPricesLoading(false); }
  }, [holdings, lastUpdated]);

  const fetchHistory = useCallback(async (range) => {
    const syms = holdings.map(h => h.symbol);
    if (syms.length === 0) return;
    setHistoryLoading(true); setHistoryError(null);
    try {
      const res = await fetch('/api/history', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbols: syms, range }),
      });
      if (!res.ok) throw new Error(`History API ${res.status}`);
      const data = await res.json();
      setHistoryData(data);
    } catch (e) { setHistoryError(e.message); }
    finally { setHistoryLoading(false); }
  }, [holdings]);

  const changeRange = useCallback((range) => {
    setHistoryRange(range);
    fetchHistory(range);
  }, [fetchHistory]);

  const searchSymbol = useCallback(async (symbol) => {
    const res = await fetch(`/api/prices?symbol=${encodeURIComponent(symbol)}`);
    if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || 'Not found'); }
    return res.json();
  }, []);

  // Derived per-holding data
  const portfolioRows = holdings.map(h => {
    const p            = prices[h.symbol];
    const currentPrice = p?.valid ? p.price : null;
    const currentValue = currentPrice != null ? currentPrice * h.quantity : null;
    const costBasis    = h.avgCost * h.quantity;
    const pnl          = currentValue != null ? currentValue - costBasis : null;
    const pnlPct       = pnl != null && costBasis > 0 ? (pnl / costBasis) * 100 : null;
    const dayChange    = p?.valid ? p.changePct : null;
    const dayChangeDol = p?.valid && currentValue != null
      ? (p.change * h.quantity)
      : null;
    return { ...h, currentPrice, currentValue, costBasis, pnl, pnlPct, dayChange, dayChangeDol, priceData: p };
  });

  const knownRows      = portfolioRows.filter(r => r.currentValue != null);
  const portfolioValue = knownRows.reduce((s, r) => s + r.currentValue, 0);
  const portfolioCost  = portfolioRows.reduce((s, r) => s + r.costBasis, 0);
  const portfolioPnL   = knownRows.reduce((s, r) => s + r.pnl, 0);
  const portfolioPnLPct = portfolioCost > 0 ? (portfolioPnL / portfolioCost) * 100 : 0;

  const dailyPnL    = knownRows.reduce((s, r) => s + (r.dayChangeDol ?? 0), 0);
  const dailyPnLPct = portfolioValue > dailyPnL
    ? (dailyPnL / (portfolioValue - dailyPnL)) * 100
    : 0;

  // Portfolio history chart data
  const portfolioHistory = useMemo(
    () => buildPortfolioHistory(historyData, holdings),
    [historyData, holdings]
  );

  return {
    holdings, prices, pricesLoading, pricesError, lastUpdated,
    historyData, historyLoading, historyError, historyRange,
    portfolioRows, portfolioValue, portfolioCost, portfolioPnL, portfolioPnLPct,
    dailyPnL, dailyPnLPct,
    portfolioHistory,
    addHolding, updateHolding, deleteHolding,
    refreshPrices, fetchHistory, changeRange, searchSymbol,
  };
}
