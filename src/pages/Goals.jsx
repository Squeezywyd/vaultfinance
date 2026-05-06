import { useState } from 'react';
import GoalCard from '../components/GoalCard';
import Icon from '../components/CategoryIcon';

const GOAL_COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e'];

const DEFAULT_FORM = {
  name: '',
  targetAmount: '',
  savedAmount: '',
  targetDate: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().slice(0, 10),
  color: GOAL_COLORS[0],
};

export default function Goals({ goals, addGoal, updateGoal, deleteGoal }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState(DEFAULT_FORM);

  function set(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function submit(e) {
    e.preventDefault();
    const target = parseFloat(form.targetAmount);
    const saved  = parseFloat(form.savedAmount) || 0;
    if (!form.name.trim() || isNaN(target) || target <= 0) return;
    addGoal({ ...form, targetAmount: target, savedAmount: saved, targetDate: new Date(form.targetDate).toISOString() });
    setForm(DEFAULT_FORM);
    setShowForm(false);
  }

  function handleAddFunds(id, amount) {
    const goal = goals.find(g => g.id === id);
    if (!goal) return;
    updateGoal(id, { savedAmount: Math.min(goal.savedAmount + amount, goal.targetAmount) });
  }

  const totalSaved  = goals.reduce((s, g) => s + g.savedAmount, 0);
  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);

  return (
    <div className="min-h-full pb-8">
      {/* Header */}
      <div className="px-5 pt-14 pb-5">
        <div className="flex items-end justify-between">
          <div>
            <p className="stat-label mb-1">Savings Goals</p>
            <h1 className="text-xl font-bold text-slate-100">
              {goals.length} goal{goals.length !== 1 ? 's' : ''}
            </h1>
          </div>
          <button
            onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-indigo-400 transition-all active:scale-95"
            style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)' }}
          >
            <Icon name="Plus" size={13} strokeWidth={2.5} />
            New Goal
          </button>
        </div>

        {/* Summary pill */}
        {goals.length > 0 && (
          <div
            className="mt-4 flex items-center justify-between px-4 py-3 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div>
              <p className="stat-label">Total saved</p>
              <p className="text-sm font-bold font-mono text-emerald-400 mt-0.5">${totalSaved.toFixed(0)}</p>
            </div>
            <div className="text-center">
              <p className="stat-label">Progress</p>
              <p className="text-sm font-bold font-mono text-slate-200 mt-0.5">
                {totalTarget > 0 ? ((totalSaved / totalTarget) * 100).toFixed(0) : 0}%
              </p>
            </div>
            <div className="text-right">
              <p className="stat-label">Total target</p>
              <p className="text-sm font-bold font-mono text-slate-400 mt-0.5">${totalTarget.toFixed(0)}</p>
            </div>
          </div>
        )}
      </div>

      {/* New goal form */}
      {showForm && (
        <div
          className="mx-4 mb-4 rounded-2xl p-4 animate-fade-up"
          style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-200">New Goal</h2>
            <button onClick={() => setShowForm(false)} className="text-slate-600 hover:text-slate-400">
              <Icon name="X" size={16} strokeWidth={2} />
            </button>
          </div>
          <form onSubmit={submit} className="space-y-3">
            <input
              type="text" placeholder="Goal name (e.g. Japan trip)"
              value={form.name} onChange={e => set('name', e.target.value)} required
              className="input-field"
            />
            <div className="flex gap-2.5">
              <div className="flex-1 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-mono">$</span>
                <input
                  type="number" placeholder="Target" min="1" step="0.01"
                  value={form.targetAmount} onChange={e => set('targetAmount', e.target.value)} required
                  className="input-field pl-7 text-xs"
                />
              </div>
              <div className="flex-1 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-mono">$</span>
                <input
                  type="number" placeholder="Saved" min="0" step="0.01"
                  value={form.savedAmount} onChange={e => set('savedAmount', e.target.value)}
                  className="input-field pl-7 text-xs"
                />
              </div>
            </div>
            <input
              type="date" value={form.targetDate} onChange={e => set('targetDate', e.target.value)} required
              className="input-field text-xs"
            />
            <div>
              <p className="stat-label mb-2">Color</p>
              <div className="flex gap-2.5">
                {GOAL_COLORS.map(c => (
                  <button
                    key={c} type="button" onClick={() => set('color', c)}
                    className={`w-7 h-7 rounded-full transition-all duration-150 ${form.color === c ? 'scale-110' : 'opacity-60 hover:opacity-100'}`}
                    style={{
                      background: c,
                      boxShadow: form.color === c ? `0 0 12px ${c}80` : 'none',
                      outline: form.color === c ? `2px solid ${c}` : 'none',
                      outlineOffset: 2,
                    }}
                  />
                ))}
              </div>
            </div>
            <button type="submit" className="btn-primary text-sm py-3">Create Goal</button>
          </form>
        </div>
      )}

      {/* Goals list */}
      <div className="px-4 space-y-3">
        {goals.length === 0 && !showForm ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <Icon name="Target" size={24} strokeWidth={1.5} className="text-slate-600" />
            </div>
            <div className="text-center">
              <p className="text-sm text-slate-500">No goals yet</p>
              <p className="text-xs text-slate-700 mt-1">Create your first savings goal</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="text-xs font-semibold text-indigo-400 border border-indigo-500/30 px-4 py-2 rounded-xl"
            >
              + Create Goal
            </button>
          </div>
        ) : (
          goals.map((g, i) => (
            <GoalCard
              key={g.id} goal={g}
              onAddFunds={handleAddFunds}
              onDelete={deleteGoal}
              style={{ animationDelay: `${i * 60}ms` }}
            />
          ))
        )}
      </div>
    </div>
  );
}
