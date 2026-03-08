import { useDispatchData, type DispatchCall } from '@/hooks/useDispatchData';
import { type Incident, type IncidentType, type Severity } from '@/data/mockData';
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

const TEXAS_CITIES = ['All Cities', 'Austin', 'Dallas', 'Houston', 'San Antonio'];

const formatTime = (ts: string) => {
  const d = new Date(ts);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 60000);
  if (isNaN(diff) || diff < 0) return '—';
  if (diff < 1) return 'NOW';
  if (diff < 60) return `${diff}m`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h`;
  return `${Math.floor(diff / 1440)}d`;
};

function mapCallTypeToIncidentType(callType: string): IncidentType {
  const ct = callType.toLowerCase();
  if (ct.includes('shoot') || ct.includes('robbery') || ct.includes('assault') || ct.includes('burglary') || ct.includes('theft') || ct.includes('weapon') || ct.includes('homicide') || ct.includes('suspicious') || ct.includes('trespass')) return 'crime';
  if (ct.includes('traffic') || ct.includes('accident') || ct.includes('crash') || ct.includes('vehicle') || ct.includes('collision') || ct.includes('hit and run') || ct.includes('reckless')) return 'traffic';
  if (ct.includes('fire') || ct.includes('smoke') || ct.includes('arson')) return 'fire';
  if (ct.includes('medical') || ct.includes('ems') || ct.includes('cardiac') || ct.includes('injury') || ct.includes('unconscious') || ct.includes('overdose')) return 'medical';
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

const IncidentCard = ({ incident, onClick, isSelected }: { incident: Incident; onClick: () => void; isSelected: boolean }) => {
  const Icon = typeIcons[incident.type];
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-2.5 border-b border-border/30 hover:bg-secondary/40 transition-all group ${
        isSelected ? 'bg-primary/8 border-l-2 border-l-primary' : 'border-l-2 border-l-transparent'
      }`}
    >
      <div className="flex items-start gap-2">
        <div className={`p-1 rounded ${
          incident.severity === 'critical' ? 'bg-destructive/15 text-destructive' :
          incident.severity === 'high' ? 'bg-warning/15 text-warning' :
          'bg-primary/10 text-primary'
        }`}>
          <Icon className="h-3 w-3" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className={`h-1.5 w-1.5 rounded-full ${severityColors[incident.severity]} ${
              incident.severity === 'critical' ? 'animate-pulse' : ''
            }`} />
            <span className="text-[8px] font-display text-muted-foreground/70 tracking-wider">{incident.id.slice(0, 12)}</span>
            <span className="text-[8px] font-display text-muted-foreground/50 ml-auto tabular-nums">{formatTime(incident.timestamp)}</span>
          </div>
          <p className="text-[11px] font-medium text-foreground truncate leading-tight">{incident.title}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin className="h-2 w-2 text-muted-foreground/50" />
            <p className="text-[9px] text-muted-foreground/70 truncate">{incident.location}</p>
          </div>
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className="text-[7px] font-display text-muted-foreground/60 tracking-wider">{incident.source}</span>
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

  const { data: dispatchData, isLoading } = useDispatchData(
    cityFilter === 'all' ? 'all' : cityFilter.toLowerCase()
  );

  const liveIncidents: Incident[] = (dispatchData?.calls || []).map(dispatchToIncident);

  const city = cityFilter || 'all';
  const filtered = liveIncidents.filter(i => {
    const matchesType = typeFilter === 'all' || i.type === typeFilter;
    const matchesCity = city === 'all' || i.location.toLowerCase().includes(city.toLowerCase());
    const matchesSearch = searchQuery === '' ||
      i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesCity && matchesSearch;
  });

  filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const types: (IncidentType | 'all')[] = ['all', 'crime', 'traffic', 'fire', 'medical', 'weather', 'hazard'];

  return (
    <div className="flex flex-col h-full bg-card/50">
      <div className="p-3 border-b border-border/50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Radio className="h-3 w-3 text-destructive animate-pulse" />
            <h2 className="font-display text-[10px] font-bold tracking-[0.15em] text-foreground">
              LIVE DISPATCH
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {isLoading && (
              <span className="text-[7px] font-display text-primary animate-pulse tracking-wider">SYNCING</span>
            )}
            <span className="text-[9px] font-display text-muted-foreground bg-secondary/50 px-1.5 py-0.5 rounded tabular-nums">
              {filtered.length}
            </span>
          </div>
        </div>

        <div className="relative mb-2">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground/50" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="w-full bg-secondary/50 border border-border/50 rounded px-7 py-1.5 text-[10px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/30 font-body"
          />
        </div>

        <select
          value={cityFilter}
          onChange={e => onCityFilterChange(e.target.value === 'All Cities' ? 'all' : e.target.value)}
          className="w-full bg-secondary/50 border border-border/50 rounded px-2 py-1 text-[10px] text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 font-display mb-2 appearance-none cursor-pointer"
        >
          {TEXAS_CITIES.map(c => (
            <option key={c} value={c === 'All Cities' ? 'all' : c}>{c}</option>
          ))}
        </select>

        <div className="flex gap-0.5 flex-wrap">
          {types.map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`text-[7px] font-display px-1.5 py-0.5 rounded transition-all tracking-wider ${
                typeFilter === t
                  ? 'bg-primary/15 text-primary'
                  : 'text-muted-foreground/60 hover:text-foreground hover:bg-secondary/30'
              }`}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <ScrollArea className="flex-1">
        {filtered.length === 0 ? (
          <div className="p-8 text-center">
            {isLoading ? (
              <div className="space-y-2">
                <Radio className="h-5 w-5 text-primary animate-pulse mx-auto" />
                <p className="text-[10px] text-muted-foreground font-display tracking-wider">CONNECTING TO DISPATCH...</p>
              </div>
            ) : (
              <p className="text-[10px] text-muted-foreground font-display tracking-wider">NO INCIDENTS</p>
            )}
          </div>
        ) : (
          filtered.map((incident, idx) => (
            <IncidentCard
              key={incident.id}
              incident={incident}
              isSelected={selectedIncident?.id === incident.id}
              onClick={() => onSelectIncident(incident)}
            />
          ))
        )}
      </ScrollArea>
    </div>
  );
};

export default IncidentFeed;
