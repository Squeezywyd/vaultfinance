import { useState, useMemo } from 'react';
import { getCategoryById, EXPENSE_CATEGORIES } from '../lib/categories';
import Icon from '../components/CategoryIcon';

// ─────────────────────────────────────────────
//  BUDGET SECTION
// ─────────────────────────────────────────────
function BudgetSection({ budgets, setBudgetLimit, thisMonthTxns }) {
  const spendingMap = useMemo(() => {
    const m = {};
    thisMonthTxns.filter(t => t.type === 'expense').forEach(t => {
      m[t.category] = (m[t.category] ?? 0) + t.amount;
    });
    return m;
  }, [thisMonthTxns]);

  const totalBudgeted = EXPENSE_CATEGORIES.reduce((s, c) => s + (budgets[c.id] ?? 0), 0);
  const totalSpent    = EXPENSE_CATEGORIES.reduce((s, c) => s + (spendingMap[c.id] ?? 0), 0);
  const overallPct    = totalBudgeted > 0 ? Math.min((totalSpent / totalBudgeted) * 100, 100) : 0;
  const remaining     = Math.max(totalBudgeted - totalSpent, 0);
  const over          = totalSpent > totalBudgeted && totalBudgeted > 0;

  function resetAllLimits() {
    if (!window.confirm('Reset all budget limits to zero?')) return;
    EXPENSE_CATEGORIES.forEach(c => setBudgetLimit(c.id, 0));
  }

  return (
    <div className="space-y-3">
      {/* Overview */}
      <div className="rounded-2xl p-4 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.08) 100%)', border: '1px solid rgba(99,102,241,0.2)' }}>
        <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl pointer-events-none"
          style={{ background: 'rgba(99,102,241,0.25)' }} />
        <div className="relative">
          <div className="flex justify-between mb-3">
            <div>
              <p className="stat-label mb-1">Budgeted</p>
              <p className="text-xl font-bold font-mono text-slate-100">${totalBudgeted.toFixed(0)}</p>
            </div>
            <div className="text-center">
              <p className="stat-label mb-1">Spent</p>
              <p className="text-xl font-bold font-mono text-slate-100">${totalSpent.toFixed(0)}</p>
            </div>
            <div className="text-right">
              <p className="stat-label mb-1">{over ? 'Over by' : 'Remaining'}</p>
              <p className={`text-xl font-bold font-mono ${over ? 'text-rose-400' : 'text-emerald-400'}`}>
                ${over ? (totalSpent - totalBudgeted).toFixed(0) : remaining.toFixed(0)}
              </p>
            </div>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <div className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${overallPct}%`,
                background: over ? '#f43f5e' : 'linear-gradient(90deg,#818cf8,#c084fc)',
                boxShadow: over ? '0 0 8px rgba(244,63,94,0.5)' : '0 0 8px rgba(129,140,248,0.4)',
              }} />
          </div>
          <p className="text-[10px] text-indigo-300/50 mt-1">{overallPct.toFixed(0)}% of budget used</p>
        </div>
      </div>

      <div className="flex items-center justify-between px-1">
        <p className="text-[10px] text-slate-600 uppercase tracking-widest">Tap limit to edit</p>
        <button onClick={resetAllLimits} className="text-[10px] text-slate-600 hover:text-rose-400 flex items-center gap-1 transition-colors">
          <Icon name="RotateCcw" size={9} strokeWidth={2.5} /> Reset all
        </button>
      </div>

      {EXPENSE_CATEGORIES.map((cat, i) => {
        const spent = spendingMap[cat.id] ?? 0;
        const limit = budgets[cat.id] ?? 0;
        return <BudgetRow key={cat.id} cat={cat} spent={spent} limit={limit} onSetLimit={setBudgetLimit}
          style={{ animationDelay: `${i * 35}ms` }} />;
      })}
    </div>
  );
}

function BudgetRow({ cat, spent, limit, onSetLimit, style }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState('');

  const pct    = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
  const over   = limit > 0 && spent > limit;
  const warn   = pct >= 75 && !over;
  const barClr = over ? '#f43f5e' : warn ? '#f59e0b' : '#34d399';

  function startEdit() { setDraft(limit > 0 ? String(limit) : ''); setEditing(true); }
  function commit() {
    const v = parseFloat(draft);
    if (!isNaN(v) && v >= 0) onSetLimit(cat.id, v);
    setEditing(false);
  }

  return (
    <div className="card p-4 animate-fade-up" style={style}>
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: cat.color + '18', border: `1px solid ${cat.color}28` }}>
            <Icon name={cat.icon} size={14} strokeWidth={1.75} style={{ color: cat.color }} />
          </div>
          <span className="text-sm font-medium text-slate-200">{cat.label}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-400 font-mono">${spent.toFixed(0)}</span>
          <span className="text-slate-600">/</span>
          {editing ? (
            <input autoFocus type="number" value={draft}
              onChange={e => setDraft(e.target.value)}
              onBlur={commit}
              onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false); }}
              className="w-16 text-right input-field py-0.5 px-1.5 text-xs"
            />
          ) : (
            <button onClick={startEdit}
              className="text-indigo-400 font-mono font-medium hover:text-indigo-300 transition-colors underline underline-offset-2">
              {limit > 0 ? `$${limit.toFixed(0)}` : 'set'}
            </button>
          )}
        </div>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: barClr, boxShadow: `0 0 6px ${barClr}55` }} />
      </div>
      <div className="flex justify-between mt-1.5">
        <span className="text-[10px] text-slate-600 font-mono">{pct.toFixed(0)}%</span>
        {over && <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">Over budget</span>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  GOALS SECTION
// ─────────────────────────────────────────────
const GOAL_COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e'];
const R = 28; const CIRC = 2 * Math.PI * R;

function GoalItem({ goal, onAddFunds, onDelete, onUpdate }) {
  const [mode, setMode] = useState('view'); // 'view' | 'funds' | 'edit'
  const [funds,     setFunds]     = useState('');
  const [draftName, setDraftName] = useState('');
  const [draftTarget, setDraftTarget] = useState('');
  const [draftDate,   setDraftDate]   = useState('');
  const [draftColor,  setDraftColor]  = useState('');

  const pct      = Math.min(goal.savedAmount / goal.targetAmount, 1);
  const offset   = CIRC * (1 - pct);
  const now      = new Date();
  const target   = new Date(goal.targetDate);
  const daysLeft = Math.ceil((target - now) / 86400000);
  const complete = pct >= 1;
  const ringColor = complete ? '#34d399' : daysLeft < 30 && daysLeft > 0 ? '#f59e0b' : goal.color;

  function startEdit() {
    setDraftName(goal.name);
    setDraftTarget(String(goal.targetAmount));
    setDraftDate(goal.targetDate.slice(0, 10));
    setDraftColor(goal.color);
    setMode('edit');
  }

  function commitEdit() {
    const target = parseFloat(draftTarget);
    if (!draftName.trim() || isNaN(target) || target <= 0) return;
    onUpdate(goal.id, {
      name: draftName.trim(),
      targetAmount: target,
      targetDate: new Date(draftDate).toISOString(),
      color: draftColor,
    });
    setMode('view');
  }

  function commitFunds() {
    const v = parseFloat(funds);
    if (!isNaN(v) && v > 0) onAddFunds(goal.id, v);
    setFunds('');
    setMode('view');
  }

  if (mode === 'edit') {
    return (
      <div className="card p-4 space-y-3 animate-fade-up">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-slate-300">Edit Goal</p>
          <button onClick={() => setMode('view')} className="text-slate-600 hover:text-slate-300">
            <Icon name="X" size={14} strokeWidth={2} />
          </button>
        </div>
        <input type="text" value={draftName} onChange={e => setDraftName(e.target.value)}
          className="input-field text-sm" placeholder="Goal name" />
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">$</span>
            <input type="number" value={draftTarget} onChange={e => setDraftTarget(e.target.value)}
              className="input-field pl-6 text-sm w-full" placeholder="Target" />
          </div>
          <input type="date" value={draftDate} onChange={e => setDraftDate(e.target.value)}
            className="input-field text-sm flex-1" />
        </div>
        <div>
          <p className="stat-label mb-2">Color</p>
          <div className="flex gap-2">
            {GOAL_COLORS.map(c => (
              <button key={c} type="button" onClick={() => setDraftColor(c)}
                className={`w-6 h-6 rounded-full transition-all ${draftColor === c ? 'scale-125' : 'opacity-50 hover:opacity-100'}`}
                style={{ background: c, outline: draftColor === c ? `2px solid ${c}` : 'none', outlineOffset: 2,
                  boxShadow: draftColor === c ? `0 0 10px ${c}80` : 'none' }}
              />
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { if (window.confirm(`Delete "${goal.name}"?`)) { onDelete(goal.id); setMode('view'); } }}
            className="flex items-center gap-1.5 text-xs text-rose-400 px-3 py-2 rounded-xl hover:bg-rose-500/10 transition-colors">
            <Icon name="Trash2" size={12} strokeWidth={2} /> Delete
          </button>
          <button onClick={commitEdit}
            className="flex-1 py-2 text-sm font-bold text-white rounded-xl transition-all active:scale-95"
            style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
            Save Changes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-4 animate-fade-up">
      <div className="flex gap-3 items-center">
        {/* Ring */}
        <div className="relative flex-shrink-0 w-16 h-16">
          <svg width="64" height="64" viewBox="0 0 64 64" className="-rotate-90">
            <circle cx="32" cy="32" r={R} strokeWidth="5" stroke="rgba(255,255,255,0.06)" fill="none" />
            <circle cx="32" cy="32" r={R} strokeWidth="5" fill="none"
              stroke={ringColor}
              strokeDasharray={CIRC}
              strokeDashoffset={offset}
              strokeLinecap="round"
              style={{ filter: `drop-shadow(0 0 4px ${ringColor}80)`, transition: 'stroke-dashoffset 0.6s cubic-bezier(0.34,1.56,0.64,1)' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[10px] font-bold font-mono text-slate-200">{(pct * 100).toFixed(0)}%</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <h3 className="text-sm font-semibold text-slate-100 truncate">{goal.name}</h3>
            <div className="flex gap-1 ml-2 flex-shrink-0">
              <button onClick={startEdit}
                className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-600 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors">
                <Icon name="Edit2" size={11} strokeWidth={2} />
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 font-mono">
            ${goal.savedAmount.toFixed(0)} <span className="text-slate-700">/ ${goal.targetAmount.toFixed(0)}</span>
          </p>
          <p className="text-[10px] text-slate-600 mt-0.5">
            {complete ? 'Goal complete!' : daysLeft > 0 ? `${daysLeft}d remaining` : 'Overdue'}
          </p>

          {mode === 'funds' ? (
            <div className="flex gap-2 mt-2">
              <div className="relative flex-1">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 text-xs">$</span>
                <input autoFocus type="number" placeholder="Amount" value={funds}
                  onChange={e => setFunds(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && commitFunds()}
                  className="input-field py-1.5 pl-5 text-xs w-full" />
              </div>
              <button onClick={commitFunds}
                className="px-3 py-1.5 text-xs font-bold text-white rounded-lg"
                style={{ background: '#6366f1' }}>
                Add
              </button>
              <button onClick={() => setMode('view')} className="text-slate-500 px-1">
                <Icon name="X" size={13} strokeWidth={2} />
              </button>
            </div>
          ) : (
            <button onClick={() => setMode('funds')}
              className="mt-2 flex items-center gap-1 text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
              <Icon name="Plus" size={10} strokeWidth={2.5} /> Add funds
            </button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 rounded-full mt-3 overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct * 100}%`, background: ringColor, boxShadow: `0 0 4px ${ringColor}80` }} />
      </div>
    </div>
  );
}

