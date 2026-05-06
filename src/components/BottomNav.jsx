import { NavLink } from 'react-router-dom';
import Icon from './CategoryIcon';

const TABS = [
  { to: '/',             icon: 'LayoutDashboard', label: 'Home'    },
  { to: '/transactions', icon: 'ArrowLeftRight',  label: 'Txns'    },
  { to: '/invest',       icon: 'TrendingUp',      label: 'Invest'  },
  { to: '/plan',         icon: 'Target',          label: 'Plan'    },
  { to: '/insights',     icon: 'Sparkles',        label: 'Insights'},
];

export default function BottomNav() {
  return (
    <nav
      className="safe-bottom relative"
      style={{
        background: 'rgba(7,7,15,0.88)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(32px)',
        WebkitBackdropFilter: 'blur(32px)',
      }}
    >
      <div className="flex">
        {TABS.map(tab => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === '/'}
            className="flex-1"
          >
            {({ isActive }) => (
              <div className={`relative flex flex-col items-center justify-center pt-2.5 pb-1.5 min-h-[52px] gap-0.5 transition-all duration-200`}>
                {/* Active top bar */}
                {isActive && (
                  <span
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                    style={{ background: 'linear-gradient(90deg,#6366f1,#a78bfa)' }}
                  />
                )}

                {/* Icon with glow */}
                <div className="relative">
                  {isActive && (
                    <span className="absolute -inset-2 rounded-xl"
                      style={{ background: 'rgba(99,102,241,0.12)' }} />
                  )}
                  <Icon
                    name={tab.icon}
                    size={19}
                    strokeWidth={isActive ? 2 : 1.5}
                    className={`relative transition-all duration-200 ${isActive ? 'text-indigo-400' : 'text-slate-600'}`}
                  />
                </div>

                <span className={`text-[9px] font-bold tracking-widest uppercase transition-colors duration-200 ${isActive ? 'text-indigo-400' : 'text-slate-600'}`}>
                  {tab.label}
                </span>
              </div>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
