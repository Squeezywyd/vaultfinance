import { useMemo } from 'react';
import BudgetBar from '../components/BudgetBar';
import { EXPENSE_CATEGORIES } from '../lib/categories';

export default function Budget({ budgets, setBudgetLimit, thisMonthTxns }) {
  const spendingMap = useMemo(() => {
    const map = {};
    thisMonthTxns.filter(t => t.type === 'expense').forEach(t => {
      map[t.category] = (map[t.category] ?? 0) + t.amount;
    });
    return map;
  }, [thisMonthTxns]);

  const totalBudgeted = EXPENSE_CATEGORIES.reduce((s, c) => s + (budgets[c.id] ?? 0), 0);
  const totalSpent    = EXPENSE_CATEGORIES.reduce((s, c) => s + (spendingMap[c.id] ?? 0), 0);
  const overallPct    = totalBudgeted > 0 ? Math.min((totalSpent / totalBudgeted) * 100, 100) : 0;
  const remaining     = Math.max(totalBudgeted - totalSpent, 0);
  const over          = totalSpent > totalBudgeted && totalBudgeted > 0;

  return (
    <div className="min-h-full pb-8">
      {/* Header */}
      <div className="px-5 pt-14 pb-5">
        <p className="stat-label mb-1">Budget Tracker</p>
        <h1 className="text-xl font-bold text-slate-100">
          {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h1>
      </div>

      {/* Overview card */}
      <div className="mx-4 mb-5">
        <div
          className="rounded-2xl p-5 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(139,92,246,0.12) 100%)',
            border: '1px solid rgba(99,102,241,0.25)',
          }}
        >
          {/* Glow */}
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full blur-2xl pointer-events-none"
            style={{ background: 'rgba(99,102,241,0.3)' }} />

          <div className="relative">
            <div className="flex justify-between mb-4">
              <div>
                <p className="stat-label mb-1">Budgeted</p>
                <p className="text-2xl font-bold font-mono text-slate-100">${totalBudgeted.toFixed(0)}</p>
              </div>
              <div className="text-right">
                <p className="stat-label mb-1">Spent</p>
                <p className="text-2xl font-bold font-mono text-slate-100">${totalSpent.toFixed(0)}</p>
              </div>
              <div className="text-right">
                <p className="stat-label mb-1">{over ? 'Over by' : 'Left'}</p>
                <p className={`text-2xl font-bold font-mono ${over ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {over ? `$${(totalSpent - totalBudgeted).toFixed(0)}` : `$${remaining.toFixed(0)}`}
                </p>
              </div>
            </div>

            {/* Overall bar */}
            <div className="h-1.5 rounded-full overflow-hidden mb-1.5" style={{ background: 'rgba(255,255,255,0.1)' }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${overallPct}%`,
                  background: over ? '#f43f5e' : 'linear-gradient(90deg, #818cf8, #c084fc)',
                  boxShadow: over ? '0 0 8px rgba(244,63,94,0.5)' : '0 0 8px rgba(129,140,248,0.5)',
                }}
              />
            </div>
            <p className="text-[10px] text-indigo-300/60">{overallPct.toFixed(0)}% of total budget used</p>
          </div>
        </div>
      </div>

      {/* Hint */}
      <p className="text-[10px] text-slate-600 uppercase tracking-widest px-5 mb-3">
        Tap a limit to edit · {EXPENSE_CATEGORIES.length} categories
      </p>

      {/* Category bars */}
      <div className="px-4 space-y-2.5">
        {EXPENSE_CATEGORIES.map((cat, i) => (
          <BudgetBar
            key={cat.id}
            category={cat.id}
            spent={spendingMap[cat.id] ?? 0}
            limit={budgets[cat.id] ?? 0}
            onSetLimit={setBudgetLimit}
            style={{ animationDelay: `${i * 40}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
