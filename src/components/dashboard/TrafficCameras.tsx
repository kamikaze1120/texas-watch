import { useState } from 'react';
import { Camera, ExternalLink } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const DISTRICTS = [
  { code: 'ABL', name: 'Abilene' },
  { code: 'AMA', name: 'Amarillo' },
  { code: 'ATL', name: 'Atlanta' },
  { code: 'AUS', name: 'Austin' },
  { code: 'BMT', name: 'Beaumont' },
  { code: 'BWD', name: 'Brownwood' },
  { code: 'BRY', name: 'Bryan' },
  { code: 'CHS', name: 'Childress' },
  { code: 'CRP', name: 'Corpus Christi' },
  { code: 'DAL', name: 'Dallas' },
  { code: 'ELP', name: 'El Paso' },
  { code: 'FTW', name: 'Fort Worth' },
  { code: 'HOU', name: 'Houston' },
  { code: 'LRD', name: 'Laredo' },
  { code: 'LBB', name: 'Lubbock' },
  { code: 'LFK', name: 'Lufkin' },
  { code: 'ODA', name: 'Odessa' },
  { code: 'PAR', name: 'Paris' },
  { code: 'PHR', name: 'Pharr' },
  { code: 'SAT', name: 'San Antonio' },
  { code: 'SJT', name: 'San Angelo' },
  { code: 'TYL', name: 'Tyler' },
  { code: 'WAC', name: 'Waco' },
  { code: 'WFS', name: 'Wichita Falls' },
  { code: 'YKM', name: 'Yoakum' },
];

const TrafficCameras = () => {
  const [selectedDistrict, setSelectedDistrict] = useState('HOU');

  const iframeSrc = `https://its.txdot.gov/its/District/${selectedDistrict}/cameras`;

  return (
    <div className="flex h-full bg-background">
      {/* District Sidebar */}
      <div className="w-52 shrink-0 border-r border-border flex flex-col bg-card">
        <div className="p-3 border-b border-border">
          <div className="flex items-center gap-2 mb-2">
            <Camera className="h-3.5 w-3.5 text-primary" />
            <h2 className="font-display text-xs font-semibold tracking-widest text-primary">TxDOT CAMS</h2>
          </div>
          <p className="text-[9px] text-muted-foreground">Live TxDOT ITS cameras — select a district</p>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-0.5">
            {DISTRICTS.map(d => (
              <button
                key={d.code}
                onClick={() => setSelectedDistrict(d.code)}
                className={`w-full text-left px-3 py-2 rounded-md text-[10px] font-display tracking-wider transition-all flex items-center justify-between ${
                  selectedDistrict === d.code
                    ? 'bg-primary/15 text-primary ring-1 ring-primary/20'
                    : 'text-foreground hover:bg-secondary/50'
                }`}
              >
                <span>{d.name.toUpperCase()}</span>
              </button>
            ))}
          </div>
        </ScrollArea>

        <div className="p-3 border-t border-border">
          <a
            href={iframeSrc}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-display tracking-wider text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all"
          >
            <ExternalLink className="h-3 w-3" />
            OPEN IN NEW TAB
          </a>
        </div>
      </div>

      {/* Main View — iframe of TxDOT camera page */}
      <div className="flex-1 min-w-0 relative">
        <iframe
          key={selectedDistrict}
          src={iframeSrc}
          title={`TxDOT ${selectedDistrict} Cameras`}
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin allow-popups"
          loading="lazy"
        />
        {/* District label overlay */}
        <div className="absolute top-3 right-3 z-10 glass-panel rounded-lg px-3 py-1.5">
          <p className="text-[9px] font-display text-muted-foreground tracking-widest">
            DISTRICT: <span className="text-primary">{selectedDistrict}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default TrafficCameras;
