import { useEffect, useMemo, useState } from 'react';
import { Camera as CameraIcon, Search, RefreshCw, X, Wifi, WifiOff, MapPin } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCameras, cameraSnapshotUrl, CAMERA_METROS, type Camera } from '@/hooks/useCameras';

const REFRESH_MS = 30000;

const CameraThumb = ({
  camera,
  metro,
  bust,
  onOpen,
}: {
  camera: Camera;
  metro: string;
  bust: number;
  onOpen: () => void;
}) => {
  const [errored, setErrored] = useState(false);

  return (
    <button
      onClick={onOpen}
      className="group relative text-left rounded-xl overflow-hidden border border-border bg-card hover:border-primary/40 hover:shadow-lg transition-all"
    >
      <div className="aspect-video bg-secondary relative overflow-hidden">
        {!errored ? (
          <img
            src={cameraSnapshotUrl(metro, camera.id, bust)}
            alt={camera.name}
            loading="lazy"
            onError={() => setErrored(true)}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 text-muted-foreground">
            <WifiOff className="h-5 w-5" />
            <span className="text-xs font-display">Feed offline</span>
          </div>
        )}
        <div className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-card/90 px-2 py-0.5 backdrop-blur">
          {camera.online ? (
            <Wifi className="h-3 w-3 text-success" />
          ) : (
            <WifiOff className="h-3 w-3 text-muted-foreground" />
          )}
          <span className="text-[10px] font-display font-semibold text-foreground">{camera.roadway}</span>
        </div>
      </div>
      <div className="p-2.5">
        <p className="text-sm font-semibold text-foreground leading-tight line-clamp-1">{camera.name}</p>
        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
          <MapPin className="h-3 w-3 shrink-0" />
          {camera.direction || camera.roadway}
        </p>
      </div>
    </button>
  );
};

const TrafficCameras = () => {
  const [metro, setMetro] = useState('austin');
  const [search, setSearch] = useState('');
  const [bust, setBust] = useState(Date.now());
  const [active, setActive] = useState<Camera | null>(null);

  const { data, isLoading, isError, refetch } = useCameras(metro);

  // Auto-refresh snapshots
  useEffect(() => {
    const interval = setInterval(() => setBust(Date.now()), REFRESH_MS);
    return () => clearInterval(interval);
  }, []);

  const cameras = useMemo(() => {
    const list = data?.cameras || [];
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (c) => c.name.toLowerCase().includes(q) || c.roadway.toLowerCase().includes(q)
    );
  }, [data, search]);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Toolbar */}
      <div className="shrink-0 border-b border-border bg-card/60 p-3 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 mr-2">
          <CameraIcon className="h-4 w-4 text-primary" />
          <h2 className="font-display text-sm font-bold tracking-wide text-foreground">LIVE TRAFFIC CAMERAS</h2>
        </div>

        <div className="flex flex-wrap gap-1">
          {CAMERA_METROS.map((m) => (
            <button
              key={m.value}
              onClick={() => setMetro(m.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-display font-semibold transition-all ${
                metro === m.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/70'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className="relative ml-auto min-w-[180px] flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search roads..."
            className="w-full bg-secondary border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
          />
        </div>

        <button
          onClick={() => {
            setBust(Date.now());
            refetch();
          }}
          className="p-2 rounded-lg bg-secondary text-foreground hover:bg-secondary/70 transition-colors"
          title="Refresh"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Grid */}
      <ScrollArea className="flex-1">
        <div className="p-3">
          {isLoading ? (
            <div className="py-16 text-center text-muted-foreground">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
              <p className="font-display text-sm">Loading cameras…</p>
            </div>
          ) : isError ? (
            <div className="py-16 text-center text-muted-foreground">
              <WifiOff className="h-6 w-6 mx-auto mb-2" />
              <p className="font-display text-sm">Camera service unavailable. Try refreshing.</p>
            </div>
          ) : cameras.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              <p className="font-display text-sm">No cameras match your search.</p>
            </div>
          ) : (
            <>
              <p className="text-xs text-muted-foreground mb-3 font-display">
                {cameras.length} cameras • auto-refreshing every 30s
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3">
                {cameras.map((cam) => (
                  <CameraThumb
                    key={cam.id}
                    camera={cam}
                    metro={metro}
                    bust={bust}
                    onOpen={() => setActive(cam)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </ScrollArea>

      {/* Lightbox */}
      {active && (
        <div
          className="fixed inset-0 z-[2000] bg-foreground/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setActive(null)}
        >
          <div
            className="bg-card rounded-2xl overflow-hidden max-w-3xl w-full shadow-2xl border border-border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-3 border-b border-border">
              <div>
                <p className="font-display font-bold text-foreground">{active.name}</p>
                <p className="text-xs text-muted-foreground">{active.roadway} • {active.direction}</p>
              </div>
              <button
                onClick={() => setActive(null)}
                className="p-2 rounded-lg hover:bg-secondary text-muted-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <img
              src={cameraSnapshotUrl(metro, active.id, bust)}
              alt={active.name}
              className="w-full bg-secondary"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TrafficCameras;
