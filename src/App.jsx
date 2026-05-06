import { Routes, Route, Navigate } from 'react-router-dom';
import { useFinanceData }    from './hooks/useFinanceData';
import { useInvestments }    from './hooks/useInvestments';
import BottomNav             from './components/BottomNav';
import Dashboard             from './pages/Dashboard';
import Transactions          from './pages/Transactions';
import Investments           from './pages/Investments';
import BudgetGoals           from './pages/BudgetGoals';
import Insights              from './pages/Insights';

export default function App() {
  const financeData    = useFinanceData();
  const investmentData = useInvestments();

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-[#07070f] overflow-hidden relative">
      {/* Ambient background glows */}
      <div className="pointer-events-none fixed inset-0 max-w-md mx-auto overflow-hidden">
        <div className="absolute -top-32 -left-32 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-24 w-56 h-56 bg-violet-600/8 rounded-full blur-3xl" />
        <div className="absolute bottom-24 left-1/4 w-48 h-48 bg-cyan-500/6 rounded-full blur-3xl" />
      </div>

      {/* Subtle grid overlay */}
      <div className="pointer-events-none fixed inset-0 max-w-md mx-auto bg-grid" />

      <main className="flex-1 overflow-y-auto no-scrollbar relative z-10">
        <Routes>
          <Route path="/"             element={<Dashboard    {...financeData} />} />
          <Route path="/transactions" element={<Transactions {...financeData} />} />
          <Route path="/invest"       element={<Investments  {...investmentData} />} />
          <Route path="/plan"         element={<BudgetGoals  {...financeData} />} />
          <Route path="/insights"     element={<Insights     {...financeData} />} />
          {/* legacy redirects */}
          <Route path="/budget"       element={<Navigate to="/plan" replace />} />
          <Route path="/goals"        element={<Navigate to="/plan" replace />} />
          <Route path="*"             element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <div className="relative z-10">
        <BottomNav />
      </div>
    </div>
  );
}
