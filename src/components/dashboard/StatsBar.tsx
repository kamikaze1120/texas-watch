import { Activity, AlertTriangle, Radio, Clock, TrendingUp, Users } from 'lucide-react';
import { statsData } from '@/data/mockData';

const stats = [
  { label: 'ACTIVE INCIDENTS', value: statsData.activeIncidents, icon: Activity, color: 'text-primary' },
  { label: 'CRITICAL', value: statsData.criticalIncidents, icon: AlertTriangle, color: 'text-destructive' },
  { label: 'UNITS RESPONDING', value: statsData.respondingUnits, icon: Users, color: 'text-warning' },
  { label: 'ACTIVE ALERTS', value: statsData.alertsActive, icon: Radio, color: 'text-warning' },
  { label: 'TODAY TOTAL', value: statsData.incidentsToday, icon: TrendingUp, color: 'text-primary' },
  { label: 'AVG RESPONSE', value: statsData.avgResponseTime, icon: Clock, color: 'text-success' },
];

const StatsBar = () => {
  return (
    <div className="h-16 bg-card border-b border-border flex items-center px-4 gap-6 overflow-x-auto shrink-0">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div key={i} className="flex items-center gap-2.5 shrink-0">
            <Icon className={`h-4 w-4 ${stat.color}`} />
            <div>
              <p className={`text-sm font-display font-bold tabular-nums ${stat.color}`}>
                {stat.value}
              </p>
              <p className="text-[9px] font-display text-muted-foreground tracking-wider">
                {stat.label}
              </p>
            </div>
            {i < stats.length - 1 && <div className="h-8 w-px bg-border ml-4" />}
          </div>
        );
      })}
    </div>
  );
};

export default StatsBar;
