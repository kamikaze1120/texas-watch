import { useState, useEffect } from 'react';
import { Camera, RefreshCw, MapPin, Video, ChevronRight } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TrafficCamera {
  id: string;
  name: string;
  district: string;
  city: string;
  roadway: string;
  snapshotUrl: string;
}

const DISTRICTS: { code: string; name: string }[] = [
  { code: 'HOU', name: 'Houston' },
  { code: 'DAL', name: 'Dallas' },
  { code: 'FTW', name: 'Fort Worth' },
  { code: 'AUS', name: 'Austin' },
  { code: 'SAT', name: 'San Antonio' },
  { code: 'ELP', name: 'El Paso' },
  { code: 'CRP', name: 'Corpus Christi' },
  { code: 'LBB', name: 'Lubbock' },
  { code: 'BMT', name: 'Beaumont' },
  { code: 'TYL', name: 'Tyler' },
  { code: 'WAC', name: 'Waco' },
];

// Real TxDOT CCTV snapshot URLs follow the pattern:
// https://its.txdot.gov/ITS_WEB/FrontEnd/snapshots/{CameraName}_{DistrictCode}.jpg
const CAMERA_DATA: Record<string, TrafficCamera[]> = {
  HOU: [
    { id: 'HOU-1', name: 'IH-45 @ Downtown', district: 'HOU', city: 'Houston', roadway: 'IH-45', snapshotUrl: 'https://its.txdot.gov/ITS_WEB/FrontEnd/snapshots/IH-45%20North%20@%20Allen%20Parkway_HOU.jpg' },
    { id: 'HOU-2', name: 'IH-10 @ Katy Fwy', district: 'HOU', city: 'Houston', roadway: 'IH-10', snapshotUrl: 'https://its.txdot.gov/ITS_WEB/FrontEnd/snapshots/IH-10%20Katy%20@%20Bunker%20Hill_HOU.jpg' },
    { id: 'HOU-3', name: 'US-59 @ Kirby', district: 'HOU', city: 'Houston', roadway: 'US-59', snapshotUrl: 'https://its.txdot.gov/ITS_WEB/FrontEnd/snapshots/US-59%20SW%20@%20Kirby_HOU.jpg' },
    { id: 'HOU-4', name: 'IH-610 @ Galleria', district: 'HOU', city: 'Houston', roadway: 'IH-610', snapshotUrl: 'https://its.txdot.gov/ITS_WEB/FrontEnd/snapshots/IH-610%20West%20@%20US-59_HOU.jpg' },
    { id: 'HOU-5', name: 'IH-45 @ Gulf Fwy', district: 'HOU', city: 'Houston', roadway: 'IH-45', snapshotUrl: 'https://its.txdot.gov/ITS_WEB/FrontEnd/snapshots/IH-45%20Gulf%20@%20Edgebrook_HOU.jpg' },
    { id: 'HOU-6', name: 'US-290 @ Hempstead', district: 'HOU', city: 'Houston', roadway: 'US-290', snapshotUrl: 'https://its.txdot.gov/ITS_WEB/FrontEnd/snapshots/US-290%20@%20Pinemont_HOU.jpg' },
  ],
  DAL: [
    { id: 'DAL-1', name: 'IH-35E @ Downtown', district: 'DAL', city: 'Dallas', roadway: 'IH-35E', snapshotUrl: 'https://its.txdot.gov/ITS_WEB/FrontEnd/snapshots/IH-35E%20@%20Commerce_DAL.jpg' },
    { id: 'DAL-2', name: 'IH-30 @ Fair Park', district: 'DAL', city: 'Dallas', roadway: 'IH-30', snapshotUrl: 'https://its.txdot.gov/ITS_WEB/FrontEnd/snapshots/IH-30%20@%20Fair%20Park_DAL.jpg' },
    { id: 'DAL-3', name: 'US-75 @ Central', district: 'DAL', city: 'Dallas', roadway: 'US-75', snapshotUrl: 'https://its.txdot.gov/ITS_WEB/FrontEnd/snapshots/US-75%20@%20Mockingbird_DAL.jpg' },
    { id: 'DAL-4', name: 'IH-635 @ LBJ', district: 'DAL', city: 'Dallas', roadway: 'IH-635', snapshotUrl: 'https://its.txdot.gov/ITS_WEB/FrontEnd/snapshots/IH-635%20@%20US-75_DAL.jpg' },
  ],
  FTW: [
    { id: 'FTW-1', name: 'IH-35W @ Downtown', district: 'FTW', city: 'Fort Worth', roadway: 'IH-35W', snapshotUrl: 'https://its.txdot.gov/ITS_WEB/FrontEnd/snapshots/IH-35W%20@%20IH-30_FTW.jpg' },
    { id: 'FTW-2', name: 'IH-30 @ Camp Bowie', district: 'FTW', city: 'Fort Worth', roadway: 'IH-30', snapshotUrl: 'https://its.txdot.gov/ITS_WEB/FrontEnd/snapshots/IH-30%20@%20Camp%20Bowie_FTW.jpg' },
    { id: 'FTW-3', name: 'IH-820 @ NE Loop', district: 'FTW', city: 'Fort Worth', roadway: 'IH-820', snapshotUrl: 'https://its.txdot.gov/ITS_WEB/FrontEnd/snapshots/IH-820%20@%20IH-35W_FTW.jpg' },
  ],
  AUS: [
    { id: 'AUS-1', name: 'IH-35 @ Downtown', district: 'AUS', city: 'Austin', roadway: 'IH-35', snapshotUrl: 'https://its.txdot.gov/ITS_WEB/FrontEnd/snapshots/IH-35%20@%20Riverside_AUS.jpg' },
    { id: 'AUS-2', name: 'MOPAC @ Far West', district: 'AUS', city: 'Austin', roadway: 'Loop 1', snapshotUrl: 'https://its.txdot.gov/ITS_WEB/FrontEnd/snapshots/Loop%201%20@%20Far%20West_AUS.jpg' },
    { id: 'AUS-3', name: 'US-183 @ Research', district: 'AUS', city: 'Austin', roadway: 'US-183', snapshotUrl: 'https://its.txdot.gov/ITS_WEB/FrontEnd/snapshots/US-183%20@%20Research_AUS.jpg' },
  ],
  SAT: [
    { id: 'SAT-1', name: 'IH-35 @ Downtown', district: 'SAT', city: 'San Antonio', roadway: 'IH-35', snapshotUrl: 'https://its.txdot.gov/ITS_WEB/FrontEnd/snapshots/IH-35%20@%20Commerce_SAT.jpg' },
    { id: 'SAT-2', name: 'IH-10 @ UTSA', district: 'SAT', city: 'San Antonio', roadway: 'IH-10', snapshotUrl: 'https://its.txdot.gov/ITS_WEB/FrontEnd/snapshots/IH-10%20@%20UTSA%20Blvd_SAT.jpg' },
    { id: 'SAT-3', name: 'Loop 410 @ US-281', district: 'SAT', city: 'San Antonio', roadway: 'Loop 410', snapshotUrl: 'https://its.txdot.gov/ITS_WEB/FrontEnd/snapshots/Loop%20410%20@%20US-281_SAT.jpg' },
  ],
  ELP: [
    { id: 'ELP-1', name: 'IH-10 @ Downtown', district: 'ELP', city: 'El Paso', roadway: 'IH-10', snapshotUrl: 'https://its.txdot.gov/ITS_WEB/FrontEnd/snapshots/IH-10%20@%20Downtown_ELP.jpg' },
    { id: 'ELP-2', name: 'US-54 @ Gateway', district: 'ELP', city: 'El Paso', roadway: 'US-54', snapshotUrl: 'https://its.txdot.gov/ITS_WEB/FrontEnd/snapshots/US-54%20@%20Gateway_ELP.jpg' },
  ],
  CRP: [
    { id: 'CRP-1', name: 'US-181 @ Beach St', district: 'CRP', city: 'Corpus Christi', roadway: 'US-181', snapshotUrl: 'https://its.txdot.gov/ITS_WEB/FrontEnd/snapshots/CRP-US181%20@%20Beach%20St_CRP.jpg' },
  ],
  LBB: [
    { id: 'LBB-1', name: 'Marsha Sharp @ TTU', district: 'LBB', city: 'Lubbock', roadway: 'US-62/82', snapshotUrl: 'https://its.txdot.gov/ITS_WEB/FrontEnd/snapshots/Marsha%20Sharp%20Fwy%20@%20TTU%20Parkway_LBB.jpg' },
    { id: 'LBB-2', name: 'Loop 289 @ Slide', district: 'LBB', city: 'Lubbock', roadway: 'Loop 289', snapshotUrl: 'https://its.txdot.gov/ITS_WEB/FrontEnd/snapshots/Loop%20289%20@%20Slide_LBB.jpg' },
  ],
  BMT: [
    { id: 'BMT-1', name: 'IH-10 @ Downtown', district: 'BMT', city: 'Beaumont', roadway: 'IH-10', snapshotUrl: 'https://its.txdot.gov/ITS_WEB/FrontEnd/snapshots/IH-10%20@%20MLK_BMT.jpg' },
  ],
  TYL: [
    { id: 'TYL-1', name: 'IH-20 @ SH-31', district: 'TYL', city: 'Tyler', roadway: 'IH-20', snapshotUrl: 'https://its.txdot.gov/ITS_WEB/FrontEnd/snapshots/TYL.IH20.SH31_TYL.jpg' },
  ],
  WAC: [
    { id: 'WAC-1', name: 'IH-35 @ Downtown', district: 'WAC', city: 'Waco', roadway: 'IH-35', snapshotUrl: 'https://its.txdot.gov/ITS_WEB/FrontEnd/snapshots/IH-35%20@%20University%20Parks_WAC.jpg' },
  ],
};

