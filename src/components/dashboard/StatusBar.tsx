import { Shield, Clock, Wifi, Activity } from 'lucide-react';
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
    <header className="h-12 bg-card/80 backdrop-blur-sm border-b border-border flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-primary/15 glow-primary">
            <Shield className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-[11px] font-bold tracking-[0.2em] text-primary text-glow-primary leading-none">
              TEXAS WATCH
            </h1>
            <span className="text-[7px] text-muted-foreground font-display leading-none tracking-widest">
              PUBLIC SAFETY INTELLIGENCE
            </span>
          </div>
        </div>

        <div className="h-5 w-px bg-border/50 hidden md:block" />

        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Activity className="h-3 w-3 text-primary" />
            <span className="text-[10px] font-display text-foreground font-bold tabular-nums">{totalCalls}</span>
            <span className="text-[8px] font-display text-muted-foreground tracking-wider">CALLS</span>
          </div>
          {criticalCount > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />
              <span className="text-[10px] font-display text-destructive font-bold tabular-nums">{criticalCount}</span>
              <span className="text-[8px] font-display text-muted-foreground tracking-wider">CRITICAL</span>
            </div>
          )}
          {weatherCount > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-warning" />
              <span className="text-[10px] font-display text-warning font-bold tabular-nums">{weatherCount}</span>
              <span className="text-[8px] font-display text-muted-foreground tracking-wider">WX ALERTS</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 bg-success/10 px-2 py-0.5 rounded-full">
          <Wifi className="h-2.5 w-2.5 text-success" />
          <span className="text-success text-[8px] font-display tracking-wider">LIVE</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-display text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span className="text-foreground tabular-nums font-medium text-[10px]">
            {time.toLocaleTimeString('en-US', { hour12: false })}
          </span>
          <span className="text-[8px] tracking-wider">CST</span>
        </div>
      </div>
    </header>
  );
};

export default StatusBar;