function GoalsSection({ goals, addGoal, updateGoal, deleteGoal, showForm, setShowForm }) {
  const [form, setForm] = useState({
    name: '', targetAmount: '', savedAmount: '',
    targetDate: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().slice(0, 10),
    color: GOAL_COLORS[0],
  });

  function set(f, v) { setForm(p => ({ ...p, [f]: v })); }

  function submit(e) {
    e.preventDefault();
    const target = parseFloat(form.targetAmount);
    const saved  = parseFloat(form.savedAmount) || 0;
    if (!form.name.trim() || isNaN(target) || target <= 0) return;
    addGoal({ ...form, targetAmount: target, savedAmount: saved, targetDate: new Date(form.targetDate).toISOString() });
    setForm({ name:'', targetAmount:'', savedAmount:'', targetDate: new Date(new Date().setMonth(new Date().getMonth()+6)).toISOString().slice(0,10), color: GOAL_COLORS[0] });
    setShowForm(false);
  }

  function handleAddFunds(id, amount) {
    const g = goals.find(g => g.id === id);
    if (g) updateGoal(id, { savedAmount: Math.min(g.savedAmount + amount, g.targetAmount) });
  }

  const totalSaved  = goals.reduce((s, g) => s + g.savedAmount, 0);
  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);

  return (
    <div className="space-y-3">
      {/* Summary */}
      {goals.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div>
            <p className="stat-label">Saved</p>
            <p className="text-sm font-bold font-mono text-emerald-400 mt-0.5">${totalSaved.toFixed(0)}</p>
          </div>
          <div className="text-center">
            <p className="stat-label">Progress</p>
            <p className="text-sm font-bold font-mono text-slate-200 mt-0.5">
              {totalTarget > 0 ? ((totalSaved / totalTarget) * 100).toFixed(0) : 0}%
            </p>
          </div>
          <div className="text-right">
            <p className="stat-label">Target</p>
            <p className="text-sm font-bold font-mono text-slate-400 mt-0.5">${totalTarget.toFixed(0)}</p>
          </div>
        </div>
      )}

      {/* New goal form */}
      {showForm && (
        <div className="rounded-2xl p-4 animate-fade-up"
          style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-slate-300">New Goal</p>
            <button onClick={() => setShowForm(false)} className="text-slate-600 hover:text-slate-300">
              <Icon name="X" size={14} strokeWidth={2} />
            </button>
          </div>
          <form onSubmit={submit} className="space-y-2.5">
            <input type="text" placeholder="Goal name" value={form.name}
              onChange={e => set('name', e.target.value)} required className="input-field text-sm" />
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">$</span>
                <input type="number" placeholder="Target" min="1" step="0.01" value={form.targetAmount}
                  onChange={e => set('targetAmount', e.target.value)} required
                  className="input-field pl-6 text-sm w-full" />
              </div>
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">$</span>
                <input type="number" placeholder="Saved" min="0" step="0.01" value={form.savedAmount}
                  onChange={e => set('savedAmount', e.target.value)}
                  className="input-field pl-6 text-sm w-full" />
              </div>
            </div>
            <input type="date" value={form.targetDate} onChange={e => set('targetDate', e.target.value)}
              required className="input-field text-sm" />
            <div>
              <p className="stat-label mb-1.5">Color</p>
              <div className="flex gap-2.5">
                {GOAL_COLORS.map(c => (
                  <button key={c} type="button" onClick={() => set('color', c)}
                    className={`w-6 h-6 rounded-full transition-all ${form.color === c ? 'scale-125' : 'opacity-50 hover:opacity-100'}`}
                    style={{ background: c, outline: form.color === c ? `2px solid ${c}` : 'none', outlineOffset: 2 }} />
                ))}
              </div>
            </div>
            <button type="submit" className="btn-primary py-2.5 text-sm">Create Goal</button>
          </form>
        </div>
      )}

      {goals.length === 0 && !showForm ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <Icon name="Target" size={22} strokeWidth={1.5} className="text-slate-600" />
          </div>
          <p className="text-sm text-slate-500">No goals yet</p>
          <button onClick={() => setShowForm(true)}
            className="text-xs font-semibold text-indigo-400 border border-indigo-500/30 px-4 py-2 rounded-xl">
            + Create Goal
          </button>
        </div>
      ) : (
        goals.map((g, i) => (
          <GoalItem key={g.id} goal={g}
            onAddFunds={handleAddFunds}
            onDelete={deleteGoal}
            onUpdate={updateGoal}
            style={{ animationDelay: `${i * 50}ms` }}
          />
        ))
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
//  COMBINED PAGE
// ─────────────────────────────────────────────
export default function BudgetGoals(props) {
  const [tab,      setTab]      = useState('budget');
  const [showGoalForm, setShowGoalForm] = useState(false);
  const { budgets, setBudgetLimit, thisMonthTxns, goals, addGoal, updateGoal, deleteGoal } = props;

  return (
    <div className="min-h-full pb-8">
      {/* Header */}
      <div className="px-5 pt-14 pb-4"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-end justify-between mb-4">
          <div>
            <p className="stat-label mb-1">Financial Plan</p>
            <h1 className="text-xl font-bold text-slate-100">
              {tab === 'budget' ? 'Monthly Budget' : 'Savings Goals'}
            </h1>
          </div>
          {tab === 'goals' && (
            <button
              onClick={() => setShowGoalForm(v => !v)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-indigo-400 transition-all active:scale-95"
              style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)' }}
            >
              <Icon name="Plus" size={13} strokeWidth={2.5} />
              New Goal
            </button>
          )}
        </div>

        {/* Segment control */}
        <div className="flex p-1 rounded-xl gap-1"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
          {[
            { key: 'budget', icon: 'PieChart', label: 'Budget' },
            { key: 'goals',  icon: 'Target',   label: 'Goals'  },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all duration-200 ${
                tab === t.key ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-400'
              }`}
            >
              <Icon name={t.icon} size={12} strokeWidth={tab === t.key ? 2 : 1.75} />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-4">
        {tab === 'budget' ? (
          <BudgetSection budgets={budgets} setBudgetLimit={setBudgetLimit} thisMonthTxns={thisMonthTxns} />
        ) : (
          <GoalsSection
            goals={goals}
            addGoal={addGoal}
            updateGoal={updateGoal}
            deleteGoal={deleteGoal}
            showForm={showGoalForm}
            setShowForm={setShowGoalForm}
          />
        )}
      </div>
    </div>
  );
}
