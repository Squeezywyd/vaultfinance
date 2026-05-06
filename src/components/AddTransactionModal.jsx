import { useState } from 'react';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../lib/categories';
import Icon from './CategoryIcon';

const DEFAULT_FORM = {
  name: '',
  amount: '',
  type: 'expense',
  category: 'food',
  date: new Date().toISOString().slice(0, 10),
};

export default function AddTransactionModal({ onAdd, onClose }) {
  const [form, setForm] = useState(DEFAULT_FORM);

  const categories = form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  function set(field, value) {
    setForm(prev => {
      const next = { ...prev, [field]: value };
      if (field === 'type') next.category = value === 'income' ? 'salary' : 'food';
      return next;
    });
  }

  function submit(e) {
    e.preventDefault();
    const amount = parseFloat(form.amount);
    if (!form.name.trim() || isNaN(amount) || amount <= 0) return;
    onAdd({ ...form, amount, date: new Date(form.date).toISOString() });
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md animate-slide-up"
        style={{
          background: 'rgba(12,12,22,0.98)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '28px 28px 0 0',
          backdropFilter: 'blur(40px)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-white/10" />
        </div>

        <div className="px-5 pt-2 pb-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-slate-100">New Transaction</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors"
            >
              <Icon name="X" size={16} strokeWidth={2} />
            </button>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {/* Type toggle */}
            <div className="flex p-1 rounded-xl gap-1" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
              {['expense', 'income'].map(t => (
                <button
                  key={t} type="button" onClick={() => set('type', t)}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all duration-200 ${
                    form.type === t
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-500 hover:text-slate-400'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Name + Amount row */}
            <div className="space-y-3">
              <div>
                <label className="stat-label block mb-1.5">Description</label>
                <input
                  type="text" placeholder="e.g. Morning coffee"
                  value={form.name} onChange={e => set('name', e.target.value)} required
                  className="input-field"
                />
              </div>

              <div>
                <label className="stat-label block mb-1.5">Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-mono">$</span>
                  <input
                    type="number" step="0.01" min="0.01" placeholder="0.00"
                    value={form.amount} onChange={e => set('amount', e.target.value)} required
                    className="input-field pl-8 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Categories */}
            <div>
              <label className="stat-label block mb-2">Category</label>
              <div className="grid grid-cols-5 gap-1.5">
                {categories.map(cat => (
                  <button
                    key={cat.id} type="button" onClick={() => set('category', cat.id)}
                    className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all duration-150 ${
                      form.category === cat.id ? 'ring-1' : 'hover:bg-white/[0.03]'
                    }`}
                    style={form.category === cat.id
                      ? { background: cat.color + '18', borderColor: cat.color + '50', ringColor: cat.color }
                      : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }
                    }
                  >
                    <Icon name={cat.icon} size={16} strokeWidth={1.75}
                      style={{ color: form.category === cat.id ? cat.color : '#475569' }} />
                    <span className="text-[9px] font-semibold text-slate-500 leading-tight text-center uppercase tracking-wide">
                      {cat.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="stat-label block mb-1.5">Date</label>
              <input
                type="date" value={form.date} onChange={e => set('date', e.target.value)} required
                className="input-field"
              />
            </div>

            <button type="submit" className="btn-primary mt-2">
              Save Transaction
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
