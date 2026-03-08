import { mockIncidents, type Incident, type Severity } from '@/data/mockData';

const severityStyles: Record<Severity, string> = {
  critical: 'bg-destructive border-destructive/70',
  high: 'bg-warning border-warning/70',
  medium: 'bg-primary border-primary/70',
  low: 'bg-muted-foreground border-muted-foreground/70',
};

const TEXAS_BOUNDS = {
  minLat: 25.8,
  maxLat: 36.5,
  minLng: -106.7,
  maxLng: -93.5,
};

const getPosition = (lat: number, lng: number) => {
  const x = ((lng - TEXAS_BOUNDS.minLng) / (TEXAS_BOUNDS.maxLng - TEXAS_BOUNDS.minLng)) * 100;
  const y = 100 - ((lat - TEXAS_BOUNDS.minLat) / (TEXAS_BOUNDS.maxLat - TEXAS_BOUNDS.minLat)) * 100;
  return {
    left: `${Math.min(98, Math.max(2, x))}%`,
    top: `${Math.min(98, Math.max(2, y))}%`,
  };
};

interface TacticalMapProps {
  selectedIncident: Incident | null;
}

const TacticalMap = ({ selectedIncident }: TacticalMapProps) => {
  return (
    <div className="relative w-full h-full tactical-grid overflow-hidden bg-background">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary/30" />

      {mockIncidents.map((incident) => {
        const pos = getPosition(incident.lat, incident.lng);
        const isSelected = selectedIncident?.id === incident.id;

        return (
          <div
            key={incident.id}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={pos}
            title={`${incident.id}: ${incident.title}`}
          >
            <div
              className={`rounded-full border ${severityStyles[incident.severity]} ${isSelected ? 'h-4 w-4 animate-pulse-glow' : incident.severity === 'critical' ? 'h-3.5 w-3.5 animate-pulse-glow' : 'h-3 w-3'}`}
            />
          </div>
        );
      })}

      {selectedIncident && (
        <div className="absolute top-4 right-4 z-20 max-w-xs bg-card/95 border border-border rounded p-3">
          <p className="text-[10px] font-display text-primary mb-1">SELECTED INCIDENT</p>
          <p className="text-xs font-semibold text-foreground">
            {selectedIncident.id}: {selectedIncident.title}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">{selectedIncident.location}</p>
          <p className="text-[11px] text-foreground/90 mt-1">{selectedIncident.description}</p>
        </div>
      )}

      <div className="absolute bottom-4 left-4 z-20 bg-card/90 backdrop-blur-sm border border-border rounded p-3">
        <p className="text-[10px] font-display text-muted-foreground mb-2">THREAT LEVEL</p>
        <div className="flex flex-col gap-1.5">
          {(['critical', 'high', 'medium', 'low'] as Severity[]).map((s) => (
            <div key={s} className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${severityStyles[s]}`} />
              <span className="text-[10px] font-display text-foreground uppercase">{s}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TacticalMap;

