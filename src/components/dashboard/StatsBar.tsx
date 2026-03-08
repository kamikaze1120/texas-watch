import { Activity, AlertTriangle, Radio, TrendingUp, MapPin } from 'lucide-react';
import { useDispatchData } from '@/hooks/useDispatchData';
import { useWeatherAlerts } from '@/hooks/useLiveData';

const StatsBar = () => {
  const { data: dispatch } = useDispatchData();
  const { data: weather } = useWeatherAlerts();

  const total = dispatch?.total || 0;
  const critical = dispatch?.calls?.filter(c => c.severity === 'critical').length || 0;
  const high = dispatch?.calls?.filter(c => c.severity === 'high').length || 0;
  const wxAlerts = weather?.length || 0;
  const cities = dispatch?.cities || { austin: 0, dallas: 0, houston: 0, sanAntonio: 0 };

  const stats = [
    { label: 'TOTAL CALLS', value: total, icon: Activity, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'CRITICAL', value: critical, icon: AlertTriangle, color: 'text-destructive', bg: 'bg-destructive/10' },
    { label: 'HIGH PRIORITY', value: high, icon: Radio, color: 'text-warning', bg: 'bg-warning/10' },
    { label: 'WX ALERTS', value: wxAlerts, icon: TrendingUp, color: 'text-warning', bg: 'bg-warning/10' },
  ];

  const cityStats = [
    { label: 'AUS', value: cities.austin },
    { label: 'DAL', value: cities.dallas },
    { label: 'HOU', value: cities.houston },
    { label: 'SAT', value: cities.sanAntonio },
  ];

  return (
    <div className="h-10 bg-card/30 border-b border-border/50 flex items-center px-4 gap-4 overflow-x-auto shrink-0">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div key={i} className="flex items-center gap-1.5 shrink-0">
            <Icon className={`h-3 w-3 ${stat.color}`} />
            <span className={`text-[11px] font-display font-bold tabular-nums ${stat.color}`}>{stat.value}</span>
            <span className="text-[7px] font-display text-muted-foreground tracking-wider">{stat.label}</span>
          </div>
        );
      })}

      <div className="h-4 w-px bg-border/30 hidden lg:block" />

      <div className="hidden lg:flex items-center gap-3">
        <MapPin className="h-2.5 w-2.5 text-muted-foreground" />
        {cityStats.map(c => (
          <div key={c.label} className="flex items-center gap-1">
            <span className="text-[8px] font-display text-muted-foreground tracking-wider">{c.label}</span>
            <span className="text-[9px] font-display text-foreground font-bold tabular-nums">{c.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatsBar;
