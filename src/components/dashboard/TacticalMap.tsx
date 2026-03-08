import { mockIncidents, type Incident, type Severity } from '@/data/mockData';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';

const severityColors: Record<Severity, string> = {
  critical: '#ef4444',
  high: '#f59e0b',
  medium: '#0ea5e9',
  low: '#6b7280',
};

const severityRadius: Record<Severity, number> = {
  critical: 10,
  high: 8,
  medium: 6,
  low: 5,
};

const FlyToIncident = ({ incident }: { incident: Incident | null }) => {
  const map = useMap();
  useEffect(() => {
    if (incident) {
      map.flyTo([incident.lat, incident.lng], 12, { duration: 1 });
    }
  }, [incident, map]);
  return null;
};

interface TacticalMapProps {
  selectedIncident: Incident | null;
  cityFilter: string;
}

const TacticalMap = ({ selectedIncident, cityFilter }: TacticalMapProps) => {
  const incidents = cityFilter === 'all'
    ? mockIncidents
    : mockIncidents.filter(i => i.location.toLowerCase().includes(cityFilter.toLowerCase()));

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={[31.0, -100.0]}
        zoom={6}
        className="w-full h-full z-0"
        zoomControl={true}
        attributionControl={true}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com">CARTO</a>'
        />

        {incidents.map((incident) => (
          <CircleMarker
            key={incident.id}
            center={[incident.lat, incident.lng]}
            radius={severityRadius[incident.severity]}
            pathOptions={{
              color: severityColors[incident.severity],
              fillColor: severityColors[incident.severity],
              fillOpacity: 0.6,
              weight: 2,
              opacity: 0.9,
            }}
          >
            <Popup>
              <div className="min-w-[200px]">
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: severityColors[incident.severity] }}
                  />
                  <span className="font-display text-[10px] tracking-wider" style={{ color: severityColors[incident.severity] }}>
                    {incident.severity.toUpperCase()}
                  </span>
                  <span className="text-[10px] font-display opacity-60 ml-auto">{incident.id}</span>
                </div>
                <p className="font-semibold text-xs mb-1">{incident.title}</p>
                <p className="text-[11px] opacity-70 mb-1.5">{incident.location}</p>
                <p className="text-[11px] opacity-80">{incident.description}</p>
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/30">
                  <span className="text-[9px] font-display uppercase opacity-50">{incident.source}</span>
                  <span className={`text-[9px] font-display px-1.5 py-0.5 rounded-full ${
                    incident.status === 'active' ? 'bg-destructive/20 text-destructive' :
                    incident.status === 'responding' ? 'bg-warning/20 text-warning' :
                    'bg-success/20 text-success'
                  }`}>
                    {incident.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        <FlyToIncident incident={selectedIncident} />
      </MapContainer>

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] glass-panel rounded-lg p-3">
        <p className="text-[9px] font-display text-muted-foreground mb-2 tracking-widest">THREAT LEVEL</p>
        <div className="flex flex-col gap-1.5">
          {(['critical', 'high', 'medium', 'low'] as Severity[]).map((s) => (
            <div key={s} className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: severityColors[s] }}
              />
              <span className="text-[10px] font-display text-foreground uppercase">{s}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Incident count overlay */}
      <div className="absolute top-4 right-4 z-[1000] glass-panel rounded-lg px-3 py-2">
        <p className="text-[9px] font-display text-muted-foreground tracking-widest">ACTIVE MARKERS</p>
        <p className="text-lg font-display font-bold text-primary">{incidents.length}</p>
      </div>
    </div>
  );
};

export default TacticalMap;
