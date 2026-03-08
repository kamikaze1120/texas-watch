import { mockIncidents, type Incident, type Severity } from '@/data/mockData';

const severityColors: Record<Severity, string> = {
  critical: 'hsl(0 72% 51%)',
  high: 'hsl(38 92% 50%)',
  medium: 'hsl(199 89% 48%)',
  low: 'hsl(215 12% 48%)',
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
    left: `${Math.min(96, Math.max(4, x))}%`,
    top: `${Math.min(96, Math.max(4, y))}%`,
  };
};

interface TacticalMapProps {
  selectedIncident: Incident | null;
  cityFilter: string;
}

const TacticalMap = ({ selectedIncident, cityFilter }: TacticalMapProps) => {
  const city = cityFilter || 'all';
  const incidents = city === 'all'
    ? mockIncidents
    : mockIncidents.filter(i => i.location.toLowerCase().includes(city.toLowerCase()));

  return (
    <div className="relative w-full h-full bg-background tactical-grid overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary/20" />

      {incidents.map((incident) => {
        const pos = getPosition(incident.lat, incident.lng);
        const isSelected = selectedIncident?.id === incident.id;
        const size = incident.severity === 'critical' ? 14 : incident.severity === 'high' ? 11 : 9;

        return (
          <div
            key={incident.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
            style={pos}
            title={`${incident.id}: ${incident.title}`}
          >
            {/* Pulse ring for critical/selected */}
            {(incident.severity === 'critical' || isSelected) && (
              <div
                className="absolute inset-0 rounded-full animate-ping opacity-30"
                style={{
                  backgroundColor: severityColors[incident.severity],
                  width: size + 8,
                  height: size + 8,
                  top: -4,
                  left: -4,
                }}
              />
            )}
            <div
              className={`rounded-full border-2 transition-transform ${isSelected ? 'scale-150' : 'hover:scale-125'}`}
              style={{
                width: size,
                height: size,
                backgroundColor: severityColors[incident.severity],
                borderColor: severityColors[incident.severity],
                boxShadow: `0 0 ${isSelected ? 16 : 8}px ${severityColors[incident.severity]}`,
              }}
            />
            {/* Tooltip on hover */}
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block z-30 pointer-events-none">
              <div className="glass-panel rounded-lg px-2.5 py-1.5 whitespace-nowrap">
                <p className="text-[10px] font-display text-foreground font-medium">{incident.title}</p>
                <p className="text-[9px] text-muted-foreground">{incident.location}</p>
              </div>
            </div>
          </div>
        );
      })}

      {/* Selected incident detail */}
      {selectedIncident && (
        <div className="absolute top-4 right-4 z-20 max-w-xs glass-panel rounded-lg p-3">
          <p className="text-[9px] font-display text-primary mb-1 tracking-widest">SELECTED INCIDENT</p>
          <p className="text-xs font-semibold text-foreground">
            {selectedIncident.id}: {selectedIncident.title}
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">{selectedIncident.location}</p>
          <p className="text-[10px] text-foreground/80 mt-1">{selectedIncident.description}</p>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-20 glass-panel rounded-lg p-3">
        <p className="text-[9px] font-display text-muted-foreground mb-2 tracking-widest">THREAT LEVEL</p>
        <div className="flex flex-col gap-1.5">
          {(['critical', 'high', 'medium', 'low'] as Severity[]).map((s) => (
            <div key={s} className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: severityColors[s] }} />
              <span className="text-[10px] font-display text-foreground uppercase">{s}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Count */}
      <div className="absolute top-4 left-4 z-20 glass-panel rounded-lg px-3 py-2">
        <p className="text-[9px] font-display text-muted-foreground tracking-widest">ACTIVE MARKERS</p>
        <p className="text-lg font-display font-bold text-primary">{incidents.length}</p>
      </div>
    </div>
  );
};

export default TacticalMap;
