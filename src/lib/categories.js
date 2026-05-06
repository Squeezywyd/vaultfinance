export const CATEGORIES = [
  { id: 'food',          label: 'Food',          icon: 'UtensilsCrossed', color: '#f97316', type: 'expense' },
  { id: 'transport',     label: 'Transport',     icon: 'Car',             color: '#3b82f6', type: 'expense' },
  { id: 'housing',       label: 'Housing',       icon: 'Home',            color: '#8b5cf6', type: 'expense' },
  { id: 'entertainment', label: 'Entertainment', icon: 'Clapperboard',    color: '#ec4899', type: 'expense' },
  { id: 'health',        label: 'Health',        icon: 'HeartPulse',      color: '#10b981', type: 'expense' },
  { id: 'shopping',      label: 'Shopping',      icon: 'ShoppingBag',     color: '#f59e0b', type: 'expense' },
  { id: 'utilities',     label: 'Utilities',     icon: 'Zap',             color: '#06b6d4', type: 'expense' },
  { id: 'salary',        label: 'Salary',        icon: 'Briefcase',       color: '#22c55e', type: 'income'  },
  { id: 'freelance',     label: 'Freelance',     icon: 'Laptop',          color: '#84cc16', type: 'income'  },
  { id: 'other',         label: 'Other',         icon: 'Coins',           color: '#6366f1', type: 'both'    },
];

export const EXPENSE_CATEGORIES = CATEGORIES.filter(c => c.type === 'expense' || c.type === 'both');
export const INCOME_CATEGORIES  = CATEGORIES.filter(c => c.type === 'income'  || c.type === 'both');

export function getCategoryById(id) {
  return CATEGORIES.find(c => c.id === id) ?? { id, label: id, icon: 'Coins', color: '#6366f1' };
}
