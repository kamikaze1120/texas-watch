import { mockIncidents, type Incident, type IncidentType, type Severity } from '@/data/mockData';
import { AlertTriangle, Car, Flame, Heart, Shield, CloudLightning, Biohazard, Filter } from 'lucide-react';
import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

const typeIcons: Record<IncidentType, React.ElementType> = {
  crime: Shield,
  traffic: Car,
  fire: Flame,
  medical: Heart,
  alert: AlertTriangle,
  weather: CloudLightning,
  hazard: Biohazard,
};

const severityColors: Record<Severity, string> = {
  critical: 'bg-destructive',
  high: 'bg-warning',
  medium: 'bg-primary',
  low: 'bg-muted-foreground',
};

const statusLabels: Record<string, string> = {
  active: 'ACTIVE',
  responding: 'RESPONDING',
  resolved: 'RESOLVED',
};

const formatTime = (ts: string) => {
  const d = new Date(ts);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 60000);
  if (diff < 1) return 'JUST NOW';
  if (diff < 60) return `${diff}m AGO`;
  return `${Math.floor(diff / 60)}h AGO`;
};

const IncidentCard = ({ incident, onClick }: { incident: Incident; onClick: () => void }) => {
  const Icon = typeIcons[incident.type];
  return (
    <button
      onClick={onClick}
      className="w-full text-left p-3 border-b border-border hover:bg-secondary/50 transition-colors animate-slide-in"
    >
      <div className="flex items-start gap-2.5">
        <div className={`p-1.5 rounded ${incident.severity === 'critical' ? 'bg-destructive/20 text-destructive' : incident.severity === 'high' ? 'bg-warning/20 text-warning' : 'bg-primary/20 text-primary'}`}>
          <Icon className="h-3.5 w-3.5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={`h-1.5 w-1.5 rounded-full ${severityColors[incident.severity]} ${incident.severity === 'critical' ? 'animate-pulse-glow' : ''}`} />
            <span className="text-[10px] font-display text-muted-foreground">{incident.id}</span>
            <span className="text-[10px] font-display text-muted-foreground ml-auto">{formatTime(incident.timestamp)}</span>
          </div>
          <p className="text-xs font-medium text-foreground truncate">{incident.title}</p>
          <p className="text-[10px] text-muted-foreground truncate mt-0.5">{incident.location}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className={`text-[9px] font-display px-1.5 py-0.5 rounded ${
              incident.status === 'active' ? 'bg-destructive/20 text-destructive' :
              incident.status === 'responding' ? 'bg-warning/20 text-warning' :
              'bg-success/20 text-success'
            }`}>
              {statusLabels[incident.status]}
            </span>
            <span className="text-[9px] text-muted-foreground font-display">{incident.source}</span>
          </div>
        </div>
      </div>
    </button>
  );
};

interface IncidentFeedProps {
  onSelectIncident: (incident: Incident) => void;
}

const IncidentFeed = ({ onSelectIncident }: IncidentFeedProps) => {
  const [filter, setFilter] = useState<IncidentType | 'all'>('all');
  const filtered = filter === 'all' ? mockIncidents : mockIncidents.filter(i => i.type === filter);

  const types: (IncidentType | 'all')[] = ['all', 'crime', 'traffic', 'fire', 'medical', 'weather', 'hazard'];

  return (
    <div className="flex flex-col h-full bg-card border-r border-border">
      <div className="p-3 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-display text-xs font-semibold tracking-wider text-primary">
            INCIDENT FEED
          </h2>
          <span className="text-[10px] font-display text-muted-foreground">
            {filtered.length} INCIDENTS
          </span>
        </div>
        <div className="flex gap-1 flex-wrap">
          {types.map(t => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`text-[9px] font-display px-2 py-1 rounded transition-colors ${
                filter === t
                  ? 'bg-primary/20 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      <ScrollArea className="flex-1">
        {filtered.map(incident => (
          <IncidentCard
            key={incident.id}
            incident={incident}
            onClick={() => onSelectIncident(incident)}
          />
        ))}
      </ScrollArea>
    </div>
  );
};

export default IncidentFeed;
