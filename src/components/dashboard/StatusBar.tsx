import { Shield, Clock, Radio, AlertTriangle, Wifi } from 'lucide-react';
import { statsData } from '@/data/mockData';
import { useEffect, useState } from 'react';

const StatusBar = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-14 bg-card border-b border-border flex items-center justify-between px-5 shrink-0">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-primary/15 glow-primary">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-sm font-bold tracking-wider text-primary text-glow-primary leading-none">
              TPSIP
            </h1>
            <span className="text-[9px] text-muted-foreground font-display leading-none hidden sm:block">
              TEXAS PUBLIC SAFETY INTELLIGENCE
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-5">
        <div className="flex items-center gap-4 text-xs font-display">
          <div className="flex items-center gap-1.5 bg-success/10 px-2.5 py-1 rounded-full">
            <Wifi className="h-3 w-3 text-success" />
            <span className="text-success text-[10px]">ONLINE</span>
          </div>
          <div className="hidden md:flex items-center gap-1.5">
            <Radio className="h-3.5 w-3.5 text-primary" />
            <span className="text-foreground font-bold">{statsData.activeIncidents}</span>
            <span className="text-muted-foreground text-[10px]">ACTIVE</span>
          </div>
          <div className="hidden md:flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
            <span className="text-destructive font-bold">{statsData.criticalIncidents}</span>
            <span className="text-muted-foreground text-[10px]">CRITICAL</span>
          </div>
        </div>

        <div className="h-6 w-px bg-border" />

        <div className="flex items-center gap-1.5 text-xs font-display text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span className="text-foreground tabular-nums font-medium">
            {time.toLocaleTimeString('en-US', { hour12: false })}
          </span>
          <span className="hidden sm:inline text-[10px]">CST</span>
        </div>
      </div>
    </header>
  );
};

export default StatusBar;
