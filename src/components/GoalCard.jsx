import { useState } from 'react';
import Icon from './CategoryIcon';

const R = 38;
const CIRC = 2 * Math.PI * R;

export default function GoalCard({ goal, onAddFunds, onDelete, style }) {
  const [adding, setAdding] = useState(false);
  const [amount, setAmount] = useState('');

  const pct      = Math.min(goal.savedAmount / goal.targetAmount, 1);
  const offset   = CIRC * (1 - pct);
  const now      = new Date();
  const target   = new Date(goal.targetDate);
  const daysLeft = Math.ceil((target - now) / 86400000);
  const complete = pct >= 1;

  const ringColor  = complete ? '#34d399' : daysLeft < 30 ? '#f59e0b' : goal.color;
  const glowColor  = complete ? 'rgba(52,211,153,0.3)' : daysLeft < 30 ? 'rgba(245,158,11,0.3)' : goal.color + '4d';

  function commit() {
    const val = parseFloat(amount);
    if (!isNaN(val) && val > 0) onAddFunds(goal.id, val);
    setAdding(false);
    setAmount('');
  }

  return (
    <div className="card p-4 animate-fade-up" style={style}>
      <div className="flex gap-4 items-center">
        {/* Ring */}
        <div className="relative flex-shrink-0 w-24 h-24">
          <svg width="96" height="96" viewBox="0 0 96 96" className="-rotate-90">
            <circle cx="48" cy="48" r={R} strokeWidth="6" stroke="rgba(255,255,255,0.06)" fill="none" />
            <circle
              cx="48" cy="48" r={R}
              strokeWidth="6"
              fill="none"
              stroke={ringColor}
              strokeDasharray={CIRC}
              strokeDashoffset={offset}
              strokeLinecap="round"
              style={{
                filter: `drop-shadow(0 0 6px ${glowColor})`,
                transition: 'stroke-dashoffset 0.8s cubic-bezier(0.34,1.56,0.64,1), stroke 0.3s',
              }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-base font-bold font-mono text-slate-100">{(pct * 100).toFixed(0)}%</span>
            {complete && (
              <Icon name="Check" size={10} className="text-emerald-400 mt-0.5" strokeWidth={2.5} />
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <h3 className="font-semibold text-sm text-slate-100 truncate pr-2">{goal.name}</h3>
            <button
              onClick={() => onDelete(goal.id)}
              className="flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
              style={{ color: 'rgba(255,255,255,0.25)' }}
            >
              <Icon name="X" size={12} strokeWidth={2} />
            </button>
          </div>

          <div className="mb-1">
            <span className="text-xs font-mono text-slate-300">${goal.savedAmount.toFixed(0)}</span>
            <span className="text-xs text-slate-600 mx-1">/</span>
            <span className="text-xs font-mono text-slate-500">${goal.targetAmount.toFixed(0)}</span>
          </div>

          <p className="text-[10px] text-slate-500 mb-2.5">
            {complete
              ? 'Goal reached!'
              : daysLeft > 0
                ? `${daysLeft} day${daysLeft !== 1 ? 's' : ''} remaining`
                : 'Target date passed'
            }
          </p>

          {/* Progress bar */}
          <div className="h-1 rounded-full mb-3" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${pct * 100}%`,
                background: ringColor,
                boxShadow: `0 0 6px ${glowColor}`,
              }}
            />
          </div>

          {adding ? (
            <div className="flex gap-2">
              <input
                autoFocus type="number" placeholder="Amount"
                value={amount} onChange={e => setAmount(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && commit()}
                className="flex-1 input-field py-2 text-xs"
              />
              <button onClick={commit} className="text-xs bg-indigo-600 text-white px-3 py-2 rounded-lg font-semibold">Add</button>
              <button onClick={() => setAdding(false)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5">
                <Icon name="X" size={12} strokeWidth={2} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAdding(true)}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
            >
              <Icon name="Plus" size={11} strokeWidth={2.5} />
              Add funds
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
