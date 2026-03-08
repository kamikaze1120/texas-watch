import { Shield, Clock, Radio, AlertTriangle } from 'lucide-react';
import { statsData } from '@/data/mockData';
import { useEffect, useState } from 'react';

const StatusBar = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-12 bg-card border-b border-border flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-3">
        <Shield className="h-5 w-5 text-primary" />
        <h1 className="font-display text-sm font-bold tracking-wider text-primary text-glow-primary">
          TPSIP
        </h1>
        <span className="text-xs text-muted-foreground font-display hidden sm:inline">
          TEXAS PUBLIC SAFETY INTELLIGENCE PLATFORM
        </span>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4 text-xs font-display">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-success animate-pulse-glow" />
            <span className="text-muted-foreground">SYSTEM ONLINE</span>
          </div>
          <div className="hidden md:flex items-center gap-1.5">
            <Radio className="h-3.5 w-3.5 text-primary" />
            <span className="text-foreground">{statsData.activeIncidents}</span>
            <span className="text-muted-foreground">ACTIVE</span>
          </div>
          <div className="hidden md:flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
            <span className="text-destructive">{statsData.criticalIncidents}</span>
            <span className="text-muted-foreground">CRITICAL</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-display text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span className="text-foreground tabular-nums">
            {time.toLocaleTimeString('en-US', { hour12: false })}
          </span>
          <span className="hidden sm:inline">CST</span>
        </div>
      </div>
    </header>
  );
};

export default StatusBar;
