import { useState, useEffect, useCallback } from 'react';
import { CATEGORIES } from '../lib/categories';

function uuid() {
  return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function seedDemoData() {
  const now = new Date();
  const txns = [];

  const expenseTemplates = [
    { name: 'Grocery run',        category: 'food',          amountRange: [30, 120]  },
    { name: 'Coffee & pastry',    category: 'food',          amountRange: [4, 18]    },
    { name: 'Restaurant dinner',  category: 'food',          amountRange: [25, 90]   },
    { name: 'Uber ride',          category: 'transport',     amountRange: [8, 35]    },
    { name: 'Monthly rent',       category: 'housing',       amountRange: [950, 950] },
    { name: 'Electricity bill',   category: 'utilities',     amountRange: [60, 110]  },
    { name: 'Netflix',            category: 'entertainment', amountRange: [15, 15]   },
    { name: 'Cinema tickets',     category: 'entertainment', amountRange: [12, 30]   },
    { name: 'Gym membership',     category: 'health',        amountRange: [35, 55]   },
    { name: 'Pharmacy',           category: 'health',        amountRange: [10, 50]   },
    { name: 'Online shopping',    category: 'shopping',      amountRange: [20, 150]  },
    { name: 'Clothing store',     category: 'shopping',      amountRange: [40, 180]  },
    { name: 'Internet bill',      category: 'utilities',     amountRange: [40, 60]   },
    { name: 'Public transport',   category: 'transport',     amountRange: [30, 90]   },
  ];

  const incomeTemplates = [
    { name: 'Monthly salary',   category: 'salary',   amount: 3800 },
    { name: 'Freelance project', category: 'freelance', amountRange: [200, 800] },
  ];

  for (let monthOffset = 0; monthOffset <= 1; monthOffset++) {
    const month = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const maxDay = monthOffset === 0 ? Math.min(now.getDate(), daysInMonth) : daysInMonth;

    // Income
    const salaryDate = new Date(month.getFullYear(), month.getMonth(), 1);
    txns.push({
      id: uuid(), name: 'Monthly salary', amount: 3800, type: 'income',
      category: 'salary', date: salaryDate.toISOString(),
    });

    if (Math.random() > 0.4) {
      const t = incomeTemplates[1];
      const amount = t.amountRange[0] + Math.floor(Math.random() * (t.amountRange[1] - t.amountRange[0]));
      const day = Math.floor(Math.random() * maxDay) + 1;
      txns.push({
        id: uuid(), name: t.name, amount, type: 'income', category: t.category,
        date: new Date(month.getFullYear(), month.getMonth(), day).toISOString(),
      });
    }

    // Expenses: rent always day 1, others scattered
    const rentTemplate = expenseTemplates.find(t => t.category === 'housing');
    txns.push({
      id: uuid(), name: rentTemplate.name, amount: 950, type: 'expense',
      category: 'housing', date: new Date(month.getFullYear(), month.getMonth(), 2).toISOString(),
    });

    const otherTemplates = expenseTemplates.filter(t => t.category !== 'housing');
    const selectedTemplates = otherTemplates.sort(() => Math.random() - 0.5).slice(0, 12);

    for (const t of selectedTemplates) {
      const [min, max] = t.amountRange;
      const amount = +(min + Math.random() * (max - min)).toFixed(2);
      const day = Math.floor(Math.random() * maxDay) + 1;
      txns.push({
        id: uuid(), name: t.name, amount, type: 'expense', category: t.category,
        date: new Date(month.getFullYear(), month.getMonth(), day).toISOString(),
      });
    }
  }

  const budgets = {
    food: 400, transport: 150, housing: 1000, entertainment: 100,
    health: 80, shopping: 200, utilities: 150, other: 100,
  };

  const goals = [
    {
      id: uuid(), name: 'Emergency Fund', targetAmount: 5000, savedAmount: 2100,
      targetDate: new Date(now.getFullYear(), now.getMonth() + 6, 1).toISOString(),
      color: '#6366f1',
    },
    {
      id: uuid(), name: 'Vacation to Japan', targetAmount: 3000, savedAmount: 850,
      targetDate: new Date(now.getFullYear() + 1, 2, 1).toISOString(),
      color: '#f59e0b',
    },
    {
      id: uuid(), name: 'New Laptop', targetAmount: 1500, savedAmount: 600,
      targetDate: new Date(now.getFullYear(), now.getMonth() + 3, 1).toISOString(),
      color: '#10b981',
    },
  ];

  save('vault_transactions', txns);
  save('vault_budgets', budgets);
  save('vault_goals', goals);
}

export function useFinanceData() {
  const [transactions, setTransactions] = useState(() => {
    const stored = load('vault_transactions', null);
    if (stored === null) {
      seedDemoData();
      return load('vault_transactions', []);
    }
    return stored;
  });

  const [budgets, setBudgets] = useState(() => load('vault_budgets', {}));
  const [goals, setGoals]     = useState(() => load('vault_goals', []));

  useEffect(() => { save('vault_transactions', transactions); }, [transactions]);
  useEffect(() => { save('vault_budgets', budgets); }, [budgets]);
  useEffect(() => { save('vault_goals', goals); }, [goals]);

  const addTransaction = useCallback((txn) => {
    setTransactions(prev => [{ ...txn, id: uuid() }, ...prev]);
  }, []);

  const deleteTransaction = useCallback((id) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  }, []);

  const setBudgetLimit = useCallback((category, limit) => {
    setBudgets(prev => ({ ...prev, [category]: limit }));
  }, []);

  const addGoal = useCallback((goal) => {
    setGoals(prev => [...prev, { ...goal, id: uuid() }]);
  }, []);

  const updateGoal = useCallback((id, patch) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, ...patch } : g));
  }, []);

  const deleteGoal = useCallback((id) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  }, []);

  // Derived data helpers
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear  = now.getFullYear();

  const thisMonthTxns = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const totalIncome   = thisMonthTxns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpenses = thisMonthTxns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const balance       = totalIncome - totalExpenses;
  const savingsRate   = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

  const spendingByCategory = CATEGORIES
    .filter(c => c.type === 'expense' || c.type === 'both')
    .map(cat => ({
      ...cat,
      spent: thisMonthTxns
        .filter(t => t.type === 'expense' && t.category === cat.id)
        .reduce((s, t) => s + t.amount, 0),
    }))
    .filter(c => c.spent > 0);

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (6 - i));
    const label = d.toLocaleDateString('en-US', { weekday: 'short' });
    const spent = transactions
      .filter(t => {
        const td = new Date(t.date);
        return t.type === 'expense' &&
          td.getFullYear() === d.getFullYear() &&
          td.getMonth()    === d.getMonth() &&
          td.getDate()     === d.getDate();
      })
      .reduce((s, t) => s + t.amount, 0);
    return { label, spent };
  });

  return {
    transactions, budgets, goals,
    addTransaction, deleteTransaction,
    setBudgetLimit,
    addGoal, updateGoal, deleteGoal,
    thisMonthTxns, totalIncome, totalExpenses, balance, savingsRate,
    spendingByCategory, last7Days,
  };
}
