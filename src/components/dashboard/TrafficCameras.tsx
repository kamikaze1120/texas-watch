import { useState, useEffect } from 'react';
import { Camera, RefreshCw, MapPin, AlertCircle, ExternalLink } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TrafficCamera {
  id: string;
  name: string;
  txdotName: string; // Exact name for TxDOT snapshot URL
  district: string;
  city: string;
  roadway: string;
}

const DISTRICTS = [
  { code: 'LBB', name: 'Lubbock' },
  { code: 'AMA', name: 'Amarillo' },
  { code: 'TYL', name: 'Tyler' },
  { code: 'ATL', name: 'Atlanta' },
  { code: 'ELP', name: 'El Paso' },
  { code: 'ODA', name: 'Odessa' },
  { code: 'CRP', name: 'Corpus Christi' },
  { code: 'SAT', name: 'San Antonio' },
  { code: 'AUS', name: 'Austin' },
  { code: 'WAC', name: 'Waco' },
  { code: 'DAL', name: 'Dallas' },
  { code: 'FTW', name: 'Fort Worth' },
  { code: 'HOU', name: 'Houston' },
  { code: 'BMT', name: 'Beaumont' },
];

// Real TxDOT camera names that match snapshot URL pattern
const CAMERA_DATA: Record<string, TrafficCamera[]> = {
  LBB: [
    { id: 'LBB-001', name: 'Marsha Sharp @ TTU Parkway', txdotName: 'Marsha Sharp Fwy @ TTU Parkway', district: 'LBB', city: 'Lubbock', roadway: 'US-62/82' },
    { id: 'LBB-002', name: 'Marsha Sharp @ Slide', txdotName: 'Marsha Sharp Fwy @ Slide', district: 'LBB', city: 'Lubbock', roadway: 'US-62/82' },
    { id: 'LBB-003', name: 'Loop 289 @ 4th St', txdotName: 'Loop 289 @ 4th St', district: 'LBB', city: 'Lubbock', roadway: 'Loop 289' },
    { id: 'LBB-004', name: 'Loop 289 @ Slide', txdotName: 'Loop 289 @ Slide', district: 'LBB', city: 'Lubbock', roadway: 'Loop 289' },
    { id: 'LBB-005', name: 'IH 27 @ 19th St', txdotName: 'IH 27 @ 19th St', district: 'LBB', city: 'Lubbock', roadway: 'IH-27' },
    { id: 'LBB-006', name: 'IH 27 @ 34th St', txdotName: 'IH 27 @ 34th St', district: 'LBB', city: 'Lubbock', roadway: 'IH-27' },
    { id: 'LBB-007', name: 'IH 27 @ 50th St', txdotName: 'IH 27 @ 50th St', district: 'LBB', city: 'Lubbock', roadway: 'IH-27' },
  ],
  AMA: [
    { id: 'AMA-001', name: 'IH 40 @ Coulter', txdotName: 'IH 40 @ Coulter', district: 'AMA', city: 'Amarillo', roadway: 'IH-40' },
    { id: 'AMA-002', name: 'IH 40 @ Western', txdotName: 'IH 40 @ Western', district: 'AMA', city: 'Amarillo', roadway: 'IH-40' },
    { id: 'AMA-003', name: 'IH 40 @ Soncy', txdotName: 'IH 40 @ Soncy', district: 'AMA', city: 'Amarillo', roadway: 'IH-40' },
  ],
  TYL: [
    { id: 'TYL-001', name: 'IH 20 @ SH 31', txdotName: 'IH 20 @ SH 31', district: 'TYL', city: 'Tyler', roadway: 'IH-20' },
    { id: 'TYL-002', name: 'IH 20 @ SH 42', txdotName: 'IH 20 @ SH 42', district: 'TYL', city: 'Tyler', roadway: 'IH-20' },
    { id: 'TYL-003', name: 'IH 20 @ SH 135', txdotName: 'IH 20 @ SH 135', district: 'TYL', city: 'Tyler', roadway: 'IH-20' },
    { id: 'TYL-004', name: 'IH 20 @ SH 149', txdotName: 'IH 20 @ SH 149', district: 'TYL', city: 'Tyler', roadway: 'IH-20' },
  ],
  CRP: [
    { id: 'CRP-001', name: 'US 181 @ Beach St', txdotName: 'US181 @ Beach St', district: 'CRP', city: 'Corpus Christi', roadway: 'US-181' },
    { id: 'CRP-002', name: 'IH 37 @ US 77', txdotName: 'IH 37 @ US 77', district: 'CRP', city: 'Corpus Christi', roadway: 'IH-37' },
  ],
  ELP: [
    { id: 'ELP-001', name: 'IH 10 @ Airway', txdotName: 'IH 10 @ Airway', district: 'ELP', city: 'El Paso', roadway: 'IH-10' },
    { id: 'ELP-002', name: 'IH 10 @ US 54', txdotName: 'IH 10 @ US 54', district: 'ELP', city: 'El Paso', roadway: 'IH-10' },
  ],
  SAT: [
    { id: 'SAT-001', name: 'IH 35 @ Commerce', txdotName: 'IH 35 @ Commerce', district: 'SAT', city: 'San Antonio', roadway: 'IH-35' },
    { id: 'SAT-002', name: 'IH 10 @ UTSA Blvd', txdotName: 'IH 10 @ UTSA Blvd', district: 'SAT', city: 'San Antonio', roadway: 'IH-10' },
  ],
  AUS: [
    { id: 'AUS-001', name: 'IH 35 @ Riverside', txdotName: 'IH 35 @ Riverside', district: 'AUS', city: 'Austin', roadway: 'IH-35' },
    { id: 'AUS-002', name: 'IH 35 @ 51st St', txdotName: 'IH 35 @ 51st St', district: 'AUS', city: 'Austin', roadway: 'IH-35' },
  ],
  DAL: [
    { id: 'DAL-001', name: 'IH 35E @ Commerce', txdotName: 'IH 35E @ Commerce', district: 'DAL', city: 'Dallas', roadway: 'IH-35E' },
    { id: 'DAL-002', name: 'IH 30 @ Fair Park', txdotName: 'IH 30 @ Fair Park', district: 'DAL', city: 'Dallas', roadway: 'IH-30' },
  ],
  FTW: [
    { id: 'FTW-001', name: 'IH 35W @ IH 30', txdotName: 'IH 35W @ IH 30', district: 'FTW', city: 'Fort Worth', roadway: 'IH-35W' },
    { id: 'FTW-002', name: 'IH 30 @ Camp Bowie', txdotName: 'IH 30 @ Camp Bowie', district: 'FTW', city: 'Fort Worth', roadway: 'IH-30' },
  ],
  HOU: [
    { id: 'HOU-001', name: 'IH 45 @ Allen Pkwy', txdotName: 'IH 45 @ Allen Pkwy', district: 'HOU', city: 'Houston', roadway: 'IH-45' },
    { id: 'HOU-002', name: 'IH 10 @ Bunker Hill', txdotName: 'IH 10 @ Bunker Hill', district: 'HOU', city: 'Houston', roadway: 'IH-10' },
    { id: 'HOU-003', name: 'US 59 @ Kirby', txdotName: 'US 59 @ Kirby', district: 'HOU', city: 'Houston', roadway: 'US-59' },
    { id: 'HOU-004', name: 'IH 610 @ US 59', txdotName: 'IH 610 @ US 59', district: 'HOU', city: 'Houston', roadway: 'IH-610' },
  ],
  BMT: [
    { id: 'BMT-001', name: 'IH 10 @ MLK Pkwy', txdotName: 'IH 10 @ MLK Pkwy', district: 'BMT', city: 'Beaumont', roadway: 'IH-10' },
  ],
  WAC: [
    { id: 'WAC-001', name: 'IH 35 @ University Parks', txdotName: 'IH 35 @ University Parks', district: 'WAC', city: 'Waco', roadway: 'IH-35' },
  ],
  ATL: [],
  ODA: [],
};

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

