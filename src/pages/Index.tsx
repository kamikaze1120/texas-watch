import { useState } from 'react';
import StatusBar from '@/components/dashboard/StatusBar';
import StatsBar from '@/components/dashboard/StatsBar';
import IncidentFeed from '@/components/dashboard/IncidentFeed';
import TacticalMap from '@/components/dashboard/TacticalMap';
import IntelPanel from '@/components/dashboard/IntelPanel';
import AlertBanner from '@/components/dashboard/AlertBanner';
import TrafficCameras from '@/components/dashboard/TrafficCameras';
import { type Incident } from '@/data/mockData';
import { Map, Camera, Brain } from 'lucide-react';

type CenterView = 'map' | 'cameras';

const Index = () => {
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [centerView, setCenterView] = useState<CenterView>('map');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [showIntel, setShowIntel] = useState(true);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-background">
      <StatusBar />
      <StatsBar />

      {/* Center View Tabs */}
      <div className="h-9 bg-card/50 border-b border-border flex items-center px-5 gap-1 shrink-0">
        <button
          onClick={() => setCenterView('map')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-display tracking-wider transition-all ${
            centerView === 'map'
              ? 'bg-primary/15 text-primary ring-1 ring-primary/20'
              : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
          }`}
        >
          <Map className="h-3 w-3" />
          TACTICAL MAP
        </button>
        <button
          onClick={() => setCenterView('cameras')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-display tracking-wider transition-all ${
            centerView === 'cameras'
              ? 'bg-primary/15 text-primary ring-1 ring-primary/20'
              : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
          }`}
        >
          <Camera className="h-3 w-3" />
          TRAFFIC CAMERAS
        </button>

        <div className="ml-auto">
          <button
            onClick={() => setShowIntel(!showIntel)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-display tracking-wider transition-all ${
              showIntel
                ? 'bg-primary/15 text-primary ring-1 ring-primary/20'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
            }`}
          >
            <Brain className="h-3 w-3" />
            <span className="hidden sm:inline">AI INTEL</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* Left: Incident Feed */}
        <div className="w-80 shrink-0 hidden lg:flex flex-col border-r border-border">
          <IncidentFeed
            onSelectIncident={setSelectedIncident}
            selectedIncident={selectedIncident}
            cityFilter={cityFilter}
            onCityFilterChange={setCityFilter}
          />
        </div>

        {/* Center: Map or Cameras */}
        <div className="flex-1 min-w-0">
          {centerView === 'map' ? (
            <TacticalMap selectedIncident={selectedIncident} cityFilter={cityFilter} />
          ) : (
            <TrafficCameras />
          )}
        </div>

        {/* Right: AI Intel Panel */}
        {showIntel && (
          <div className="w-80 shrink-0 hidden xl:flex flex-col border-l border-border">
            <IntelPanel />
          </div>
        )}
      </div>

      <AlertBanner />
    </div>
  );
};

export default Index;
