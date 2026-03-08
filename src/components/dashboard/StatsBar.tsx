import { Activity, AlertTriangle, Radio, Clock, TrendingUp, Users } from 'lucide-react';
import { statsData } from '@/data/mockData';

const stats = [
  { label: 'ACTIVE INCIDENTS', value: statsData.activeIncidents, icon: Activity, color: 'text-primary', bg: 'bg-primary/10' },
  { label: 'CRITICAL', value: statsData.criticalIncidents, icon: AlertTriangle, color: 'text-destructive', bg: 'bg-destructive/10' },
  { label: 'UNITS RESPONDING', value: statsData.respondingUnits, icon: Users, color: 'text-warning', bg: 'bg-warning/10' },
  { label: 'ACTIVE ALERTS', value: statsData.alertsActive, icon: Radio, color: 'text-warning', bg: 'bg-warning/10' },
  { label: 'TODAY TOTAL', value: statsData.incidentsToday, icon: TrendingUp, color: 'text-primary', bg: 'bg-primary/10' },
  { label: 'AVG RESPONSE', value: statsData.avgResponseTime, icon: Clock, color: 'text-success', bg: 'bg-success/10' },
];

const StatsBar = () => {
  return (
    <div className="h-14 bg-card/50 border-b border-border flex items-center px-5 gap-1 overflow-x-auto shrink-0">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div key={i} className="flex items-center gap-2.5 shrink-0 px-3 py-1.5 rounded-lg hover:bg-secondary/50 transition-colors cursor-default">
            <div className={`p-1 rounded-md ${stat.bg}`}>
              <Icon className={`h-3.5 w-3.5 ${stat.color}`} />
            </div>
            <div>
              <p className={`text-sm font-display font-bold tabular-nums ${stat.color} leading-none`}>
                {stat.value}
              </p>
              <p className="text-[8px] font-display text-muted-foreground tracking-wider leading-none mt-0.5">
                {stat.label}
              </p>
            </div>
            {i < stats.length - 1 && <div className="h-6 w-px bg-border/50 ml-2" />}
          </div>
        );
      })}
    </div>
  );
};

export default StatsBar;
