import { useState } from 'react';
import { getCategoryById } from '../lib/categories';
import Icon from './CategoryIcon';

export default function BudgetBar({ category, spent, limit, onSetLimit, style }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState('');

  const cat    = getCategoryById(category);
  const pct    = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
  const over   = limit > 0 && spent > limit;
  const warn   = pct >= 75 && !over;
  const barColor = over ? '#f43f5e' : warn ? '#f59e0b' : '#34d399';
  const barGlow  = over ? 'rgba(244,63,94,0.35)' : warn ? 'rgba(245,158,11,0.35)' : 'rgba(52,211,153,0.35)';

  function startEdit() {
    setDraft(limit > 0 ? String(limit) : '');
    setEditing(true);
  }

  function commitEdit() {
    const val = parseFloat(draft);
    if (!isNaN(val) && val >= 0) onSetLimit(category, val);
    setEditing(false);
  }

  return (
    <div
      className="card p-4 animate-fade-up"
      style={style}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: cat.color + '18', border: `1px solid ${cat.color}28` }}
          >
            <Icon name={cat.icon} size={14} strokeWidth={1.75} style={{ color: cat.color }} />
          </div>
          <span className="text-sm font-medium text-slate-200">{cat.label}</span>
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-400 font-mono">${spent.toFixed(0)}</span>
          <span className="text-slate-600">/</span>
          {editing ? (
            <input
              autoFocus type="number" value={draft}
              onChange={e => setDraft(e.target.value)}
              onBlur={commitEdit}
              onKeyDown={e => e.key === 'Enter' && commitEdit()}
              className="w-16 text-right bg-white/5 border border-indigo-500/40 rounded-lg px-1.5 py-0.5 text-slate-100 text-xs outline-none"
            />
          ) : (
            <button
              onClick={startEdit}
              className="text-indigo-400 font-mono font-medium hover:text-indigo-300 transition-colors"
            >
              {limit > 0 ? `$${limit.toFixed(0)}` : 'set limit'}
            </button>
          )}
        </div>
      </div>

      {/* Track */}
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${pct}%`,
            background: barColor,
            boxShadow: `0 0 8px ${barGlow}`,
          }}
        />
      </div>

      <div className="flex justify-between mt-2">
        <span className="text-[10px] text-slate-500 font-mono">{pct.toFixed(0)}% used</span>
        {over && (
          <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">Over budget</span>
        )}
        {!over && limit === 0 && (
          <span className="text-[10px] text-slate-600">Tap limit to set</span>
        )}
      </div>
    </div>
  );
}
