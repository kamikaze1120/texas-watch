import { useState } from 'react';
import { Camera, ExternalLink, RefreshCw, MapPin } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CameraFeed {
  id: string;
  name: string;
  district: string;
  city: string;
  roadway: string;
  snapshotUrl: string;
  lastUpdated: string;
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
  { code: 'BWD', name: 'Brownwood' },
  { code: 'BRY', name: 'Bryan' },
  { code: 'ABL', name: 'Abilene' },
  { code: 'AMA', name: 'Amarillo' },
  { code: 'BMT', name: 'Beaumont' },
  { code: 'LRD', name: 'Laredo' },
  { code: 'TYL', name: 'Tyler' },
  { code: 'WAC', name: 'Waco' },
  { code: 'PAR', name: 'Paris' },
  { code: 'PHR', name: 'Pharr' },
  { code: 'ODA', name: 'Odessa' },
  { code: 'WFS', name: 'Wichita Falls' },
  { code: 'LFK', name: 'Lufkin' },
  { code: 'YKM', name: 'Yoakum' },
  { code: 'SJT', name: 'San Angelo' },
  { code: 'CHS', name: 'Childress' },
  { code: 'ATL', name: 'Atlanta' },
];

const TrafficCameras = () => {
  const [selectedDistrict, setSelectedDistrict] = useState(DISTRICTS[0]);
  const [isLoading, setIsLoading] = useState(false);

  const handleDistrictChange = (code: string) => {
    const district = DISTRICTS.find(d => d.code === code);
    if (district) {
      setSelectedDistrict(district);
      setIsLoading(true);
      setTimeout(() => setIsLoading(false), 1500);
    }
  };

  const txdotUrl = `https://its.txdot.gov/its/District/${selectedDistrict.code}/cameras`;

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-3 border-b border-border bg-card">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-primary/15">
              <Camera className="h-3.5 w-3.5 text-primary" />
            </div>
            <div>
              <h2 className="font-display text-xs font-semibold tracking-widest text-primary">
                TRAFFIC CAMERAS
              </h2>
              <p className="text-[9px] text-muted-foreground font-display">TxDOT LIVE FEEDS</p>
            </div>
          </div>
          <a
            href={txdotUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[9px] font-display text-muted-foreground hover:text-primary transition-colors px-2 py-1 rounded-md bg-secondary"
          >
            <ExternalLink className="h-3 w-3" />
            OPEN IN TXDOT
          </a>
        </div>

        {/* District Selector */}
        <div className="flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
          <select
            value={selectedDistrict.code}
            onChange={e => handleDistrictChange(e.target.value)}
            className="flex-1 bg-secondary border border-border rounded-md px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 font-display appearance-none cursor-pointer"
          >
            {DISTRICTS.map(d => (
              <option key={d.code} value={d.code}>{d.name} District</option>
            ))}
          </select>
        </div>
      </div>

      {/* Camera Feed - Embedded TxDOT */}
      <div className="flex-1 relative">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3">
              <RefreshCw className="h-5 w-5 text-primary animate-spin" />
              <p className="text-xs font-display text-muted-foreground">LOADING {selectedDistrict.name.toUpperCase()} CAMERAS...</p>
            </div>
          </div>
        )}
        <iframe
          src={txdotUrl}
          className="w-full h-full border-0"
          title={`TxDOT ${selectedDistrict.name} Traffic Cameras`}
          sandbox="allow-scripts allow-same-origin allow-popups"
          loading="lazy"
        />
      </div>

      {/* Footer Info */}
      <div className="p-2.5 border-t border-border bg-card">
        <div className="flex items-center justify-between">
          <p className="text-[9px] font-display text-muted-foreground">
            SOURCE: TEXAS DEPT OF TRANSPORTATION
          </p>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            <p className="text-[9px] font-display text-success">LIVE</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrafficCameras;
