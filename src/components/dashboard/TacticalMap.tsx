import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { mockIncidents, type Incident, type Severity } from '@/data/mockData';
import { useWeatherAlerts } from '@/hooks/useLiveData';
import 'leaflet/dist/leaflet.css';

const severityColors: Record<Severity, string> = {
  critical: '#ef4444',
  high: '#f59e0b',
  medium: '#0ea5e9',
  low: '#6b7280',
};

const severityRadius: Record<Severity, number> = {
  critical: 12,
  high: 9,
  medium: 7,
  low: 5,
};

// Component to fly to selected incident
function FlyToIncident({ incident }: { incident: Incident | null }) {
  const map = useMap();
  useEffect(() => {
    if (incident) {
      map.flyTo([incident.lat, incident.lng], 11, { duration: 1 });
    }
  }, [incident, map]);
  return null;
}

interface TacticalMapProps {
  selectedIncident: Incident | null;
  cityFilter: string;
}

const TacticalMap = ({ selectedIncident, cityFilter }: TacticalMapProps) => {
  const city = cityFilter || 'all';
  const incidents = city === 'all'
    ? mockIncidents
    : mockIncidents.filter(i => i.location?.toLowerCase().includes(city.toLowerCase()));

  const { data: weatherAlerts } = useWeatherAlerts();

  // Texas center
  const center: [number, number] = [31.0, -99.5];

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={center}
        zoom={6}
        className="w-full h-full"
        zoomControl={true}
        attributionControl={true}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
        />

        <FlyToIncident incident={selectedIncident} />

        {incidents.map((incident) => {
          const isSelected = selectedIncident?.id === incident.id;
          return (
            <CircleMarker
              key={incident.id}
              center={[incident.lat, incident.lng]}
              radius={isSelected ? severityRadius[incident.severity] * 1.5 : severityRadius[incident.severity]}
              pathOptions={{
                color: severityColors[incident.severity],
                fillColor: severityColors[incident.severity],
                fillOpacity: isSelected ? 0.9 : 0.7,
                weight: isSelected ? 3 : 1.5,
              }}
            >
              <Popup>
                <div className="font-body text-xs">
                  <p className="font-bold text-sm">{incident.id}: {incident.title}</p>
                  <p className="text-gray-600 mt-1">{incident.location}</p>
                  <p className="mt-1">{incident.description}</p>
                  <p className="mt-1 text-gray-500">Source: {incident.source}</p>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    incident.severity === 'critical' ? 'bg-red-100 text-red-700' :
                    incident.severity === 'high' ? 'bg-amber-100 text-amber-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {incident.severity}
                  </span>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* Live Weather Overlay */}
      {weatherAlerts && weatherAlerts.length > 0 && (
        <div className="absolute top-4 right-4 z-[1000] max-w-xs">
          <div className="glass-panel rounded-lg p-3">
            <p className="text-[9px] font-display text-warning mb-2 tracking-widest">⚠ LIVE WEATHER ALERTS</p>
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {weatherAlerts.slice(0, 5).map((alert) => (
                <div key={alert.id} className="border-l-2 border-warning pl-2">
                  <p className="text-[10px] font-medium text-foreground leading-tight">{alert.event}</p>
                  <p className="text-[9px] text-muted-foreground truncate">{alert.areas}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] glass-panel rounded-lg p-3">
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
      <div className="absolute top-4 left-4 z-[1000] glass-panel rounded-lg px-3 py-2">
        <p className="text-[9px] font-display text-muted-foreground tracking-widest">ACTIVE MARKERS</p>
        <p className="text-lg font-display font-bold text-primary">{incidents.length}</p>
      </div>
    </div>
  );
};

export default TacticalMap;
