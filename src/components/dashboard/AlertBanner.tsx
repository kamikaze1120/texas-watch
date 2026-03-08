import { useWeatherAlerts } from '@/hooks/useLiveData';
import { AlertTriangle, CloudLightning } from 'lucide-react';
import { useEffect, useState } from 'react';

const severityStyles: Record<string, string> = {
  critical: 'text-destructive',
  high: 'text-warning',
  medium: 'text-accent-foreground',
  low: 'text-muted-foreground',
};

const AlertBanner = () => {
  const { data: alerts } = useWeatherAlerts();
  const [currentIndex, setCurrentIndex] = useState(0);

  const activeAlerts = alerts || [];

  useEffect(() => {
    if (activeAlerts.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % activeAlerts.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [activeAlerts.length]);

  if (activeAlerts.length === 0) return null;

  const alert = activeAlerts[currentIndex];
  const style = severityStyles[alert.severity] || 'text-muted-foreground';

  return (
    <div className="h-10 bg-card/60 backdrop-blur-sm border-t border-border/50 flex items-center px-4 gap-3 shrink-0">
      <div className="flex items-center gap-1.5">
        <AlertTriangle className="h-3.5 w-3.5 text-warning animate-pulse" />
        <span className="text-xs font-display text-warning tracking-[0.1em]">
          WX ({activeAlerts.length})
        </span>
      </div>
      <div className="h-4 w-px bg-border/50" />
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <CloudLightning className={`h-3.5 w-3.5 shrink-0 ${style}`} />
        <span className={`text-xs font-display uppercase shrink-0 font-bold ${style}`}>
          {alert.event}
        </span>
        <p className="text-sm text-foreground truncate">{alert.areas}</p>
        <p className="text-xs text-muted-foreground truncate hidden lg:block ml-auto">{alert.senderName}</p>
      </div>
      {activeAlerts.length > 1 && (
        <div className="flex gap-0.5">
          {activeAlerts.slice(0, 8).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === currentIndex ? 'bg-warning w-4' : 'bg-muted-foreground/20 w-1.5'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AlertBanner;
