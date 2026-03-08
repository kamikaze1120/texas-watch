import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { type Incident, type Severity } from '@/data/mockData';
import { useWeatherAlerts } from '@/hooks/useLiveData';
import { useDispatchData, type DispatchCall } from '@/hooks/useDispatchData';
import 'leaflet/dist/leaflet.css';

const severityColors: Record<Severity, string> = {
  critical: '#ef4444',
  high: '#f59e0b',
  medium: '#14b8a6',
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
    if (incident && incident.lat && incident.lng) {
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
  const { data: weatherAlerts } = useWeatherAlerts();
  const { data: dispatch } = useDispatchData();

  // Use live dispatch data for map markers
  const dispatchCalls = (dispatch?.calls || []).filter(c => c.lat && c.lng);
  const city = cityFilter || 'all';
  const filteredCalls = city === 'all'
    ? dispatchCalls
    : dispatchCalls.filter(c => c.city.toLowerCase().includes(city.toLowerCase()));

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

        {/* Live dispatch markers */}
        {filteredCalls.map((call) => {
          const isSelected = selectedIncident?.id === call.id;
          return (
            <CircleMarker
              key={call.id}
              center={[call.lat!, call.lng!]}
              radius={isSelected ? severityRadius[call.severity] * 1.5 : severityRadius[call.severity]}
              pathOptions={{
                color: severityColors[call.severity],
                fillColor: severityColors[call.severity],
                fillOpacity: isSelected ? 0.9 : 0.6,
                weight: isSelected ? 2 : 1,
              }}
            >
              <Popup>
                <div className="font-body text-xs">
                  <p className="font-bold text-sm">{call.callType}</p>
                  <p className="text-gray-600 mt-1">{call.location}</p>
                  <p className="mt-1 text-gray-500">{call.city} • {call.source}</p>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    call.severity === 'critical' ? 'bg-red-100 text-red-700' :
                    call.severity === 'high' ? 'bg-amber-100 text-amber-700' :
                    'bg-teal-100 text-teal-700'
                  }`}>
                    {call.severity}
                  </span>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* Weather overlay */}
      {weatherAlerts && weatherAlerts.length > 0 && (
        <div className="absolute top-3 right-3 z-[1000] max-w-xs">
          <div className="glass-panel rounded-md p-2.5">
            <p className="text-[7px] font-display text-warning mb-1.5 tracking-[0.15em]">⚠ WEATHER ALERTS</p>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {weatherAlerts.slice(0, 4).map((alert) => (
                <div key={alert.id} className="border-l border-warning/40 pl-1.5">
                  <p className="text-[9px] font-medium text-foreground leading-tight">{alert.event}</p>
                  <p className="text-[7px] text-muted-foreground truncate">{alert.areas}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-3 left-3 z-[1000] glass-panel rounded-md p-2.5">
        <p className="text-[7px] font-display text-muted-foreground mb-1.5 tracking-[0.15em]">SEVERITY</p>
        <div className="flex flex-col gap-1">
          {(['critical', 'high', 'medium', 'low'] as Severity[]).map((s) => (
            <div key={s} className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: severityColors[s] }} />
              <span className="text-[8px] font-display text-foreground/80 uppercase">{s}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Count */}
      <div className="absolute top-3 left-3 z-[1000] glass-panel rounded-md px-2.5 py-1.5">
        <p className="text-[7px] font-display text-muted-foreground tracking-[0.15em]">LIVE MARKERS</p>
        <p className="text-sm font-display font-bold text-primary tabular-nums">{filteredCalls.length}</p>
      </div>
    </div>
  );
};

export default TacticalMap;
