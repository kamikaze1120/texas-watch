import { useState, useEffect, useCallback } from 'react';
import { Camera, RefreshCw, MapPin, Video, ChevronRight, AlertCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TrafficCamera {
  id: string;
  name: string;
  district: string;
  city: string;
  roadway: string;
  lat: number;
  lng: number;
}

const DISTRICTS = [
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

const CAMERA_DATA: Record<string, TrafficCamera[]> = {
  HOU: [
    { id: 'HOU-001', name: 'IH-45 @ Allen Pkwy', district: 'HOU', city: 'Houston', roadway: 'IH-45 N', lat: 29.7604, lng: -95.3698 },
    { id: 'HOU-002', name: 'IH-10 @ Bunker Hill', district: 'HOU', city: 'Houston', roadway: 'IH-10 Katy', lat: 29.7785, lng: -95.5327 },
    { id: 'HOU-003', name: 'US-59 @ Kirby Dr', district: 'HOU', city: 'Houston', roadway: 'US-59 SW', lat: 29.7280, lng: -95.4214 },
    { id: 'HOU-004', name: 'IH-610 @ US-59', district: 'HOU', city: 'Houston', roadway: 'IH-610 W', lat: 29.7381, lng: -95.4388 },
    { id: 'HOU-005', name: 'IH-45 @ Edgebrook', district: 'HOU', city: 'Houston', roadway: 'IH-45 Gulf', lat: 29.6716, lng: -95.3091 },
    { id: 'HOU-006', name: 'US-290 @ Pinemont', district: 'HOU', city: 'Houston', roadway: 'US-290', lat: 29.8322, lng: -95.4655 },
    { id: 'HOU-007', name: 'SH-288 @ MacGregor', district: 'HOU', city: 'Houston', roadway: 'SH-288', lat: 29.7084, lng: -95.3830 },
    { id: 'HOU-008', name: 'Beltway 8 @ Westheimer', district: 'HOU', city: 'Houston', roadway: 'Beltway 8', lat: 29.7364, lng: -95.5596 },
  ],
  DAL: [
    { id: 'DAL-001', name: 'IH-35E @ Commerce', district: 'DAL', city: 'Dallas', roadway: 'IH-35E', lat: 32.7767, lng: -96.7970 },
    { id: 'DAL-002', name: 'IH-30 @ Fair Park', district: 'DAL', city: 'Dallas', roadway: 'IH-30', lat: 32.7777, lng: -96.7614 },
    { id: 'DAL-003', name: 'US-75 @ Mockingbird', district: 'DAL', city: 'Dallas', roadway: 'US-75', lat: 32.8357, lng: -96.7742 },
    { id: 'DAL-004', name: 'IH-635 @ US-75', district: 'DAL', city: 'Dallas', roadway: 'IH-635', lat: 32.9018, lng: -96.7527 },
    { id: 'DAL-005', name: 'SH-183 @ Belt Line', district: 'DAL', city: 'Dallas', roadway: 'SH-183', lat: 32.8507, lng: -96.9725 },
    { id: 'DAL-006', name: 'IH-45 @ Lamar', district: 'DAL', city: 'Dallas', roadway: 'IH-45', lat: 32.7818, lng: -96.7872 },
  ],
  FTW: [
    { id: 'FTW-001', name: 'IH-35W @ IH-30', district: 'FTW', city: 'Fort Worth', roadway: 'IH-35W', lat: 32.7555, lng: -97.3308 },
    { id: 'FTW-002', name: 'IH-30 @ Camp Bowie', district: 'FTW', city: 'Fort Worth', roadway: 'IH-30', lat: 32.7499, lng: -97.3816 },
    { id: 'FTW-003', name: 'IH-820 @ IH-35W', district: 'FTW', city: 'Fort Worth', roadway: 'IH-820', lat: 32.8143, lng: -97.3270 },
    { id: 'FTW-004', name: 'SH-121 @ Airport Fwy', district: 'FTW', city: 'Fort Worth', roadway: 'SH-121', lat: 32.8238, lng: -97.1628 },
  ],
  AUS: [
    { id: 'AUS-001', name: 'IH-35 @ Riverside', district: 'AUS', city: 'Austin', roadway: 'IH-35', lat: 30.2500, lng: -97.7260 },
    { id: 'AUS-002', name: 'Loop 1 @ Far West', district: 'AUS', city: 'Austin', roadway: 'Loop 1 (MOPAC)', lat: 30.3583, lng: -97.7583 },
    { id: 'AUS-003', name: 'US-183 @ Research', district: 'AUS', city: 'Austin', roadway: 'US-183', lat: 30.3936, lng: -97.7269 },
    { id: 'AUS-004', name: 'SH-130 @ SH-45', district: 'AUS', city: 'Austin', roadway: 'SH-130', lat: 30.1874, lng: -97.6468 },
    { id: 'AUS-005', name: 'IH-35 @ 51st St', district: 'AUS', city: 'Austin', roadway: 'IH-35', lat: 30.3074, lng: -97.7164 },
  ],
  SAT: [
    { id: 'SAT-001', name: 'IH-35 @ Commerce', district: 'SAT', city: 'San Antonio', roadway: 'IH-35', lat: 29.4241, lng: -98.4936 },
    { id: 'SAT-002', name: 'IH-10 @ UTSA Blvd', district: 'SAT', city: 'San Antonio', roadway: 'IH-10', lat: 29.5835, lng: -98.6175 },
    { id: 'SAT-003', name: 'Loop 410 @ US-281', district: 'SAT', city: 'San Antonio', roadway: 'Loop 410', lat: 29.4900, lng: -98.4579 },
  ],
  ELP: [
    { id: 'ELP-001', name: 'IH-10 @ Downtown', district: 'ELP', city: 'El Paso', roadway: 'IH-10', lat: 31.7619, lng: -106.4850 },
    { id: 'ELP-002', name: 'US-54 @ Gateway', district: 'ELP', city: 'El Paso', roadway: 'US-54', lat: 31.8024, lng: -106.4236 },
  ],
  CRP: [
    { id: 'CRP-001', name: 'US-181 @ Beach St', district: 'CRP', city: 'Corpus Christi', roadway: 'US-181', lat: 27.8006, lng: -97.3964 },
  ],
  LBB: [
    { id: 'LBB-001', name: 'Marsha Sharp @ TTU', district: 'LBB', city: 'Lubbock', roadway: 'US-62/82', lat: 33.5842, lng: -101.8556 },
    { id: 'LBB-002', name: 'Loop 289 @ Slide', district: 'LBB', city: 'Lubbock', roadway: 'Loop 289', lat: 33.5580, lng: -101.8966 },
  ],
  BMT: [
    { id: 'BMT-001', name: 'IH-10 @ MLK Pkwy', district: 'BMT', city: 'Beaumont', roadway: 'IH-10', lat: 30.0802, lng: -94.1266 },
  ],
  TYL: [
    { id: 'TYL-001', name: 'IH-20 @ SH-31', district: 'TYL', city: 'Tyler', roadway: 'IH-20', lat: 32.3513, lng: -95.3011 },
  ],
  WAC: [
    { id: 'WAC-001', name: 'IH-35 @ University Parks', district: 'WAC', city: 'Waco', roadway: 'IH-35', lat: 31.5493, lng: -97.1467 },
  ],
};

// Generate a simulated camera view using canvas
const generateCameraFrame = (camera: TrafficCamera, canvas: HTMLCanvasElement) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const w = canvas.width;
  const h = canvas.height;

  // Dark road background
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, w, h);

  // Horizon gradient
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, '#16213e');
  grad.addColorStop(0.35, '#0f3460');
  grad.addColorStop(0.5, '#2c2c34');
  grad.addColorStop(1, '#1a1a1a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Road perspective
  ctx.fillStyle = '#222';
  ctx.beginPath();
  ctx.moveTo(w * 0.3, h * 0.45);
  ctx.lineTo(w * 0.7, h * 0.45);
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();

  // Lane markings
  ctx.strokeStyle = '#555';
  ctx.lineWidth = 2;
  ctx.setLineDash([12, 20]);
  ctx.beginPath();
  ctx.moveTo(w * 0.5, h * 0.45);
  ctx.lineTo(w * 0.5, h);
  ctx.stroke();
  ctx.setLineDash([]);

  // Road edges
  ctx.strokeStyle = '#444';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(w * 0.3, h * 0.45);
  ctx.lineTo(0, h);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(w * 0.7, h * 0.45);
  ctx.lineTo(w, h);
  ctx.stroke();

  // Simulated headlights (random)
  const seed = camera.id.charCodeAt(4) + (Date.now() % 5);
  for (let i = 0; i < 3 + (seed % 4); i++) {
    const lx = w * 0.35 + Math.random() * w * 0.3;
    const ly = h * 0.5 + Math.random() * h * 0.35;
    const radius = 3 + Math.random() * 4;
    const headlight = ctx.createRadialGradient(lx, ly, 0, lx, ly, radius * 3);
    headlight.addColorStop(0, 'rgba(255, 255, 220, 0.9)');
    headlight.addColorStop(0.5, 'rgba(255, 255, 180, 0.3)');
    headlight.addColorStop(1, 'rgba(255, 255, 180, 0)');
    ctx.fillStyle = headlight;
    ctx.fillRect(lx - radius * 3, ly - radius * 3, radius * 6, radius * 6);
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(lx, ly, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  // Taillights
  for (let i = 0; i < 2 + (seed % 3); i++) {
    const lx = w * 0.55 + Math.random() * w * 0.2;
    const ly = h * 0.55 + Math.random() * h * 0.3;
    const radius = 2 + Math.random() * 3;
    const taillight = ctx.createRadialGradient(lx, ly, 0, lx, ly, radius * 2);
    taillight.addColorStop(0, 'rgba(255, 40, 40, 0.9)');
    taillight.addColorStop(1, 'rgba(255, 40, 40, 0)');
    ctx.fillStyle = taillight;
    ctx.fillRect(lx - radius * 2, ly - radius * 2, radius * 4, radius * 4);
  }

  // Noise/grain overlay
  const imageData = ctx.getImageData(0, 0, w, h);
  for (let i = 0; i < imageData.data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 12;
    imageData.data[i] += noise;
    imageData.data[i + 1] += noise;
    imageData.data[i + 2] += noise;
  }
  ctx.putImageData(imageData, 0, 0);

  // Camera info overlay - top bar
  ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
  ctx.fillRect(0, 0, w, 28);
  ctx.fillRect(0, h - 24, w, 24);

  ctx.fillStyle = '#0ea5e9';
  ctx.font = 'bold 11px monospace';
  ctx.fillText(`CAM: ${camera.id}`, 8, 17);

  ctx.fillStyle = '#999';
  ctx.font = '10px monospace';
  ctx.fillText(camera.name, 120, 17);

  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour12: false });
  const dateStr = now.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
  ctx.fillStyle = '#aaa';
  ctx.font = '10px monospace';
  ctx.textAlign = 'right';
  ctx.fillText(`${dateStr} ${timeStr} CST`, w - 8, 17);
  ctx.textAlign = 'left';

  // Bottom bar
  ctx.fillStyle = '#0ea5e9';
  ctx.font = '9px monospace';
  ctx.fillText(`TxDOT ITS • ${camera.city} • ${camera.roadway}`, 8, h - 8);
  ctx.textAlign = 'right';
  ctx.fillStyle = '#22c55e';
  ctx.fillText('● LIVE', w - 8, h - 8);
  ctx.textAlign = 'left';

  // REC indicator
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(w - 55, 14, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 9px monospace';
  ctx.fillText('REC', w - 48, 17);
};

const CameraCanvas = ({ camera, size }: { camera: TrafficCamera; size: 'large' | 'thumb' }) => {
  const canvasRef = useCallback((canvas: HTMLCanvasElement | null) => {
    if (canvas) {
      canvas.width = size === 'large' ? 640 : 160;
      canvas.height = size === 'large' ? 360 : 90;
      generateCameraFrame(camera, canvas);
    }
  }, [camera, size]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
};

const TrafficCameras = () => {
  const [selectedDistrict, setSelectedDistrict] = useState('HOU');
  const [selectedCamera, setSelectedCamera] = useState<TrafficCamera | null>(null);
  const [, setTick] = useState(0);

  const cameras = CAMERA_DATA[selectedDistrict] || [];

  useEffect(() => {
    setSelectedCamera(cameras[0] || null);
  }, [selectedDistrict]);

  // Refresh frames every 5s
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-full bg-background">
      {/* Camera List */}
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

        <div className="p-2.5 border-t border-border">
          <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground font-display">
            <AlertCircle className="h-3 w-3" />
            <span>DEMO MODE — SIMULATED FEEDS</span>
          </div>
        </div>
      </div>

      {/* Main View */}
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
                  onClick={() => setTick(t => t + 1)}
                  className="p-1.5 rounded-md bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="flex-1 flex items-center justify-center bg-background p-4">
              <div className="relative w-full max-w-3xl aspect-video rounded-lg overflow-hidden border border-border">
                <CameraCanvas camera={selectedCamera} size="large" />
              </div>
            </div>

            {/* Thumbnail strip */}
            <div className="p-3 border-t border-border bg-card/50">
              <p className="text-[9px] font-display text-muted-foreground tracking-widest mb-2">
                {DISTRICTS.find(d => d.code === selectedDistrict)?.name.toUpperCase()} — {cameras.length} CAMERAS
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {cameras.map(cam => (
                  <button
                    key={cam.id}
                    onClick={() => setSelectedCamera(cam)}
                    className={`shrink-0 w-32 rounded-md overflow-hidden border transition-all ${
                      selectedCamera?.id === cam.id
                        ? 'border-primary ring-1 ring-primary/30'
                        : 'border-border hover:border-muted-foreground'
                    }`}
                  >
                    <div className="aspect-video">
                      <CameraCanvas camera={cam} size="thumb" />
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
