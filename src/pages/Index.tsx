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
import { Map, Camera, Brain, Radio, X } from 'lucide-react';

type CenterView = 'map' | 'cameras';
type MobilePanel = 'map' | 'feed' | 'intel';

const Index = () => {
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [centerView, setCenterView] = useState<CenterView>('map');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [showIntel, setShowIntel] = useState(false);
  const [booted, setBooted] = useState(false);
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>('map');

  const handleBootComplete = useCallback(() => {
    setBooted(true);
  }, []);

  return (
    <>
      {!booted && <BootSequence onComplete={handleBootComplete} />}
      <div className={`h-[100dvh] w-screen flex flex-col overflow-hidden bg-background tactical-grid transition-opacity duration-700 ${booted ? 'opacity-100' : 'opacity-0'}`}>
        <StatusBar />
        
        {/* Stats bar - hidden on very small screens */}
        <div className="hidden sm:block">
          <StatsBar />
        </div>

        {/* Desktop view tabs */}
        <div className="h-9 bg-card/40 border-b border-border/40 flex items-center px-3 sm:px-4 gap-1 shrink-0">
          {/* Mobile bottom-tab style navigation */}
          <div className="flex lg:hidden items-center gap-1">
            <button
              onClick={() => setMobilePanel('map')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[9px] font-display tracking-[0.1em] transition-all ${
                mobilePanel === 'map'
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Map className="h-3 w-3" />
              MAP
            </button>
            <button
              onClick={() => setMobilePanel('feed')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[9px] font-display tracking-[0.1em] transition-all ${
                mobilePanel === 'feed'
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Radio className="h-3 w-3" />
              FEED
            </button>
            <button
              onClick={() => setMobilePanel('intel')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[9px] font-display tracking-[0.1em] transition-all ${
                mobilePanel === 'intel'
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Brain className="h-3 w-3" />
              INTEL
            </button>
          </div>

          {/* Desktop tabs */}
          <div className="hidden lg:flex items-center gap-1">
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
          </div>

          <div className="ml-auto hidden lg:block">
            <button
              onClick={() => setShowIntel(!showIntel)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[9px] font-display tracking-[0.12em] transition-all ${
                showIntel
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
              }`}
            >
              <Brain className="h-3 w-3" />
              INTEL
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex min-h-0">
          {/* Left: Live Dispatch Feed — desktop only */}
          <div className="w-72 shrink-0 hidden lg:flex flex-col border-r border-border/40">
            <IncidentFeed
              onSelectIncident={setSelectedIncident}
              selectedIncident={selectedIncident}
              cityFilter={cityFilter}
              onCityFilterChange={setCityFilter}
            />
          </div>

          {/* Center — desktop */}
          <div className="flex-1 min-w-0 hidden lg:block">
            {centerView === 'map' ? (
              <TacticalMap selectedIncident={selectedIncident} cityFilter={cityFilter} />
            ) : (
              <TrafficCameras />
            )}
          </div>

          {/* Mobile: show based on mobilePanel selection */}
          <div className="flex-1 min-w-0 flex flex-col lg:hidden">
            {mobilePanel === 'map' && (
              <TacticalMap selectedIncident={selectedIncident} cityFilter={cityFilter} />
            )}
            {mobilePanel === 'feed' && (
              <IncidentFeed
                onSelectIncident={(incident) => {
                  setSelectedIncident(incident);
                  setMobilePanel('map'); // Switch to map on incident select
                }}
                selectedIncident={selectedIncident}
                cityFilter={cityFilter}
                onCityFilterChange={setCityFilter}
              />
            )}
            {mobilePanel === 'intel' && (
              <IntelPanel />
            )}
          </div>

          {/* Right: Intel — desktop only */}
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
