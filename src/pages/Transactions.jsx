import { useState, useMemo } from 'react';
import AddTransactionModal from '../components/AddTransactionModal';
import TransactionItem from '../components/TransactionItem';
import Icon from '../components/CategoryIcon';

const FILTERS = [
  { key: 'All',      label: 'All'      },
  { key: 'Income',   label: 'Income'   },
  { key: 'Expenses', label: 'Expenses' },
];

export default function Transactions({ transactions, addTransaction, deleteTransaction }) {
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter]       = useState('All');
  const [search, setSearch]       = useState('');

  const filtered = useMemo(() => {
    return [...transactions]
      .filter(t => {
        if (filter === 'Income')   return t.type === 'income';
        if (filter === 'Expenses') return t.type === 'expense';
        return true;
      })
      .filter(t => !search || t.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions, filter, search]);

  // Group by date
  const grouped = useMemo(() => {
    const groups = {};
    for (const t of filtered) {
      const d = new Date(t.date);
      const key = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      if (!groups[key]) groups[key] = [];
      groups[key].push(t);
    }
    return Object.entries(groups);
  }, [filtered]);

  const totalFiltered = filtered.reduce((s, t) => {
    return t.type === 'income' ? s + t.amount : s - t.amount;
  }, 0);

  return (
    <div className="min-h-full pb-24">
      {/* Header */}
      <div
        className="px-5 pt-14 pb-4 sticky top-0 z-10"
        style={{ background: 'rgba(7,7,15,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div className="flex items-end justify-between mb-4">
          <div>
            <p className="stat-label mb-1">Transactions</p>
            <p className="text-xl font-bold text-slate-100">{filtered.length} entries</p>
          </div>
          {filtered.length > 0 && (
            <div className="text-right">
              <p className="stat-label mb-1">Net</p>
              <p className={`text-base font-bold font-mono ${totalFiltered >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {totalFiltered >= 0 ? '+' : ''}${Math.abs(totalFiltered).toFixed(2)}
              </p>
            </div>
          )}
        </div>

        {/* Search */}
        <div
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl mb-3"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <Icon name="Search" size={14} strokeWidth={2} className="text-slate-500 flex-shrink-0" />
          <input
            type="text" placeholder="Search..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="bg-transparent text-sm outline-none flex-1 text-slate-200 placeholder-slate-600"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-slate-600 hover:text-slate-400">
              <Icon name="X" size={12} strokeWidth={2} />
            </button>
          )}
        </div>

        {/* Filter pills */}
        <div className="flex gap-2">
          {FILTERS.map(f => (
            <button
              key={f.key} onClick={() => setFilter(f.key)}
              className={`px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-150 ${
                filter === f.key
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-500 hover:text-slate-400'
              }`}
              style={filter !== f.key ? { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' } : {}}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-4 space-y-5">
        {grouped.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <Icon name="ArrowLeftRight" size={20} strokeWidth={1.5} className="text-slate-600" />
            </div>
            <p className="text-sm text-slate-600">{search ? 'No results found' : 'No transactions yet'}</p>
          </div>
        ) : (
          grouped.map(([date, txns]) => (
            <div key={date}>
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2 px-1">{date}</p>
              <div
                className="rounded-2xl overflow-hidden"
                style={{ border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}
              >
                {txns.map((t, i) => (
                  <div key={t.id} className={i < txns.length - 1 ? 'border-b border-white/[0.04]' : ''}>
                    <TransactionItem transaction={t} onDelete={deleteTransaction} />
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-24 right-5 w-14 h-14 rounded-2xl flex items-center justify-center z-40 active:scale-95 transition-transform"
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
