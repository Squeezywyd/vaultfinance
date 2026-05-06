import { useState, useEffect, useRef } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import Icon from '../components/CategoryIcon';

// ─── Constants ───────────────────────────────────────────────────────────────
const TYPE_META = {
  stock:   { label: 'Stock',   color: '#6366f1', icon: 'TrendingUp'  },
  etf:     { label: 'ETF',     color: '#06b6d4', icon: 'BarChart2'   },
  crypto:  { label: 'Crypto',  color: '#f59e0b', icon: 'Bitcoin'     },
  futures: { label: 'Futures', color: '#a855f7', icon: 'Activity'    },
  index:   { label: 'Index',   color: '#10b981', icon: 'LineChart'   },
  other:   { label: 'Other',   color: '#64748b', icon: 'Package'     },
};

const RANGES = ['1W', '1M', '3M', '6M', '1Y'];

const TOOLTIP_STYLE = {
  background: 'rgba(8,8,18,0.97)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 10,
  fontSize: 11,
  color: '#e2e8f0',
  boxShadow: '0 8px 32px rgba(0,0,0,0.7)',
  padding: '8px 12px',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmt(n, d = 2)  { if (n == null) return '—'; return n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }); }
function fmtPct(n)       { if (n == null) return '—'; return `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`; }
function fmtCompact(n)   { if (n == null) return '—'; if (Math.abs(n) >= 1000) return `$${(n / 1000).toFixed(1)}k`; return `$${n.toFixed(0)}`; }

