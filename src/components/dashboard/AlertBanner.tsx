import { mockAlerts, type Alert } from '@/data/mockData';
import { AlertTriangle, Baby, Shield, User, CloudLightning } from 'lucide-react';
import { useEffect, useState } from 'react';

const alertIcons: Record<string, React.ElementType> = {
  amber: Baby,
  blue: Shield,
  silver: User,
  weather: CloudLightning,
  emergency: AlertTriangle,
};

const alertStyles: Record<string, string> = {
  amber: 'text-warning',
  blue: 'text-primary',
  silver: 'text-muted-foreground',
  weather: 'text-warning',
  emergency: 'text-destructive',
};

const AlertBanner = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const activeAlerts = mockAlerts.filter(a => a.active);

  useEffect(() => {
    if (activeAlerts.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % activeAlerts.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeAlerts.length]);

  if (activeAlerts.length === 0) return null;
  const alert = activeAlerts[currentIndex];
  const Icon = alertIcons[alert.type];

  return (
    <div className="h-10 bg-card border-t border-border flex items-center px-4 gap-3 shrink-0">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-3.5 w-3.5 text-warning animate-pulse-glow" />
        <span className="text-[10px] font-display text-warning tracking-wider">
          ALERTS ({activeAlerts.length})
        </span>
      </div>
      <div className="h-4 w-px bg-border" />
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Icon className={`h-3.5 w-3.5 shrink-0 ${alertStyles[alert.type]}`} />
        <span className={`text-[10px] font-display uppercase shrink-0 ${alertStyles[alert.type]}`}>
          {alert.type}
        </span>
        <p className="text-xs text-foreground truncate">{alert.title}</p>
        <p className="text-[10px] text-muted-foreground truncate hidden lg:block">— {alert.description}</p>
      </div>
      <div className="flex gap-1">
        {activeAlerts.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`h-1.5 w-1.5 rounded-full transition-colors ${i === currentIndex ? 'bg-warning' : 'bg-muted-foreground/30'}`}
          />
        ))}
      </div>
    </div>
  );
};

export default AlertBanner;