function getCameraSnapshotUrl(camera: TrafficCamera, refreshKey: number): string {
  return `${SUPABASE_URL}/functions/v1/txdot-camera-proxy?camera=${encodeURIComponent(camera.txdotName)}&district=${camera.district}&_t=${refreshKey}`;
}

const CameraImage = ({ camera, size, refreshKey }: { camera: TrafficCamera; size: 'large' | 'thumb'; refreshKey: number }) => {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const url = getCameraSnapshotUrl(camera, refreshKey);

  const dimensions = size === 'large' ? 'w-full h-full' : 'w-full h-24';

  useEffect(() => {
    setError(false);
    setLoading(true);
  }, [refreshKey, camera.id]);

  if (error) {
    return (
      <div className={`${dimensions} bg-card flex flex-col items-center justify-center gap-2`}>
        <AlertCircle className="h-5 w-5 text-muted-foreground" />
        <p className="text-[9px] font-display text-muted-foreground">FEED UNAVAILABLE</p>
        <p className="text-[8px] text-muted-foreground/60">{camera.txdotName}</p>
      </div>
    );
  }

  return (
    <div className={`${dimensions} relative bg-background`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-card">
          <RefreshCw className="h-4 w-4 text-muted-foreground animate-spin" />
        </div>
      )}
      <img
        src={url}
        alt={`${camera.name} traffic camera`}
        className={`${dimensions} object-cover`}
        onLoad={() => setLoading(false)}
        onError={() => { setError(true); setLoading(false); }}
      />
      {/* OSD overlay */}
      {!loading && !error && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-display text-white/90">{camera.name}</p>
              <p className="text-[8px] text-white/60">{camera.roadway} • {camera.city}</p>
            </div>
            <div className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />
              <span className="text-[8px] font-display text-destructive">LIVE</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TrafficCameras = () => {
  const [selectedDistrict, setSelectedDistrict] = useState('LBB');
  const [selectedCamera, setSelectedCamera] = useState<TrafficCamera | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const cameras = CAMERA_DATA[selectedDistrict] || [];

  useEffect(() => {
    if (cameras.length > 0 && !selectedCamera) {
      setSelectedCamera(cameras[0]);
    }
  }, [selectedDistrict]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-full bg-background">
      {/* District Sidebar */}
      <div className="w-52 shrink-0 border-r border-border flex flex-col bg-card">
        <div className="p-3 border-b border-border">
          <div className="flex items-center gap-2 mb-2">
            <Camera className="h-3.5 w-3.5 text-primary" />
            <h2 className="font-display text-xs font-semibold tracking-widest text-primary">TxDOT CAMS</h2>
          </div>
          <p className="text-[9px] text-muted-foreground">Live traffic camera snapshots via TxDOT ITS</p>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-0.5">
            {DISTRICTS.map(d => {
              const count = (CAMERA_DATA[d.code] || []).length;
              return (
                <button
                  key={d.code}
                  onClick={() => { setSelectedDistrict(d.code); setSelectedCamera(null); }}
                  className={`w-full text-left px-3 py-2 rounded-md text-[10px] font-display tracking-wider transition-all flex items-center justify-between ${
                    selectedDistrict === d.code
                      ? 'bg-primary/15 text-primary ring-1 ring-primary/20'
                      : count > 0
                        ? 'text-foreground hover:bg-secondary/50'
                        : 'text-muted-foreground/50'
                  }`}
                  disabled={count === 0}
                >
                  <span>{d.name.toUpperCase()}</span>
                  <span className="text-[9px] text-muted-foreground">{count}</span>
                </button>
              );
            })}
          </div>
        </ScrollArea>

        <div className="p-3 border-t border-border">
          <button
            onClick={() => setRefreshKey(prev => prev + 1)}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-display tracking-wider bg-primary/15 text-primary hover:bg-primary/25 transition-all"
          >
            <RefreshCw className="h-3 w-3" />
            REFRESH ALL
          </button>
          <a
            href={`https://its.txdot.gov/its/District/${selectedDistrict}/cameras`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 mt-1.5 rounded-md text-[10px] font-display tracking-wider text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all"
          >
            <ExternalLink className="h-3 w-3" />
            VIEW ON TxDOT
          </a>
        </div>
      </div>

      {/* Main View */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Camera selector */}
        <div className="h-10 bg-card/50 border-b border-border flex items-center px-3 gap-1 overflow-x-auto shrink-0">
          {cameras.map(cam => (
            <button
              key={cam.id}
              onClick={() => setSelectedCamera(cam)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-display tracking-wider transition-all shrink-0 ${
                selectedCamera?.id === cam.id
                  ? 'bg-primary/15 text-primary ring-1 ring-primary/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
              }`}
            >
              <Camera className="h-3 w-3" />
              {cam.name}
            </button>
          ))}
          {cameras.length === 0 && (
            <p className="text-[10px] text-muted-foreground font-display">No cameras available for this district</p>
          )}
        </div>

        {/* Main camera feed */}
        <div className="flex-1 min-h-0 relative">
          {selectedCamera ? (
            <CameraImage camera={selectedCamera} size="large" refreshKey={refreshKey} />
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Camera className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-xs text-muted-foreground font-display">SELECT A CAMERA</p>
              </div>
            </div>
          )}
        </div>

        {/* Thumbnail strip */}
        {cameras.length > 1 && (
          <div className="h-28 border-t border-border flex gap-0.5 overflow-x-auto bg-card/50 p-1 shrink-0">
            {cameras.map(cam => (
              <button
                key={cam.id}
                onClick={() => setSelectedCamera(cam)}
                className={`shrink-0 w-36 rounded overflow-hidden border transition-all ${
                  selectedCamera?.id === cam.id
                    ? 'border-primary ring-1 ring-primary/30'
                    : 'border-border hover:border-foreground/30'
                }`}
              >
                <CameraImage camera={cam} size="thumb" refreshKey={refreshKey} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrafficCameras;
