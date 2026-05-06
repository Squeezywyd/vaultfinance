import Icon from './CategoryIcon';
import { getCategoryById } from '../lib/categories';

export default function TransactionItem({ transaction, onDelete, style }) {
  const cat = getCategoryById(transaction.category);
  const date = new Date(transaction.date);
  const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const isIncome = transaction.type === 'income';

  function handleDelete() {
    if (window.confirm(`Delete "${transaction.name}"?`)) onDelete(transaction.id);
  }

  return (
    <button
      onClick={handleDelete}
      style={style}
      className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-150 active:scale-[0.98] group animate-fade-up"
      css-note="glass applied inline below"
    >
      <div
        className="relative w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: cat.color + '18', border: `1px solid ${cat.color}30` }}
      >
        <Icon name={cat.icon} size={16} strokeWidth={1.75} style={{ color: cat.color }} />
      </div>

      <div className="flex-1 text-left min-w-0">
        <p className="text-sm font-medium text-slate-100 truncate">{transaction.name}</p>
        <p className="text-xs text-slate-500 mt-0.5">
          {cat.label}
          <span className="mx-1.5 opacity-40">·</span>
          {dateStr}
        </p>
      </div>

      <div className="flex flex-col items-end flex-shrink-0">
        <span
          className={`text-sm font-semibold font-mono tabular-nums ${isIncome ? 'text-emerald-400' : 'text-rose-400'}`}
        >
          {isIncome ? '+' : '-'}${transaction.amount.toFixed(2)}
        </span>
        <span
          className={`text-[9px] font-bold uppercase tracking-widest mt-0.5 ${isIncome ? 'text-emerald-500/60' : 'text-rose-500/60'}`}
        >
          {transaction.type}
        </span>
      </div>
    </button>
  );
}
