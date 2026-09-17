import { LucideIcon } from 'lucide-react';

interface Props {
  label:    string;
  value:    string | number;
  icon:     LucideIcon;
  color?:   'gold' | 'teal' | 'green' | 'red';
  trend?:   string;
  delay?:   number;
}

const colors = {
  gold:  { bg: 'rgba(212,168,83,0.08)',  border: 'rgba(212,168,83,0.2)',  icon: '#D4A853'  },
  teal:  { bg: 'rgba(14,165,201,0.08)',  border: 'rgba(14,165,201,0.2)',  icon: '#38BCD4'  },
  green: { bg: 'rgba(34,197,94,0.08)',   border: 'rgba(34,197,94,0.2)',   icon: '#4ADE80'  },
  red:   { bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.2)',   icon: '#F87171'  },
};

export function StatCard({ label, value, icon: Icon, color = 'gold', trend, delay = 0 }: Props) {
  const c = colors[color];
  return (
    <div className="stat-card animate-slide-up" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-start justify-between mb-4">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: c.bg, border: `1px solid ${c.border}` }}>
          <Icon size={20} style={{ color: c.icon }} />
        </div>
        {trend && (
          <span className="text-xs font-semibold px-2 py-1 rounded-full"
            style={{ background: c.bg, color: c.icon }}>
            {trend}
          </span>
        )}
      </div>
      <p className="text-2xl font-display font-bold text-white mb-1">
        {typeof value === 'number' ? value.toLocaleString('fr-FR') : value}
      </p>
      <p className="text-sm text-slate-400">{label}</p>
    </div>
  );
}
