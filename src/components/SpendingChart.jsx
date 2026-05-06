import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';

const TOOLTIP_STYLE = {
  background: 'rgba(15,15,25,0.95)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 12,
  fontSize: 12,
  color: '#e2e8f0',
  boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
  padding: '8px 12px',
};

export function BarSpendingChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={148}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
        <XAxis
          dataKey="label"
          tick={{ fontSize: 9, fill: '#475569', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 9, fill: '#334155' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={v => v === 0 ? '' : `$${v}`}
        />
        <Tooltip
          formatter={v => [`$${v.toFixed(2)}`, 'Spent']}
          contentStyle={TOOLTIP_STYLE}
          cursor={{ fill: 'rgba(99,102,241,0.06)', radius: 6 }}
          wrapperStyle={{ outline: 'none' }}
        />
        <Bar dataKey="spent" radius={[5, 5, 2, 2]} maxBarSize={28}>
          {data.map((_, i) => (
            <Cell
              key={i}
              fill={`url(#barGrad-${i})`}
            />
          ))}
          <defs>
            {data.map((_, i) => (
              <linearGradient key={i} id={`barGrad-${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity={0.6} />
              </linearGradient>
            ))}
          </defs>
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function PieSpendingChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-44 flex flex-col items-center justify-center gap-2">
        <div className="w-10 h-10 rounded-full border border-dashed border-white/10 flex items-center justify-center">
          <span className="text-slate-600 text-xs">—</span>
        </div>
        <p className="text-xs text-slate-600">No expenses recorded yet</p>
      </div>
    );
  }

  const RADIAN = Math.PI / 180;

  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.06) return null;
    const r = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + r * Math.cos(-midAngle * RADIAN);
    const y = cy + r * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill="rgba(255,255,255,0.9)" textAnchor="middle" dominantBaseline="central"
        fontSize={9} fontWeight="700" letterSpacing="0.04em">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={data} dataKey="spent" nameKey="label"
            cx="50%" cy="50%"
            innerRadius={44} outerRadius={76}
            paddingAngle={2}
            labelLine={false}
            label={renderLabel}
          >
            {data.map(entry => (
              <Cell key={entry.id} fill={entry.color} style={{ filter: `drop-shadow(0 0 4px ${entry.color}60)` }} />
            ))}
          </Pie>
          <Tooltip
            formatter={v => [`$${v.toFixed(2)}`]}
            contentStyle={TOOLTIP_STYLE}
            wrapperStyle={{ outline: 'none' }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center mt-1">
        {data.slice(0, 6).map(d => (
          <div key={d.id} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
            <span className="text-[10px] text-slate-500">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