// ─── Portfolio Chart ──────────────────────────────────────────────────────────
function PortfolioChart({ data, loading, range, onRangeChange }) {
  const isEmpty  = !data || data.length === 0;
  const isUp     = !isEmpty && data[data.length - 1].value >= data[0].value;
  const lineClr  = isUp ? '#34d399' : '#f43f5e';
  const glowClr  = isUp ? 'rgba(52,211,153,0.15)' : 'rgba(244,63,94,0.15)';

  const startVal  = isEmpty ? 0 : data[0].value;
  const endVal    = isEmpty ? 0 : data[data.length - 1].value;
  const rangePnL  = endVal - startVal;
  const rangePct  = startVal > 0 ? (rangePnL / startVal) * 100 : 0;

  function xLabel(ms) {
    const d = new Date(ms);
    if (range === '1W') return d.toLocaleDateString('en-US', { weekday: 'short' });
    if (range === '1Y' || range === '6M') return d.toLocaleDateString('en-US', { month: 'short' });
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  // Thin out x-axis labels based on range
  const tickCount = range === '1W' ? 5 : range === '1M' ? 6 : range === '3M' ? 6 : 6;

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    const change = d.value - startVal;
    const pct    = startVal > 0 ? (change / startVal) * 100 : 0;
    return (
      <div style={TOOLTIP_STYLE}>
        <p className="text-slate-400 text-[10px] mb-1">
          {new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </p>
        <p className="font-bold font-mono text-slate-100">${fmt(d.value)}</p>
        <p className={`text-[10px] font-semibold mt-0.5 ${change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
          {change >= 0 ? '+' : ''}${fmt(Math.abs(change))} ({fmtPct(pct)})
        </p>
      </div>
    );
  };

  return (
    <div>
      {/* Range selector */}
      <div className="flex items-center justify-between px-4 mb-3">
        <div>
          {!isEmpty && (
            <p className={`text-sm font-bold font-mono ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
              {rangePnL >= 0 ? '+' : ''}${fmt(Math.abs(rangePnL), 0)}
              <span className="text-xs ml-1.5 opacity-75">({fmtPct(rangePct)})</span>
            </p>
          )}
          <p className="text-[9px] text-slate-600 uppercase tracking-widest mt-0.5">{range} period</p>
        </div>
        <div className="flex gap-1">
          {RANGES.map(r => (
            <button
              key={r}
              onClick={() => onRangeChange(r)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all duration-150 ${
                range === r
                  ? 'text-white'
                  : 'text-slate-600 hover:text-slate-400'
              }`}
              style={range === r ? { background: lineClr + '28', color: lineClr } : {}}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="w-5 h-5 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          </div>
        )}

        {isEmpty && !loading ? (
          <div className="h-44 flex flex-col items-center justify-center gap-2">
            <Icon name="LineChart" size={24} strokeWidth={1.5} className="text-slate-700" />
            <p className="text-xs text-slate-600">No history data — tap refresh</p>
          </div>
        ) : (
          <div style={{ opacity: loading ? 0.3 : 1, transition: 'opacity 0.3s' }}>
            {/* Glow behind chart */}
            <div className="absolute inset-x-0 bottom-8 h-20 pointer-events-none"
              style={{ background: `radial-gradient(ellipse at 50% 100%, ${glowClr} 0%, transparent 70%)` }} />

            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor={lineClr} stopOpacity={0.25} />
                    <stop offset="60%"  stopColor={lineClr} stopOpacity={0.06} />
                    <stop offset="100%" stopColor={lineClr} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  tickFormatter={xLabel}
                  tick={{ fontSize: 9, fill: '#334155', fontWeight: 600, letterSpacing: '0.05em' }}
                  axisLine={false} tickLine={false}
                  interval="preserveStartEnd"
                  tickCount={tickCount}
                />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip content={<CustomTooltip />} wrapperStyle={{ outline: 'none' }} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={lineClr}
                  strokeWidth={1.75}
                  fill="url(#areaGrad)"
                  dot={false}
                  activeDot={{ r: 4, fill: lineClr, stroke: 'rgba(0,0,0,0.5)', strokeWidth: 1.5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Daily P&L card row ───────────────────────────────────────────────────────
function StatRow({ portfolioValue, portfolioCost, portfolioPnL, portfolioPnLPct, dailyPnL, dailyPnLPct }) {
  const stats = [
    {
      label: 'Daily P&L',
      value: dailyPnL != null ? `${dailyPnL >= 0 ? '+' : ''}$${fmt(Math.abs(dailyPnL), 0)}` : '—',
      sub:   dailyPnLPct != null ? fmtPct(dailyPnLPct) : '',
      color: dailyPnL >= 0 ? '#34d399' : '#f43f5e',
    },
    {
      label: 'Total P&L',
      value: portfolioPnL != null ? `${portfolioPnL >= 0 ? '+' : ''}$${fmt(Math.abs(portfolioPnL), 0)}` : '—',
      sub:   portfolioPnLPct != null ? fmtPct(portfolioPnLPct) : '',
      color: portfolioPnL >= 0 ? '#34d399' : '#f43f5e',
    },
    {
      label: 'Cost Basis',
      value: `$${fmt(portfolioCost, 0)}`,
      sub:   `${portfolioRows?.length ?? 0} positions`,
      color: '#64748b',
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2 px-4">
      {stats.map(s => (
        <div key={s.label} className="card p-3">
          <p className="stat-label mb-1.5">{s.label}</p>
          <p className="text-sm font-bold font-mono" style={{ color: s.color }}>{s.value}</p>
          {s.sub && <p className="text-[9px] text-slate-600 mt-0.5 font-mono">{s.sub}</p>}
        </div>
      ))}
    </div>
  );
}

// ─── Allocation donut ─────────────────────────────────────────────────────────
function AllocationChart({ portfolioRows, portfolioValue }) {
  const data = portfolioRows
    .filter(r => r.currentValue != null && r.currentValue > 0)
    .map(r => ({ name: r.symbol, value: r.currentValue, color: (TYPE_META[r.type] ?? TYPE_META.other).color }));

  if (data.length === 0) return null;

  return (
    <div className="card p-4 mx-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">Allocation</p>
      <div className="flex items-center gap-4">
        <ResponsiveContainer width={130} height={130}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%"
              innerRadius={36} outerRadius={58} paddingAngle={2} strokeWidth={0}>
              {data.map((d, i) => (
                <Cell key={i} fill={d.color} style={{ filter: `drop-shadow(0 0 3px ${d.color}50)` }} />
              ))}
            </Pie>
            <Tooltip contentStyle={TOOLTIP_STYLE} formatter={v => [`$${fmt(v, 0)}`, '']} wrapperStyle={{ outline: 'none' }} />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex-1 space-y-1.5">
          {data.map(d => {
            const pct = portfolioValue > 0 ? (d.value / portfolioValue) * 100 : 0;
            return (
              <div key={d.name}>
                <div className="flex justify-between items-center mb-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                    <span className="text-[10px] font-mono text-slate-400">{d.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">{pct.toFixed(0)}%</span>
                </div>
                <div className="h-0.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: d.color }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Symbol search ────────────────────────────────────────────────────────────
function SymbolSearch({ onAdd, searchSymbol, onClose }) {
  const [query,   setQuery]   = useState('');
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [qty,     setQty]     = useState('');
  const [cost,    setCost]    = useState('');
  const debounce = useRef();

  function triggerSearch(sym) {
    setResult(null); setError(null);
    if (!sym || sym.length < 1) return;
    clearTimeout(debounce.current);
    debounce.current = setTimeout(async () => {
      setLoading(true);
      try {
        const d = await searchSymbol(sym.toUpperCase());
        setResult(d);
        if (!cost && d.price) setCost(d.price.toFixed(2));
      } catch (e) { setError(e.message); }
      finally { setLoading(false); }
    }, 600);
  }

  function handleAdd() {
    if (!result || !qty) return;
    onAdd({ symbol: result.symbol, name: result.name, type: result.type || 'stock',
      quantity: parseFloat(qty), avgCost: parseFloat(cost) || result.price });
    onClose();
  }

  const meta = TYPE_META[result?.type] ?? TYPE_META.other;

  return (
    <div className="card p-4 mx-4 animate-fade-up">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Add Holding</p>
        <button onClick={onClose} className="text-slate-600 hover:text-slate-300">
          <Icon name="X" size={14} strokeWidth={2} />
        </button>
      </div>

      <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl mb-3"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <Icon name="Search" size={13} strokeWidth={2} className="text-slate-500 flex-shrink-0" />
        <input
          autoFocus type="text" placeholder="Ticker  (AAPL · BTC-USD · MNQ=F · QQQ)"
          value={query}
          onChange={e => { setQuery(e.target.value); triggerSearch(e.target.value); }}
          className="bg-transparent text-sm text-slate-200 placeholder-slate-600 outline-none flex-1 uppercase font-mono"
        />
        {loading && <div className="w-3 h-3 border border-indigo-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />}
      </div>

      {error && <p className="text-xs text-rose-400 flex items-center gap-1.5 mb-2"><Icon name="AlertCircle" size={11} strokeWidth={2} />{error}</p>}

      {result?.valid && (
        <div className="rounded-xl p-3 mb-3"
          style={{ background: `${meta.color}0e`, border: `1px solid ${meta.color}22` }}>
          <div className="flex justify-between items-start mb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold font-mono text-slate-100">{result.symbol}</span>
                <span className="text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full"
                  style={{ background: meta.color + '20', color: meta.color }}>{meta.label}</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[160px]">{result.name}</p>
            </div>
            <div className="text-right">
              <p className="text-base font-bold font-mono text-slate-100">${fmt(result.price)}</p>
              <p className={`text-xs font-semibold ${result.changePct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {fmtPct(result.changePct)} today
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <input type="number" placeholder="Quantity" min="0" step="any"
              value={qty} onChange={e => setQty(e.target.value)}
              className="input-field py-2 text-xs flex-1" />
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 text-xs">$</span>
              <input type="number" placeholder="Avg cost" min="0" step="any"
                value={cost} onChange={e => setCost(e.target.value)}
                className="input-field py-2 text-xs pl-6 w-full" />
            </div>
            <button onClick={handleAdd} disabled={!qty}
              className="px-3 py-2 rounded-xl text-xs font-bold text-white disabled:opacity-40 active:scale-95 transition-transform"
              style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 0 12px rgba(99,102,241,0.3)' }}>
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Holding row ──────────────────────────────────────────────────────────────
function HoldingRow({ row, onUpdate, onDelete }) {
  const [editing,   setEditing]   = useState(false);
  const [draftQty,  setDraftQty]  = useState('');
  const [draftCost, setDraftCost] = useState('');
  const meta    = TYPE_META[row.type] ?? TYPE_META.other;
  const pnlPos  = (row.pnl ?? 0) >= 0;
  const dayPos  = (row.dayChange ?? 0) >= 0;

  function startEdit() { setDraftQty(String(row.quantity)); setDraftCost(String(row.avgCost)); setEditing(true); }
  function commitEdit() {
    const q = parseFloat(draftQty); const c = parseFloat(draftCost);
    if (!isNaN(q) && q > 0 && !isNaN(c) && c > 0) onUpdate(row.id, { quantity: q, avgCost: c });
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-bold font-mono text-slate-300 flex-1">{row.symbol}</span>
          <button onClick={commitEdit} className="text-emerald-400 p-1"><Icon name="CheckCircle2" size={15} strokeWidth={2} /></button>
          <button onClick={() => setEditing(false)} className="text-slate-500 p-1"><Icon name="X" size={13} strokeWidth={2} /></button>
        </div>
        <div className="flex gap-2 mb-2">
          <input type="number" placeholder="Qty" value={draftQty} onChange={e => setDraftQty(e.target.value)}
            className="input-field py-2 text-xs flex-1" />
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 text-xs">$</span>
            <input type="number" placeholder="Avg cost" value={draftCost} onChange={e => setDraftCost(e.target.value)}
              className="input-field py-2 text-xs pl-6 w-full" />
          </div>
        </div>
        <button onClick={() => { if (window.confirm(`Remove ${row.symbol}?`)) onDelete(row.id); }}
          className="text-[10px] text-rose-400 flex items-center gap-1">
          <Icon name="Trash2" size={10} strokeWidth={2} /> Remove
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 py-3.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: meta.color + '15', border: `1px solid ${meta.color}28` }}>
          <Icon name={meta.icon} size={16} strokeWidth={1.75} style={{ color: meta.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold font-mono text-slate-100">{row.symbol}</span>
            <span className="text-[7px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full"
              style={{ background: meta.color + '15', color: meta.color }}>{meta.label}</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">
            {row.quantity % 1 === 0 ? row.quantity : row.quantity.toFixed(4)} @ ${fmt(row.avgCost)}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-sm font-bold font-mono text-slate-100">
            {row.currentPrice != null ? `$${fmt(row.currentPrice)}` : '—'}
          </p>
          {row.dayChange != null && (
            <p className={`text-[10px] font-semibold ${dayPos ? 'text-emerald-400' : 'text-rose-400'}`}>
              {fmtPct(row.dayChange)}
            </p>
          )}
        </div>
        <button onClick={startEdit}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-700 hover:text-slate-400 hover:bg-white/5 transition-colors flex-shrink-0">
          <Icon name="SlidersHorizontal" size={12} strokeWidth={2} />
        </button>
      </div>

      {/* Sub-row: value + pnl */}
      <div className="flex gap-5 mt-2 pl-[52px]">
        {row.currentValue != null && (
          <>
            <div>
              <p className="text-[8px] text-slate-700 uppercase tracking-wider">Value</p>
              <p className="text-xs font-mono text-slate-300">${fmt(row.currentValue, 0)}</p>
            </div>
            <div>
              <p className="text-[8px] text-slate-700 uppercase tracking-wider">P&L</p>
              <p className={`text-xs font-mono font-semibold ${pnlPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                {(row.pnl ?? 0) >= 0 ? '+' : ''}${fmt(Math.abs(row.pnl ?? 0), 0)}
                <span className="text-[9px] ml-1 opacity-75">({fmtPct(row.pnlPct)})</span>
              </p>
            </div>
            {row.dayChangeDol != null && (
              <div>
                <p className="text-[8px] text-slate-700 uppercase tracking-wider">Today</p>
                <p className={`text-xs font-mono font-semibold ${row.dayChangeDol >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {row.dayChangeDol >= 0 ? '+' : ''}${fmt(Math.abs(row.dayChangeDol), 0)}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
// Store portfolioRows in module scope so StatRow can access it (workaround for closure)
let portfolioRows = [];

export default function Investments(props) {
  const {
    holdings, prices, pricesLoading, pricesError, lastUpdated,
    historyLoading, historyError, historyRange,
    portfolioRows: rows, portfolioValue, portfolioCost, portfolioPnL, portfolioPnLPct,
    dailyPnL, dailyPnLPct,
    portfolioHistory,
    addHolding, updateHolding, deleteHolding,
    refreshPrices, changeRange, searchSymbol,
  } = props;

  portfolioRows = rows;

  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    refreshPrices();
    changeRange('1M');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const isUp     = portfolioPnL >= 0;
  const hasValue = portfolioValue > 0;

  const groupOrder = ['stock', 'etf', 'crypto', 'futures', 'index', 'other'];
  const grouped = groupOrder
    .map(type => ({ type, rows: rows.filter(r => r.type === type) }))
    .filter(g => g.rows.length > 0);

  const tsLabel = lastUpdated
    ? new Date(lastUpdated).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <div className="min-h-full pb-8">

      {/* ── Hero header ── */}
      <div className="relative px-4 pt-14 pb-0">
        {/* Glow orb */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-72 h-28 rounded-full blur-3xl pointer-events-none"
          style={{ background: `radial-gradient(ellipse, ${isUp ? 'rgba(52,211,153,0.12)' : 'rgba(244,63,94,0.12)'} 0%, transparent 70%)` }} />

        <div className="relative">
          {/* Top row */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="stat-label mb-1.5">Portfolio Value</p>
              {/* Big number */}
              <div className="flex items-baseline gap-1">
                <span className="text-slate-500 text-xl font-light">$</span>
                <span className="text-5xl font-bold font-mono text-slate-50 tracking-tight leading-none">
                  {hasValue ? fmt(portfolioValue, 0) : '—'}
                </span>
              </div>
              {/* All-time P&L */}
              {hasValue && (
                <div className="flex items-center gap-2 mt-2">
                  <div className={`flex items-center gap-1 text-sm font-bold font-mono ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                    <Icon name={isUp ? 'TrendingUp' : 'TrendingDown'} size={14} strokeWidth={2.5} />
                    {isUp ? '+' : ''}${fmt(Math.abs(portfolioPnL), 0)}
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isUp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                    {fmtPct(portfolioPnLPct)} all-time
                  </span>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 mt-1">
              {tsLabel && <p className="text-[9px] text-slate-700">{tsLabel}</p>}
              <button onClick={() => refreshPrices(holdings.map(h => h.symbol))}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <Icon name="RefreshCw" size={14} strokeWidth={2}
                  className={`text-slate-400 ${pricesLoading ? 'animate-spin text-indigo-400' : ''}`} />
              </button>
              <button onClick={() => setShowSearch(v => !v)}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95"
                style={{
                  background: showSearch ? 'rgba(99,102,241,0.18)' : 'rgba(255,255,255,0.05)',
                  border: showSearch ? '1px solid rgba(99,102,241,0.35)' : '1px solid rgba(255,255,255,0.07)',
                }}>
                <Icon name="Plus" size={16} strokeWidth={2.5}
                  className={showSearch ? 'text-indigo-400' : 'text-slate-400'} />
              </button>
            </div>
          </div>

          {/* Daily P&L pills */}
          {hasValue && (
            <div className="flex gap-2 mb-1">
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${dailyPnL >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                <Icon name={dailyPnL >= 0 ? 'ArrowUp' : 'ArrowDown'} size={10} strokeWidth={2.5} />
                {dailyPnL >= 0 ? '+' : ''}${fmt(Math.abs(dailyPnL), 0)} today
                <span className="opacity-70 font-mono text-[10px]">({fmtPct(dailyPnLPct)})</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-slate-500"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <Icon name="Briefcase" size={10} strokeWidth={2} />
                {holdings.length} holdings
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Portfolio chart ── */}
      <div className="card mx-4 mt-4 pt-4 pb-3 overflow-hidden">
        <PortfolioChart
          data={portfolioHistory}
          loading={historyLoading}
          range={historyRange}
          onRangeChange={changeRange}
        />
        {historyError && (
          <p className="text-[10px] text-rose-400 text-center pb-1 flex items-center justify-center gap-1">
            <Icon name="AlertCircle" size={10} strokeWidth={2} /> {historyError}
          </p>
        )}
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-3 gap-2 px-4 mt-3">
        {[
          {
            label: 'Daily P&L',
            value: `${dailyPnL >= 0 ? '+' : ''}$${fmt(Math.abs(dailyPnL), 0)}`,
            sub: fmtPct(dailyPnLPct),
            color: dailyPnL >= 0 ? '#34d399' : '#f43f5e',
          },
          {
            label: 'Total P&L',
            value: `${portfolioPnL >= 0 ? '+' : ''}$${fmt(Math.abs(portfolioPnL), 0)}`,
            sub: fmtPct(portfolioPnLPct),
            color: portfolioPnL >= 0 ? '#34d399' : '#f43f5e',
          },
          {
            label: 'Invested',
            value: `$${fmt(portfolioCost, 0)}`,
            sub: `${holdings.length} positions`,
            color: '#818cf8',
          },
        ].map(s => (
          <div key={s.label} className="card p-3">
            <p className="stat-label mb-1.5">{s.label}</p>
            <p className="text-sm font-bold font-mono leading-tight" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[9px] text-slate-600 mt-0.5 font-mono">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Search ── */}
      {showSearch && (
        <div className="mt-3">
          <SymbolSearch searchSymbol={searchSymbol} onAdd={addHolding} onClose={() => setShowSearch(false)} />
        </div>
      )}

      {/* ── Allocation ── */}
      {rows.some(r => r.currentValue != null) && (
        <div className="mt-3">
          <AllocationChart portfolioRows={rows} portfolioValue={portfolioValue} />
        </div>
      )}

      {/* ── Holdings ── */}
      <div className="px-4 mt-4 space-y-3">
        {holdings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <Icon name="BarChart2" size={22} strokeWidth={1.5} className="text-slate-700" />
            </div>
            <p className="text-sm text-slate-500">No holdings yet</p>
            <button onClick={() => setShowSearch(true)}
              className="text-xs font-semibold text-indigo-400 border border-indigo-500/30 px-4 py-2 rounded-xl">
              + Add first holding
            </button>
          </div>
        ) : (
          grouped.map(({ type, rows: groupRows }) => {
            const meta = TYPE_META[type] ?? TYPE_META.other;
            // Group total value
            const groupValue = groupRows.reduce((s, r) => s + (r.currentValue ?? 0), 0);
            const groupPnL   = groupRows.reduce((s, r) => s + (r.pnl ?? 0), 0);
            return (
              <div key={type} className="animate-fade-up">
                <div className="flex items-center justify-between px-1 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Icon name={meta.icon} size={11} strokeWidth={2} style={{ color: meta.color }} />
                    <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: meta.color }}>
                      {meta.label}s
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {groupValue > 0 && (
                      <span className="text-[10px] font-mono text-slate-500">${fmt(groupValue, 0)}</span>
                    )}
                    {groupPnL !== 0 && (
                      <span className={`text-[10px] font-mono font-semibold ${groupPnL >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {groupPnL >= 0 ? '+' : ''}${fmt(Math.abs(groupPnL), 0)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="rounded-2xl overflow-hidden"
                  style={{ border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
                  {groupRows.map(row => (
                    <HoldingRow key={row.id} row={row} onUpdate={updateHolding} onDelete={deleteHolding} />
                  ))}
                </div>
              </div>
            );
          })
        )}

        <p className="text-center text-[10px] text-slate-800 pt-1">
          Data via Yahoo Finance · refreshes every 5 min
        </p>
      </div>
    </div>
  );
}
