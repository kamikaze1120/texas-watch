import { useState, useCallback } from 'react';
import StatusBar from '@/components/dashboard/StatusBar';
import StatsBar from '@/components/dashboard/StatsBar';
import IncidentFeed from '@/components/dashboard/IncidentFeed';
import TacticalMap from '@/components/dashboard/TacticalMap';
import IntelPanel from '@/components/dashboard/IntelPanel';
import AlertBanner from '@/components/dashboard/AlertBanner';
import TrafficCameras from '@/components/dashboard/TrafficCameras';
import BootSequence from '@/components/dashboard/BootSequence';
import { type Incident } from '@/data/mockData';
import { Map, Camera, Brain } from 'lucide-react';

type CenterView = 'map' | 'cameras';

const Index = () => {
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [centerView, setCenterView] = useState<CenterView>('map');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [showIntel, setShowIntel] = useState(true);
  const [booted, setBooted] = useState(false);

  const handleBootComplete = useCallback(() => {
    setBooted(true);
  }, []);

  return (
    <>
      {!booted && <BootSequence onComplete={handleBootComplete} />}
      <div className={`h-screen w-screen flex flex-col overflow-hidden bg-background tactical-grid transition-opacity duration-700 ${booted ? 'opacity-100' : 'opacity-0'}`}>
        <StatusBar />
        <StatsBar />

        {/* View tabs */}
        <div className="h-9 bg-card/40 border-b border-border/40 flex items-center px-4 gap-1 shrink-0">
          <button
            onClick={() => setCenterView('map')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[9px] font-display tracking-[0.12em] transition-all ${
              centerView === 'map'
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
            }`}
          >
            <Map className="h-3 w-3" />
            MAP
          </button>
          <button
            onClick={() => setCenterView('cameras')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[9px] font-display tracking-[0.12em] transition-all ${
              centerView === 'cameras'
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
            }`}
          >
            <Camera className="h-3 w-3" />
            CAMERAS
          </button>

          <div className="ml-auto">
            <button
              onClick={() => setShowIntel(!showIntel)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[9px] font-display tracking-[0.12em] transition-all ${
                showIntel
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
              }`}
            >
              <Brain className="h-3 w-3" />
              <span className="hidden sm:inline">INTEL</span>
            </button>
          </div>
        </div>

        <div className="flex-1 flex min-h-0">
          {/* Left: Live Dispatch Feed */}
          <div className="w-72 shrink-0 hidden lg:flex flex-col border-r border-border/40">
            <IncidentFeed
              onSelectIncident={setSelectedIncident}
              selectedIncident={selectedIncident}
              cityFilter={cityFilter}
              onCityFilterChange={setCityFilter}
            />
          </div>

          {/* Center */}
          <div className="flex-1 min-w-0">
            {centerView === 'map' ? (
              <TacticalMap selectedIncident={selectedIncident} cityFilter={cityFilter} />
            ) : (
              <TrafficCameras />
            )}
          </div>

          {/* Right: Intel */}
          {showIntel && (
            <div className="w-72 shrink-0 hidden xl:flex flex-col border-l border-border/40">
              <IntelPanel />
            </div>
          )}
        </div>

        <AlertBanner />
      </div>
    </>
  );
};

export default Index;
