import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { type Incident, type Severity } from '@/data/mockData';
import { useWeatherAlerts } from '@/hooks/useLiveData';
import { useDispatchData } from '@/hooks/useDispatchData';
import { useCameras, cameraSnapshotUrl } from '@/hooks/useCameras';
import { Camera as CameraIcon } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

const severityColors: Record<Severity, string> = {
  critical: '#BF0A30',
  high: '#d97706',
  medium: '#002868',
  low: '#6b7280',
};

const severityRadius: Record<Severity, number> = {
  critical: 10,
  high: 7,
  medium: 5,
  low: 4,
};

function toFiniteCoord(value: unknown): number | null {
  const parsed = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;
  return Number.isFinite(parsed) ? parsed : null;
}

function isValidLatLng(lat: number | null, lng: number | null): lat is number {
  return lat !== null && lng !== null && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

const cameraIcon = L.divIcon({
  className: '',
  html: `<div style="background:#002868;border:2px solid #fff;border-radius:9999px;width:22px;height:22px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,.35)"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

function FlyToIncident({ incident }: { incident: Incident | null }) {
  const map = useMap();
  useEffect(() => {
    const lat = toFiniteCoord(incident?.lat);
    const lng = toFiniteCoord(incident?.lng);
    if (isValidLatLng(lat, lng)) {
      try {
        map.flyTo([lat, lng], 12, { duration: 1 });
      } catch {
        /* ignore */
      }
    }
  }, [incident, map]);
  return null;
}

const cityCenters: Record<string, { center: [number, number]; zoom: number }> = {
  all: { center: [31.0, -99.5], zoom: 6 },
  austin: { center: [30.2672, -97.7431], zoom: 11 },
  dallas: { center: [32.7767, -96.797], zoom: 11 },
  houston: { center: [29.7604, -95.3698], zoom: 11 },
  'san antonio': { center: [29.4241, -98.4936], zoom: 11 },
  arlington: { center: [32.7357, -97.1081], zoom: 12 },
};

const cityToMetro: Record<string, string> = {
  austin: 'austin',
  dallas: 'dallas',
  houston: 'houston',
  'san antonio': 'sanantonio',
};

function FlyToCity({ cityFilter }: { cityFilter: string }) {
  const map = useMap();
  useEffect(() => {
    const normalized = cityFilter.toLowerCase();
    const target = cityCenters[normalized] ?? cityCenters.all;
    try {
      map.flyTo(target.center, target.zoom, { duration: 0.8 });
    } catch {
      /* ignore */
    }
  }, [cityFilter, map]);
  return null;
}

interface TacticalMapProps {
  selectedIncident: Incident | null;
  cityFilter: string;
}

const TacticalMap = ({ selectedIncident, cityFilter }: TacticalMapProps) => {
  const { data: weatherAlerts } = useWeatherAlerts();
  const { data: dispatch } = useDispatchData(cityFilter === 'all' ? 'all' : cityFilter.toLowerCase());

  const [showCameras, setShowCameras] = useState(false);
  const [bust, setBust] = useState(Date.now());

  const normalizedCity = cityFilter.toLowerCase();
  const cameraMetro = cityToMetro[normalizedCity] || 'austin';
  const { data: cameraData } = useCameras(cameraMetro);
  const cameras = showCameras ? cameraData?.cameras || [] : [];

  useEffect(() => {
    if (!showCameras) return;
    const id = setInterval(() => setBust(Date.now()), 30000);
    return () => clearInterval(id);
  }, [showCameras]);

  const allCalls = dispatch?.calls || [];
  const filteredCalls = allCalls.flatMap((call) => {
    const lat = toFiniteCoord(call.lat);
    const lng = toFiniteCoord(call.lng);
    if (!isValidLatLng(lat, lng)) return [];
    return [{ ...call, lat, lng }];
  });

  const center: [number, number] = [31.0, -99.5];

  return (
    <div className="relative w-full h-full">
      <MapContainer center={center} zoom={6} className="w-full h-full" zoomControl={true} attributionControl={true}>
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
        />

        <FlyToCity cityFilter={cityFilter} />
        <FlyToIncident incident={selectedIncident} />

        {filteredCalls.map((call, idx) => {
          const isSelected = selectedIncident?.id === call.id;
          return (
            <CircleMarker
              key={`${call.id}-${idx}`}
              center={[call.lat, call.lng]}
              radius={isSelected ? severityRadius[call.severity] * 2 : severityRadius[call.severity]}
              pathOptions={{
                color: severityColors[call.severity],
                fillColor: severityColors[call.severity],
                fillOpacity: isSelected ? 0.95 : 0.75,
                weight: isSelected ? 3 : 1.5,
              }}
            >
              <Popup>
                <div className="font-body min-w-[200px]">
                  <p className="font-bold text-base mb-1">{call.callType}</p>
                  <p className="text-sm text-gray-600">{call.location}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-gray-500 text-xs">{call.city} • {call.source}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                        call.severity === 'critical'
                          ? 'bg-red-100 text-red-700'
                          : call.severity === 'high'
                          ? 'bg-amber-100 text-amber-700'
                          : call.severity === 'medium'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {call.severity}
                    </span>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}

        {cameras.map((cam) => (
          <Marker key={cam.id} position={[cam.lat, cam.lng]} icon={cameraIcon}>
            <Popup>
              <div className="font-body min-w-[240px]">
                <p className="font-bold text-sm mb-1">{cam.name}</p>
                <img
                  src={cameraSnapshotUrl(cameraMetro, cam.id, bust)}
                  alt={cam.name}
                  className="w-full rounded-md bg-gray-100"
                  loading="lazy"
                />
                <p className="text-xs text-gray-500 mt-1">{cam.roadway} • {cam.direction}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Camera toggle */}
      <button
        onClick={() => setShowCameras((s) => !s)}
        className={`absolute top-3 right-3 z-[1000] flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-display font-semibold transition-all shadow-md ${
          showCameras ? 'bg-primary text-primary-foreground' : 'glass-panel text-foreground'
        }`}
      >
        <CameraIcon className="h-3.5 w-3.5" />
        CAMERAS {showCameras && cameras.length > 0 ? `(${cameras.length})` : ''}
      </button>

      {/* Weather overlay */}
      {weatherAlerts && weatherAlerts.length > 0 && (
        <div className="absolute top-16 right-3 z-[1000] max-w-xs">
          <div className="glass-panel rounded-lg p-3">
            <p className="text-xs font-display text-warning mb-2 tracking-wide font-bold">⚠ WEATHER ALERTS</p>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {weatherAlerts.slice(0, 4).map((alert) => (
                <div key={alert.id} className="border-l-2 border-warning/60 pl-2">
                  <p className="text-sm font-semibold text-foreground leading-tight">{alert.event}</p>
                  <p className="text-xs text-muted-foreground truncate">{alert.areas}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-3 left-3 z-[1000] glass-panel rounded-lg p-3 hidden sm:block">
        <p className="text-[11px] font-display text-muted-foreground mb-2 tracking-wide font-bold">SEVERITY</p>
        <div className="flex flex-col gap-1.5">
          {(['critical', 'high', 'medium', 'low'] as Severity[]).map((s) => (
            <div key={s} className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: severityColors[s] }} />
              <span className="text-xs font-display text-foreground/80 uppercase tracking-wide">{s}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Count */}
      <div className="absolute top-3 left-3 z-[1000] glass-panel rounded-lg px-4 py-3">
        <p className="text-[11px] font-display text-muted-foreground tracking-wide">LIVE INCIDENTS</p>
        <p className="text-2xl font-display font-bold text-primary tabular-nums">{filteredCalls.length}</p>
        {dispatch?.cities && (
          <div className="flex gap-2 mt-1">
            {Object.entries(dispatch.cities).map(([city, count]) => (
              <span key={city} className="text-[11px] font-display text-muted-foreground">
                {city.slice(0, 3).toUpperCase()} <span className="text-foreground font-bold">{count as number}</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TacticalMap;
