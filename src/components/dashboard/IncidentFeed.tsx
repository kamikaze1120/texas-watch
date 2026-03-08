import { mockIncidents, type Incident, type IncidentType, type Severity } from '@/data/mockData';
import { useDispatchData, type DispatchCall } from '@/hooks/useDispatchData';
import { AlertTriangle, Car, Flame, Heart, Shield, CloudLightning, Biohazard, Search, MapPin, Radio } from 'lucide-react';
import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

const typeIcons: Record<IncidentType, React.ElementType> = {
  crime: Shield,
  traffic: Car,
  fire: Flame,
  medical: Heart,
  alert: AlertTriangle,
  weather: CloudLightning,
  hazard: Biohazard,
};

const severityColors: Record<Severity, string> = {
  critical: 'bg-destructive',
  high: 'bg-warning',
  medium: 'bg-primary',
  low: 'bg-muted-foreground',
};

const statusLabels: Record<string, string> = {
  active: 'ACTIVE',
  responding: 'RESPONDING',
  resolved: 'RESOLVED',
  reported: 'REPORTED',
};

const TEXAS_CITIES = [
  'All Cities',
  'Austin',
  'Beaumont',
  'Dallas',
  'El Paso',
  'Fort Worth',
  'Houston',
  'Irving',
  'McKinney',
  'Plano',
  'San Antonio',
  'Tarrant County',
];

const formatTime = (ts: string) => {
  const d = new Date(ts);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 60000);
  if (diff < 1) return 'JUST NOW';
  if (diff < 60) return `${diff}m AGO`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h AGO`;
  return `${Math.floor(diff / 1440)}d AGO`;
};

function mapCallTypeToIncidentType(callType: string): IncidentType {
  const ct = callType.toLowerCase();
  if (ct.includes('shoot') || ct.includes('robbery') || ct.includes('assault') || ct.includes('burglary') || ct.includes('theft') || ct.includes('weapon') || ct.includes('homicide') || ct.includes('suspicious')) return 'crime';
  if (ct.includes('traffic') || ct.includes('accident') || ct.includes('crash') || ct.includes('vehicle') || ct.includes('collision') || ct.includes('hit and run')) return 'traffic';
  if (ct.includes('fire') || ct.includes('smoke') || ct.includes('arson')) return 'fire';
  if (ct.includes('medical') || ct.includes('ems') || ct.includes('cardiac') || ct.includes('injury') || ct.includes('unconscious')) return 'medical';
  if (ct.includes('weather') || ct.includes('flood') || ct.includes('tornado')) return 'weather';
  if (ct.includes('hazmat') || ct.includes('chemical') || ct.includes('spill')) return 'hazard';
  return 'alert';
}

function dispatchToIncident(call: DispatchCall): Incident {
  return {
    id: call.id,
    type: mapCallTypeToIncidentType(call.callType),
    title: call.callType,
    description: call.description,
    location: call.location,
    lat: call.lat || 31.0,
    lng: call.lng || -99.5,
    timestamp: call.timestamp,
    severity: call.severity,
    source: call.source,
    status: call.status.toLowerCase().includes('scene') ? 'responding' : 'active',
  };
}

const IncidentCard = ({ incident, onClick, isSelected, isLive }: { incident: Incident; onClick: () => void; isSelected: boolean; isLive?: boolean }) => {
  const Icon = typeIcons[incident.type];
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 border-b border-border/50 hover:bg-secondary/60 transition-all duration-200 ${
        isSelected ? 'bg-primary/10 border-l-2 border-l-primary' : ''
      }`}
    >
      <div className="flex items-start gap-2.5">
        <div className={`p-1.5 rounded-md ${
          incident.severity === 'critical' ? 'bg-destructive/15 text-destructive' :
          incident.severity === 'high' ? 'bg-warning/15 text-warning' :
          'bg-primary/15 text-primary'
        }`}>
          <Icon className="h-3.5 w-3.5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={`h-1.5 w-1.5 rounded-full ${severityColors[incident.severity]} ${
              incident.severity === 'critical' ? 'animate-pulse' : ''
            }`} />
            <span className="text-[10px] font-display text-muted-foreground">{incident.id}</span>
            {isLive && (
              <span className="flex items-center gap-0.5 text-[8px] font-display text-destructive">
                <Radio className="h-2 w-2 animate-pulse" />
                LIVE
              </span>
            )}
            <span className="text-[10px] font-display text-muted-foreground ml-auto">{formatTime(incident.timestamp)}</span>
          </div>
          <p className="text-xs font-medium text-foreground truncate leading-snug">{incident.title}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin className="h-2.5 w-2.5 text-muted-foreground" />
            <p className="text-[10px] text-muted-foreground truncate">{incident.location}</p>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-[9px] font-display px-1.5 py-0.5 rounded-full ${
              incident.status === 'active' ? 'bg-destructive/15 text-destructive' :
              incident.status === 'responding' ? 'bg-warning/15 text-warning' :
              'bg-success/15 text-success'
            }`}>
              {statusLabels[incident.status] || incident.status.toUpperCase()}
            </span>
            <span className="text-[9px] text-muted-foreground font-display">{incident.source}</span>
          </div>
        </div>
      </div>
    </button>
  );
};

