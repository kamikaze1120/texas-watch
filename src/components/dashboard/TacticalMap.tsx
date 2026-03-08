import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { mockIncidents, type Incident, type Severity } from '@/data/mockData';

const severityColorMap: Record<Severity, string> = {
  critical: '#ef4444',
  high: '#f59e0b',
  medium: '#22b8cf',
  low: '#64748b',
};

const severityRadius: Record<Severity, number> = {
  critical: 10,
  high: 8,
  medium: 6,
  low: 5,
};

interface TacticalMapProps {
  selectedIncident: Incident | null;
}

const FlyToIncident = ({ incident }: { incident: Incident | null }) => {
  const map = useMap();
  useEffect(() => {
    if (incident) {
      map.flyTo([incident.lat, incident.lng], 11, { duration: 1 });
    }
  }, [incident, map]);
  return null;
};

const TacticalMap = ({ selectedIncident }: TacticalMapProps) => {
  return (
    <div className="relative w-full h-full tactical-grid">
      <MapContainer
        center={[31.0, -99.5]}
        zoom={6}
        className="w-full h-full"
        zoomControl={true}
        attributionControl={true}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
        />
        {mockIncidents.map(incident => (
          <CircleMarker
            key={incident.id}
            center={[incident.lat, incident.lng]}
            radius={severityRadius[incident.severity]}
            pathOptions={{
              color: severityColorMap[incident.severity],
              fillColor: severityColorMap[incident.severity],
              fillOpacity: 0.6,
              weight: 2,
              opacity: incident.severity === 'critical' ? 1 : 0.8,
            }}
          >
            <Popup className="tactical-popup">
              <div className="font-body text-xs">
                <p className="font-semibold">{incident.id}: {incident.title}</p>
                <p className="text-muted-foreground mt-1">{incident.location}</p>
                <p className="mt-1">{incident.description}</p>
                <div className="flex gap-2 mt-2">
                  <span className="uppercase text-[10px] font-display">{incident.severity}</span>
                  <span className="uppercase text-[10px] font-display">{incident.status}</span>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
        <FlyToIncident incident={selectedIncident} />
      </MapContainer>

      {/* Map overlay legend */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-card/90 backdrop-blur-sm border border-border rounded p-3">
        <p className="text-[10px] font-display text-muted-foreground mb-2">THREAT LEVEL</p>
        <div className="flex flex-col gap-1.5">
          {(['critical', 'high', 'medium', 'low'] as Severity[]).map(s => (
            <div key={s} className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: severityColorMap[s] }} />
              <span className="text-[10px] font-display text-foreground uppercase">{s}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TacticalMap;
