import { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { type Incident, type Severity } from '@/data/mockData';
import { useWeatherAlerts } from '@/hooks/useLiveData';
import { useDispatchData, type DispatchCall } from '@/hooks/useDispatchData';
import 'leaflet/dist/leaflet.css';

const severityColors: Record<Severity, string> = {
  critical: '#BF0A30',
  high: '#f59e0b',
  medium: '#1a3a7a',
  low: '#6b7280',
};

const severityRadius: Record<Severity, number> = {
  critical: 10,
  high: 7,
  medium: 5,
  low: 4,
};

function FlyToIncident({ incident }: { incident: Incident | null }) {
  const map = useMap();
  useEffect(() => {
    if (incident && typeof incident.lat === 'number' && typeof incident.lng === 'number' && isFinite(incident.lat) && isFinite(incident.lng)) {
      map.flyTo([incident.lat, incident.lng], 12, { duration: 1 });
    }
  }, [incident, map]);
  return null;
}

interface TacticalMapProps {
  selectedIncident: Incident | null;
  cityFilter: string;
}

const TacticalMap = ({ selectedIncident, cityFilter }: TacticalMapProps) => {
  const { data: weatherAlerts } = useWeatherAlerts();
  const { data: dispatch } = useDispatchData(cityFilter === 'all' ? 'all' : cityFilter.toLowerCase());

  const allCalls = dispatch?.calls || [];
  const filteredCalls = allCalls.filter(c => c.lat != null && c.lng != null);

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

        {filteredCalls.map((call, idx) => {
          const isSelected = selectedIncident?.id === call.id;
          return (
            <CircleMarker
              key={`${call.id}-${idx}`}
              center={[call.lat!, call.lng!]}
              radius={isSelected ? severityRadius[call.severity] * 2 : severityRadius[call.severity]}
              pathOptions={{
                color: severityColors[call.severity],
                fillColor: severityColors[call.severity],
                fillOpacity: isSelected ? 0.95 : 0.7,
                weight: isSelected ? 3 : 1.5,
              }}
            >
              <Popup>
                <div className="font-body min-w-[200px]">
                  <p className="font-bold text-base mb-1">{call.callType}</p>
                  <p className="text-sm text-gray-400">{call.location}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-gray-500 text-xs">{call.city} • {call.source}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                      call.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                      call.severity === 'high' ? 'bg-amber-500/20 text-amber-400' :
                      call.severity === 'medium' ? 'bg-blue-800/20 text-blue-300' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {call.severity}
                    </span>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* Weather overlay */}
      {weatherAlerts && weatherAlerts.length > 0 && (
        <div className="absolute top-3 right-3 z-[1000] max-w-xs">
          <div className="glass-panel rounded-lg p-3">
            <p className="text-xs font-display text-warning mb-2 tracking-[0.1em] font-bold">⚠ WEATHER ALERTS</p>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {weatherAlerts.slice(0, 4).map((alert) => (
                <div key={alert.id} className="border-l-2 border-warning/50 pl-2">
                  <p className="text-sm font-semibold text-foreground leading-tight">{alert.event}</p>
                  <p className="text-xs text-muted-foreground truncate">{alert.areas}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-3 left-3 z-[1000] glass-panel rounded-lg p-3">
        <p className="text-[10px] font-display text-muted-foreground mb-2 tracking-[0.15em] font-bold">SEVERITY</p>
        <div className="flex flex-col gap-2">
          {(['critical', 'high', 'medium', 'low'] as Severity[]).map((s) => (
            <div key={s} className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: severityColors[s] }} />
              <span className="text-xs font-display text-foreground/80 uppercase tracking-wider">{s}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Count */}
      <div className="absolute top-3 left-3 z-[1000] glass-panel rounded-lg px-4 py-3">
        <p className="text-[10px] font-display text-muted-foreground tracking-[0.15em]">LIVE INCIDENTS</p>
        <p className="text-2xl font-display font-bold text-primary tabular-nums text-glow-primary">{filteredCalls.length}</p>
        {dispatch?.cities && (
          <div className="flex gap-2 mt-1">
            {Object.entries(dispatch.cities).map(([city, count]) => (
              <span key={city} className="text-[10px] font-display text-muted-foreground">
                {city.slice(0,3).toUpperCase()} <span className="text-foreground font-bold">{count as number}</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TacticalMap;
