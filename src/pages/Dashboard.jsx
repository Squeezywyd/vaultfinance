import { useState } from 'react';
import AddTransactionModal from '../components/AddTransactionModal';
import TransactionItem from '../components/TransactionItem';
import { BarSpendingChart, PieSpendingChart } from '../components/SpendingChart';
import Icon from '../components/CategoryIcon';

export default function Dashboard({
  balance, totalIncome, totalExpenses, savingsRate,
  spendingByCategory, last7Days,
  transactions, addTransaction, deleteTransaction,
}) {
  const [showModal, setShowModal] = useState(false);

  const recentTxns = [...transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  const month = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const isPositive = balance >= 0;

  return (
    <div className="min-h-full pb-6">
      {/* Hero balance section */}
      <div className="relative px-5 pt-14 pb-8">
        {/* Glow orb behind balance */}
        <div
          className="absolute top-8 left-1/2 -translate-x-1/2 w-64 h-32 rounded-full blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(99,102,241,0.25) 0%, transparent 70%)' }}
        />

        <div className="relative">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="stat-label mb-1">Total Balance</p>
              <p className="text-[10px] text-slate-600">{month}</p>
            </div>
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)' }}
            >
              <Icon name="Wallet" size={16} strokeWidth={1.75} className="text-indigo-400" />
            </div>
          </div>

          <div className="mb-7">
            <div className="flex items-start gap-1.5">
              <span className="text-3xl font-light text-slate-400 mt-2">$</span>
              <span className={`text-6xl font-bold font-mono tracking-tight ${isPositive ? 'text-slate-50' : 'text-rose-400'}`}>
                {Math.abs(balance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                isPositive
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'bg-rose-500/10 text-rose-400'
              }`}>
                <Icon name={isPositive ? 'TrendingUp' : 'TrendingDown'} size={9} strokeWidth={2.5} />
                {isPositive ? 'Positive balance' : 'Negative balance'}
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2.5">
            <StatCard label="Income" value={totalIncome} color="#34d399" icon="ArrowDown" />
            <StatCard label="Expenses" value={totalExpenses} color="#f43f5e" icon="ArrowUp" />
            <StatCard label="Saved" value={`${savingsRate.toFixed(0)}%`} color="#818cf8" icon="TrendingUp" isPercent />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="px-4 space-y-3">
        <div className="card p-4 animate-fade-up">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-slate-300 uppercase tracking-widest">7-Day Spending</h2>
          </div>
          <BarSpendingChart data={last7Days} />
        </div>

        <div className="card p-4 animate-fade-up stagger-1">
          <h2 className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-1">By Category</h2>
          <PieSpendingChart data={spendingByCategory} />
        </div>

        {/* Recent transactions */}
        {recentTxns.length > 0 && (
          <div className="animate-fade-up stagger-2">
            <div className="flex items-center justify-between px-1 mb-2">
              <h2 className="text-xs font-bold text-slate-300 uppercase tracking-widest">Recent</h2>
            </div>
            <div
              className="rounded-2xl overflow-hidden"
              style={{ border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}
            >
              {recentTxns.map((t, i) => (
                <div key={t.id} className={i < recentTxns.length - 1 ? 'border-b border-white/[0.04]' : ''}>
                  <TransactionItem transaction={t} onDelete={deleteTransaction} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-24 right-5 w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-150 active:scale-95 z-40"
        style={{
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          boxShadow: '0 0 0 1px rgba(99,102,241,0.3), 0 8px 24px rgba(99,102,241,0.4)',
        }}
        aria-label="Add transaction"
      >
        <Icon name="Plus" size={22} strokeWidth={2.5} className="text-white" />
      </button>

      {showModal && <AddTransactionModal onAdd={addTransaction} onClose={() => setShowModal(false)} />}
    </div>
  );
}

function StatCard({ label, value, color, icon, isPercent }) {
  const displayVal = isPercent ? value : `$${Number(value).toFixed(0)}`;
  return (
    <div
      className="rounded-xl p-3"
      style={{ background: `${color}0d`, border: `1px solid ${color}1a` }}
    >
      <div className="flex items-center gap-1.5 mb-1.5">
        <Icon name={icon} size={11} strokeWidth={2.5} style={{ color }} />
        <span className="text-[9px] font-semibold uppercase tracking-widest" style={{ color: color + 'aa' }}>
          {label}
        </span>
      </div>
      <p className="text-sm font-bold font-mono text-slate-100">{displayVal}</p>
    </div>
  );
}
