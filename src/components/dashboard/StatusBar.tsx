import { Shield, Clock, Wifi, Activity, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatchData } from '@/hooks/useDispatchData';
import { useWeatherAlerts } from '@/hooks/useLiveData';

const StatusBar = () => {
  const [time, setTime] = useState(new Date());
  const { data: dispatch } = useDispatchData();
  const { data: weather } = useWeatherAlerts();

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const totalCalls = dispatch?.total || 0;
  const criticalCount = dispatch?.calls?.filter(c => c.severity === 'critical').length || 0;
  const weatherCount = weather?.length || 0;

  return (
    <header className="h-14 bg-card/90 backdrop-blur-md border-b border-border/60 flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-accent glow-accent">
            <Star className="h-5 w-5 text-texas-white fill-texas-white" />
          </div>
          <div>
            <h1 className="font-display text-base sm:text-lg font-bold tracking-[0.2em] text-primary text-glow-primary leading-none">
              TEXAS WATCH
            </h1>
            <span className="text-xs text-muted-foreground font-body leading-none tracking-wider">
              PUBLIC SAFETY INTELLIGENCE
            </span>
          </div>
        </div>

        <div className="h-6 w-px bg-border/40 hidden md:block" />

        <div className="hidden md:flex items-center gap-5">
          <div className="flex items-center gap-1.5">
            <Activity className="h-4 w-4 text-primary" />
            <span className="text-sm font-display text-foreground font-bold tabular-nums">{totalCalls}</span>
            <span className="text-xs font-body text-muted-foreground tracking-wider">CALLS</span>
          </div>
          {criticalCount > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-destructive animate-pulse" />
              <span className="text-sm font-display text-destructive font-bold tabular-nums">{criticalCount}</span>
              <span className="text-xs font-body text-muted-foreground tracking-wider">CRITICAL</span>
            </div>
          )}
          {weatherCount > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-warning" />
              <span className="text-sm font-display text-warning font-bold tabular-nums">{weatherCount}</span>
              <span className="text-xs font-body text-muted-foreground tracking-wider">WX</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 bg-success/10 border border-success/20 px-3 py-1 rounded-full">
          <Wifi className="h-3 w-3 text-success" />
          <span className="text-success text-xs font-display tracking-[0.15em] font-medium">LIVE</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm font-display text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span className="text-foreground tabular-nums font-medium">
            {time.toLocaleTimeString('en-US', { hour12: true, hour: 'numeric', minute: '2-digit', second: '2-digit' })}
          </span>
          <span className="text-xs tracking-wider">CST</span>
        </div>
      </div>
    </header>
  );
};

export default StatusBar;
