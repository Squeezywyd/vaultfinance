import { useState } from 'react';
import Icon from '../components/CategoryIcon';

function SkeletonCard() {
  return (
    <div className="card p-4 space-y-3">
      <div className="skeleton h-3 w-24 rounded-full" />
      <div className="skeleton h-2.5 w-full rounded-full" />
      <div className="skeleton h-2.5 w-4/5 rounded-full" />
      <div className="skeleton h-2.5 w-3/5 rounded-full" />
    </div>
  );
}

export default function Insights({ thisMonthTxns }) {
  const [loading,  setLoading]  = useState(false);
  const [insights, setInsights] = useState(null);
  const [error,    setError]    = useState(null);

  const month = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const income   = thisMonthTxns.filter(t => t.type === 'income').reduce((s, t)  => s + t.amount, 0);
  const expenses = thisMonthTxns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const saved    = income - expenses;

  async function generate() {
    setLoading(true);
    setError(null);
    setInsights(null);

    const anonymized = thisMonthTxns.map(t => ({
      category: t.category,
      amount:   t.amount,
      type:     t.type,
      date:     t.date.slice(0, 10),
    }));

    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactions: anonymized, month }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Server error ${res.status}`);
      }

      const data = await res.json();
      setInsights(data.text);
    } catch (err) {
      setError(err.message || 'Failed to generate insights. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-full pb-8">
      {/* Header */}
      <div className="px-5 pt-14 pb-5">
        <div className="flex items-center gap-2 mb-1">
          <div
            className="w-5 h-5 rounded-md flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #818cf8, #c084fc)' }}
          >
            <Icon name="Sparkles" size={11} strokeWidth={2} className="text-white" />
          </div>
          <p className="stat-label">AI Insights</p>
        </div>
        <h1 className="text-xl font-bold text-slate-100">Spending Analysis</h1>
        <p className="text-xs text-slate-600 mt-0.5">{month}</p>
      </div>

      <div className="px-4 space-y-3">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Income',   value: income,   color: '#34d399', prefix: '$' },
            { label: 'Spent',    value: expenses,  color: '#f43f5e', prefix: '$' },
            { label: 'Saved',    value: saved,     color: saved >= 0 ? '#818cf8' : '#f43f5e', prefix: '$' },
          ].map(s => (
            <div key={s.label} className="card p-3 text-center">
              <p className="stat-label mb-1">{s.label}</p>
              <p className="text-sm font-bold font-mono" style={{ color: s.color }}>
                {s.value < 0 ? '-' : ''}{s.prefix}{Math.abs(s.value).toFixed(0)}
              </p>
            </div>
          ))}
        </div>

        {/* Transactions count */}
        <div
          className="flex items-center justify-between px-4 py-3 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <p className="text-xs text-slate-500">Transactions analyzed</p>
          <p className="text-sm font-bold font-mono text-slate-300">{thisMonthTxns.length}</p>
        </div>

        {/* Generate button */}
        {!loading && !insights && (
          <button
            onClick={generate}
            disabled={thisMonthTxns.length === 0}
            className="w-full py-4 rounded-2xl flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.15))',
              border: '1px solid rgba(99,102,241,0.3)',
              boxShadow: '0 0 30px rgba(99,102,241,0.15)',
            }}
          >
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 0 12px rgba(99,102,241,0.5)' }}
            >
              <Icon name="Sparkles" size={16} strokeWidth={2} className="text-white" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-slate-200">Generate Insights</p>
              <p className="text-[10px] text-slate-500">Powered by Gemini 2.0 Flash</p>
            </div>
          </button>
        )}

        {thisMonthTxns.length === 0 && (
          <p className="text-center text-xs text-slate-600 py-2">Add transactions this month to generate insights.</p>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 py-2">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              <p className="text-xs text-slate-500 animate-pulse">Analyzing your spending patterns...</p>
            </div>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            className="rounded-2xl p-4"
            style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)' }}
          >
            <p className="text-sm font-semibold text-rose-400 mb-1">Request failed</p>
            <p className="text-xs text-rose-500/80">{error}</p>
            <button
              onClick={generate}
              className="mt-3 text-xs font-semibold text-indigo-400 flex items-center gap-1"
            >
              <Icon name="RefreshCw" size={11} strokeWidth={2} />
              Try again
            </button>
          </div>
        )}

        {/* Results */}
        {insights && !loading && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Analysis complete</p>
              </div>
              <button
                onClick={generate}
                className="flex items-center gap-1 text-[10px] font-semibold text-indigo-400"
              >
                <Icon name="RefreshCw" size={10} strokeWidth={2} />
                Refresh
              </button>
            </div>
            <InsightsRenderer text={insights} />
          </div>
        )}
      </div>
    </div>
  );
}

const SECTION_ICONS = ['TrendingUp', 'Sparkles', 'Target', 'Check', 'ArrowUp'];
const SECTION_COLORS = [
  { bg: 'rgba(129,140,248,0.08)', border: 'rgba(129,140,248,0.15)', dot: '#818cf8' },
  { bg: 'rgba(52,211,153,0.08)',  border: 'rgba(52,211,153,0.15)',  dot: '#34d399' },
  { bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.15)',  dot: '#fbbf24' },
  { bg: 'rgba(244,63,94,0.08)',   border: 'rgba(244,63,94,0.15)',   dot: '#f43f5e' },
  { bg: 'rgba(6,182,212,0.08)',   border: 'rgba(6,182,212,0.15)',   dot: '#06b6d4' },
];

function InsightsRenderer({ text }) {
  const sections = [];
  let current = null;

  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (!line) continue;
    const clean = line.replace(/^#+\s*/, '').replace(/\*\*/g, '').trim();
    const isHeading = raw.startsWith('#') || /^(Summary|Overview|Tips|Observations|Recommendations|Key|Action)/i.test(clean);

    if (isHeading) {
      if (current) sections.push(current);
      current = { heading: clean, bullets: [] };
    } else if (/^[-•*\d+\.]/.test(line)) {
      if (!current) current = { heading: null, bullets: [] };
      current.bullets.push(clean.replace(/^[-•*\d+\.]\s*/, '').replace(/\*\*/g, ''));
    } else {
      if (!current) current = { heading: null, bullets: [] };
      current.bullets.push(clean.replace(/\*\*/g, ''));
    }
  }
  if (current) sections.push(current);

  if (sections.length === 0) {
    sections.push({ heading: 'Insights', bullets: [text] });
  }

  return (
    <div className="space-y-3">
      {sections.map((s, i) => {
        const color = SECTION_COLORS[i % SECTION_COLORS.length];
        const iconName = SECTION_ICONS[i % SECTION_ICONS.length];
        return (
          <div
            key={i}
            className="rounded-2xl p-4 animate-fade-up"
            style={{
              background: color.bg,
              border: `1px solid ${color.border}`,
              animationDelay: `${i * 80}ms`,
            }}
          >
            {s.heading && (
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center"
                  style={{ background: color.dot + '22' }}
                >
                  <Icon name={iconName} size={12} strokeWidth={2} style={{ color: color.dot }} />
                </div>
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wide">{s.heading}</h3>
              </div>
            )}
            <ul className="space-y-2">
              {s.bullets.map((b, j) => (
                <li key={j} className="flex gap-2.5 text-xs text-slate-400 leading-relaxed">
                  <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0" style={{ background: color.dot }} />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