interface IncidentFeedProps {
  onSelectIncident: (incident: Incident) => void;
  selectedIncident: Incident | null;
  cityFilter: string;
  onCityFilterChange: (city: string) => void;
}

const IncidentFeed = ({ onSelectIncident, selectedIncident, cityFilter, onCityFilterChange }: IncidentFeedProps) => {
  const [typeFilter, setTypeFilter] = useState<IncidentType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dataSource, setDataSource] = useState<'all' | 'live' | 'mock'>('all');

  const { data: dispatchData, isLoading: dispatchLoading } = useDispatchData(
    cityFilter === 'all' ? 'all' : cityFilter.toLowerCase()
  );

  // Convert dispatch calls to Incident format
  const liveIncidents: Incident[] = (dispatchData?.calls || []).map(dispatchToIncident);

  // Merge data sources
  const allIncidents = dataSource === 'live' ? liveIncidents :
                       dataSource === 'mock' ? mockIncidents :
                       [...liveIncidents, ...mockIncidents];

  // Track which IDs are live
  const liveIds = new Set(liveIncidents.map(i => i.id));

  const city = cityFilter || 'all';
  const filtered = allIncidents.filter(i => {
    const matchesType = typeFilter === 'all' || i.type === typeFilter;
    const matchesCity = city === 'all' || i.location.toLowerCase().includes(city.toLowerCase());
    const matchesSearch = searchQuery === '' || 
      i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesCity && matchesSearch;
  });

  // Sort by timestamp descending
  filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const types: (IncidentType | 'all')[] = ['all', 'crime', 'traffic', 'fire', 'medical', 'weather', 'hazard'];

  return (
    <div className="flex flex-col h-full bg-card">
      <div className="p-3 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-xs font-semibold tracking-widest text-primary">
            INCIDENT FEED
          </h2>
          <div className="flex items-center gap-2">
            {dispatchLoading && (
              <span className="text-[8px] font-display text-warning animate-pulse">SYNCING...</span>
            )}
            {dispatchData && (
              <span className="flex items-center gap-1 text-[8px] font-display text-success">
                <Radio className="h-2 w-2" />
                {dispatchData.total} LIVE
              </span>
            )}
            <span className="text-[10px] font-display text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
              {filtered.length}
            </span>
          </div>
        </div>

        {/* Data source toggle */}
        <div className="flex gap-1 mb-2.5">
          {(['all', 'live', 'mock'] as const).map(src => (
            <button
              key={src}
              onClick={() => setDataSource(src)}
              className={`text-[9px] font-display px-2 py-1 rounded-full transition-all ${
                dataSource === src
                  ? 'bg-primary/20 text-primary ring-1 ring-primary/30'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              {src === 'all' ? 'ALL' : src === 'live' ? '🔴 LIVE 911' : 'SIMULATED'}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-2.5">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search incidents..."
            className="w-full bg-secondary border border-border rounded-md pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 font-body"
          />
        </div>

        {/* City Filter */}
        <div className="mb-2.5">
          <select
            value={cityFilter}
            onChange={e => onCityFilterChange(e.target.value === 'All Cities' ? 'all' : e.target.value)}
            className="w-full bg-secondary border border-border rounded-md px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 font-display appearance-none cursor-pointer"
          >
            {TEXAS_CITIES.map(city => (
              <option key={city} value={city === 'All Cities' ? 'all' : city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        {/* City breakdown for live data */}
        {dispatchData && dataSource !== 'mock' && (
          <div className="flex gap-2 mb-2.5 flex-wrap">
            {Object.entries(dispatchData.cities).map(([c, count]) => (
              count > 0 && (
                <span key={c} className="text-[8px] font-display text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                  {c.toUpperCase()}: {count}
                </span>
              )
            ))}
          </div>
        )}

        {/* Type Filters */}
        <div className="flex gap-1 flex-wrap">
          {types.map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`text-[9px] font-display px-2 py-1 rounded-full transition-all ${
                typeFilter === t
                  ? 'bg-primary/20 text-primary ring-1 ring-primary/30'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      <ScrollArea className="flex-1">
        {filtered.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-xs text-muted-foreground font-display">NO INCIDENTS FOUND</p>
          </div>
        ) : (
          filtered.map(incident => (
            <IncidentCard
              key={incident.id}
              incident={incident}
              isSelected={selectedIncident?.id === incident.id}
              onClick={() => onSelectIncident(incident)}
              isLive={liveIds.has(incident.id)}
            />
          ))
        )}
      </ScrollArea>
    </div>
  );
};

export default IncidentFeed;
