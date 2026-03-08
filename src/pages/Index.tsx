import { useState } from 'react';
import StatusBar from '@/components/dashboard/StatusBar';
import StatsBar from '@/components/dashboard/StatsBar';
import IncidentFeed from '@/components/dashboard/IncidentFeed';
import TacticalMap from '@/components/dashboard/TacticalMap';
import IntelPanel from '@/components/dashboard/IntelPanel';
import AlertBanner from '@/components/dashboard/AlertBanner';
import { type Incident } from '@/data/mockData';

const Index = () => {
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden scanline">
      <StatusBar />
      <StatsBar />

      <div className="flex-1 flex min-h-0">
        {/* Left: Incident Feed */}
        <div className="w-80 shrink-0 hidden lg:flex flex-col">
          <IncidentFeed onSelectIncident={setSelectedIncident} />
        </div>

        {/* Center: Tactical Map */}
        <div className="flex-1 min-w-0">
          <TacticalMap selectedIncident={selectedIncident} />
        </div>

        {/* Right: AI Intel Panel */}
        <div className="w-80 shrink-0 hidden xl:flex flex-col">
          <IntelPanel />
        </div>
      </div>

      <AlertBanner />
    </div>
  );
};

export default Index;