const TrafficCameras = () => {
  const [selectedDistrict, setSelectedDistrict] = useState('HOU');
  const [selectedCamera, setSelectedCamera] = useState<TrafficCamera | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  const cameras = CAMERA_DATA[selectedDistrict] || [];

  useEffect(() => {
    setSelectedCamera(cameras[0] || null);
    setImageErrors(new Set());
  }, [selectedDistrict]);

  // Auto-refresh every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey(k => k + 1);
      setImageErrors(new Set());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setRefreshKey(k => k + 1);
    setImageErrors(new Set());
  };

  return (
    <div className="flex h-full bg-background">
      {/* Camera List Sidebar */}
      <div className="w-64 shrink-0 bg-card border-r border-border flex flex-col">
        <div className="p-3 border-b border-border">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-md bg-primary/15">
              <Camera className="h-3.5 w-3.5 text-primary" />
            </div>
            <div>
              <h2 className="font-display text-xs font-semibold tracking-widest text-primary">TRAFFIC CAMS</h2>
              <p className="text-[9px] text-muted-foreground font-display">TxDOT LIVE FEEDS</p>
            </div>
          </div>

          <select
            value={selectedDistrict}
            onChange={e => setSelectedDistrict(e.target.value)}
            className="w-full bg-secondary border border-border rounded-md px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 font-display appearance-none cursor-pointer"
          >
            {DISTRICTS.map(d => (
              <option key={d.code} value={d.code}>{d.name}</option>
            ))}
          </select>
        </div>

        <ScrollArea className="flex-1">
          {cameras.map(cam => (
            <button
              key={cam.id}
              onClick={() => setSelectedCamera(cam)}
              className={`w-full text-left p-2.5 border-b border-border/50 transition-all flex items-center gap-2 ${
                selectedCamera?.id === cam.id
                  ? 'bg-primary/10 border-l-2 border-l-primary'
                  : 'hover:bg-secondary/50'
              }`}
            >
              <Video className="h-3 w-3 text-muted-foreground shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-medium text-foreground truncate">{cam.name}</p>
                <p className="text-[9px] text-muted-foreground font-display">{cam.roadway}</p>
              </div>
              <ChevronRight className="h-3 w-3 text-muted-foreground/50 shrink-0" />
            </button>
          ))}
        </ScrollArea>
      </div>

      {/* Main Camera View */}
      <div className="flex-1 flex flex-col">
        {selectedCamera ? (
          <>
            <div className="p-3 border-b border-border bg-card/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                <div>
                  <p className="text-xs font-medium text-foreground">{selectedCamera.name}</p>
                  <p className="text-[9px] text-muted-foreground font-display">{selectedCamera.city} • {selectedCamera.roadway}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-success/10 px-2 py-0.5 rounded-full">
                  <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                  <span className="text-[9px] font-display text-success">LIVE</span>
                </div>
                <button
                  onClick={handleRefresh}
                  className="p-1.5 rounded-md bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors"
                  title="Refresh feed"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="flex-1 flex items-center justify-center bg-background p-4">
              <div className="relative w-full max-w-3xl aspect-video rounded-lg overflow-hidden border border-border bg-card">
                {imageErrors.has(selectedCamera.id) ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                    <Camera className="h-8 w-8 text-muted-foreground/40" />
                    <p className="text-xs text-muted-foreground font-display">FEED UNAVAILABLE</p>
                    <p className="text-[9px] text-muted-foreground">Camera may be offline or undergoing maintenance</p>
                    <button
                      onClick={handleRefresh}
                      className="mt-2 text-[10px] font-display text-primary hover:text-primary/80 flex items-center gap-1"
                    >
                      <RefreshCw className="h-3 w-3" /> RETRY
                    </button>
                  </div>
                ) : (
                  <img
                    key={`${selectedCamera.id}-${refreshKey}`}
                    src={`${selectedCamera.snapshotUrl}?t=${refreshKey}`}
                    alt={`Traffic camera: ${selectedCamera.name}`}
                    className="w-full h-full object-contain"
                    onError={() => setImageErrors(prev => new Set(prev).add(selectedCamera.id))}
                  />
                )}

                {/* Overlay info */}
                <div className="absolute top-3 left-3 glass-panel rounded px-2 py-1">
                  <p className="text-[9px] font-display text-primary tracking-wider">{selectedCamera.id}</p>
                </div>
                <div className="absolute bottom-3 right-3 glass-panel rounded px-2 py-1">
                  <p className="text-[9px] font-display text-muted-foreground">
                    {new Date().toLocaleTimeString('en-US', { hour12: false })} CST
                  </p>
                </div>
              </div>
            </div>

            {/* Camera Grid - Show other cameras as thumbnails */}
            <div className="p-3 border-t border-border bg-card/50">
              <p className="text-[9px] font-display text-muted-foreground tracking-widest mb-2">
                {DISTRICTS.find(d => d.code === selectedDistrict)?.name.toUpperCase()} DISTRICT — {cameras.length} CAMERAS
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {cameras.map(cam => (
                  <button
                    key={cam.id}
                    onClick={() => { setSelectedCamera(cam); setImageErrors(prev => { const s = new Set(prev); s.delete(cam.id); return s; }); }}
                    className={`shrink-0 w-28 rounded-md overflow-hidden border transition-all ${
                      selectedCamera?.id === cam.id
                        ? 'border-primary ring-1 ring-primary/30'
                        : 'border-border hover:border-muted-foreground'
                    }`}
                  >
                    <div className="aspect-video bg-secondary relative">
                      {!imageErrors.has(cam.id) ? (
                        <img
                          src={`${cam.snapshotUrl}?t=${refreshKey}`}
                          alt={cam.name}
                          className="w-full h-full object-cover"
                          onError={() => setImageErrors(prev => new Set(prev).add(cam.id))}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Camera className="h-4 w-4 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>
                    <p className="text-[8px] font-display text-muted-foreground p-1 truncate">{cam.name}</p>
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Camera className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground font-display">SELECT A DISTRICT TO VIEW CAMERAS</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrafficCameras;
