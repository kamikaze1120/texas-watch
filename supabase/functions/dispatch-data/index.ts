import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DispatchCall {
  id: string;
  city: string;
  callType: string;
  description: string;
  location: string;
  timestamp: string;
  status: string;
  priority: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  source: string;
  lat?: number;
  lng?: number;
}

// City centers for approximate geocoding when no coords available
const CITY_COORDS: Record<string, { lat: number; lng: number; spread: number }> = {
  'Austin':      { lat: 30.2672, lng: -97.7431, spread: 0.12 },
  'Dallas':      { lat: 32.7767, lng: -96.7970, spread: 0.15 },
  'Houston':     { lat: 29.7604, lng: -95.3698, spread: 0.18 },
  'San Antonio': { lat: 29.4241, lng: -98.4936, spread: 0.14 },
};

function approximateCoords(city: string, id: string): { lat: number; lng: number } {
  const base = CITY_COORDS[city] || CITY_COORDS['Austin'];
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash) + id.charCodeAt(i);
    hash |= 0;
  }
  const latOff = ((hash & 0xFF) / 255 - 0.5) * base.spread * 2;
  const lngOff = (((hash >> 8) & 0xFF) / 255 - 0.5) * base.spread * 2;
  return { lat: base.lat + latOff, lng: base.lng + lngOff };
}

function mapCallSeverity(callType: string, priority?: string): 'critical' | 'high' | 'medium' | 'low' {
  const ct = callType.toLowerCase();
  if (ct.includes('shooting') || ct.includes('shots fired') || ct.includes('homicide') || 
      ct.includes('active shooter') || ct.includes('kidnap') || ct.includes('stabbing') ||
      ct.includes('officer down') || ct.includes('major accident') || ct.includes('major dist') ||
      ct.includes('fatality') || ct.includes('crash') || ct.includes('pursuit')) return 'critical';
  if (ct.includes('robbery') || ct.includes('assault') || ct.includes('weapon') || 
      ct.includes('burg') || ct.includes('injury') || ct.includes('ambulance') || 
      ct.includes('emergency') || ct.includes('accident') || ct.includes('hit and run') ||
      ct.includes('hazard') || ct.includes('reckless') || ct.includes('dui') || ct.includes('stall')) return 'high';
  if (ct.includes('theft') || ct.includes('suspicious') || ct.includes('disturbance') || 
      ct.includes('trespass') || ct.includes('alarm') || ct.includes('domestic') ||
      ct.includes('collision') || ct.includes('traffic')) return 'medium';
  if (priority) {
    switch (priority.toString().replace(/\D/g, '')) {
      case '0': case '1': return 'critical';
      case '2': return 'high';
      case '3': return 'medium';
    }
  }
  return 'low';
}

// ── Austin: Real-Time Traffic Incidents (has live lat/lng) ──
async function fetchAustin(): Promise<DispatchCall[]> {
  try {
    const url = 'https://data.austintexas.gov/resource/dx9v-zd7x.json?$order=published_date%20DESC&$limit=40&$where=traffic_report_status=%27ACTIVE%27%20OR%20published_date%3E%272026-03-07%27';
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) {
      console.error(`Austin traffic API: ${res.status}`);
      // Fallback: get recent regardless of status
      const res2 = await fetch('https://data.austintexas.gov/resource/dx9v-zd7x.json?$order=published_date%20DESC&$limit=40', { headers: { 'Accept': 'application/json' } });
      if (!res2.ok) return [];
      const data2 = await res2.json();
      return mapAustinData(data2);
    }
    const data = await res.json();
    return mapAustinData(data);
  } catch (err) { console.error('Austin fetch error:', err); return []; }
}

function mapAustinData(data: any[]): DispatchCall[] {
  return data.map((r: any) => ({
    id: `AUS-${r.traffic_report_id?.slice(0, 12) || Math.random().toString(36).substr(2, 8)}`,
    city: 'Austin',
    callType: r.issue_reported || 'Traffic Incident',
    description: `${r.issue_reported || ''} - ${r.address || ''}`,
    location: r.address || 'Austin, TX',
    timestamp: r.published_date || new Date().toISOString(),
    status: r.traffic_report_status || 'Active',
    priority: '3',
    severity: mapCallSeverity(r.issue_reported || ''),
    source: (r.agency || 'Austin PD').trim(),
    lat: r.latitude ? parseFloat(r.latitude) : undefined,
    lng: r.longitude ? parseFloat(r.longitude) : undefined,
  }));
}

// ── Dallas: Police Active Calls ──
async function fetchDallas(): Promise<DispatchCall[]> {
  try {
    const url = 'https://www.dallasopendata.com/resource/9fxf-t2tr.json?$limit=50';
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) { console.error(`Dallas API: ${res.status}`); return []; }
    const data = await res.json();
    return data.map((r: any) => {
      const id = `DAL-${r.incident_number || Math.random().toString(36).substr(2, 8)}`;
      const coords = approximateCoords('Dallas', id);
      return {
        id, city: 'Dallas',
        callType: r.nature_of_call || r.type_of_incident || 'Unknown',
        description: r.nature_of_call || r.type_of_incident || '',
        location: `${r.block || ''} ${r.location || ''}`.trim() || 'Dallas, TX',
        timestamp: r.date ? `${r.date}T${r.time || '00:00:00'}` : new Date().toISOString(),
        status: r.status || 'Active',
        priority: r.priority || '3',
        severity: mapCallSeverity(r.nature_of_call || r.type_of_incident || '', r.priority),
        source: 'Dallas PD',
        lat: coords.lat, lng: coords.lng,
      };
    });
  } catch (err) { console.error('Dallas fetch error:', err); return []; }
}

// ── Houston: Real-Time Police Incidents ──
async function fetchHouston(): Promise<DispatchCall[]> {
  try {
    // Try the real-time police incidents feed
    const url = 'https://data.houstontx.gov/resource/gxch-d37s.json?$order=date%20DESC&$limit=40';
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) {
      console.error(`Houston primary API: ${res.status}`);
      return await fetchHoustonFallback();
    }
    const data = await res.json();
    if (!data.length) return await fetchHoustonFallback();
    return data.map((r: any) => {
      const id = `HOU-${r.incident || r._id || Math.random().toString(36).substr(2, 8)}`;
      const hasCoords = r.latitude && r.longitude;
      const coords = hasCoords ? { lat: parseFloat(r.latitude), lng: parseFloat(r.longitude) } : approximateCoords('Houston', id);
      return {
        id, city: 'Houston',
        callType: r.offense_type || r.offensetype || r.type || 'Police Incident',
        description: r.offense_type || r.type || '',
        location: `${r.block_range || r.blockrange || ''} ${r.street_name || r.streetname || ''}`.trim() || 'Houston, TX',
        timestamp: r.date || r.occurrence_date || new Date().toISOString(),
        status: 'Reported', priority: '3',
        severity: mapCallSeverity(r.offense_type || r.offensetype || r.type || ''),
        source: 'Houston PD',
        lat: coords.lat, lng: coords.lng,
      };
    });
  } catch (err) { console.error('Houston fetch error:', err); return []; }
}

async function fetchHoustonFallback(): Promise<DispatchCall[]> {
  try {
    // Try alternate endpoint
    const url = 'https://data.houstontx.gov/resource/djfr-ym8d.json?$order=date%20DESC&$limit=30';
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.map((r: any) => {
      const id = `HOU-${r._id || Math.random().toString(36).substr(2, 8)}`;
      const coords = approximateCoords('Houston', id);
      return {
        id, city: 'Houston',
        callType: r.offense_type || 'Police Incident',
        description: r.offense_type || '',
        location: `${r.block_range || ''} ${r.street_name || ''}`.trim() || 'Houston, TX',
        timestamp: r.date || new Date().toISOString(),
        status: 'Reported', priority: '3',
        severity: mapCallSeverity(r.offense_type || ''),
        source: 'Houston PD',
        lat: coords.lat, lng: coords.lng,
      };
    });
  } catch (err) { return []; }
}

// ── San Antonio: SAFFE Incidents ──
async function fetchSanAntonio(): Promise<DispatchCall[]> {
  try {
    // Use Socrata-based SAPD dataset  
    const url = 'https://data.sanantonio.gov/resource/jbp5-7mfg.json?$order=report_date%20DESC&$limit=30';
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) {
      console.error(`San Antonio API: ${res.status}`);
      return await fetchSanAntonioFallback();
    }
    const data = await res.json();
    if (!data.length) return await fetchSanAntonioFallback();
    return data.map((r: any) => {
      const id = `SAT-${r.case_number || r.incidentid || Math.random().toString(36).substr(2, 8)}`;
      const hasCoords = r.location_1?.coordinates;
      const coords = hasCoords 
        ? { lat: r.location_1.coordinates[1], lng: r.location_1.coordinates[0] }
        : approximateCoords('San Antonio', id);
      return {
        id, city: 'San Antonio',
        callType: r.ucr_category || r.category || r.offense_description || 'Unknown',
        description: r.offense_description || r.ucr_category || '',
        location: r.block_address || r.address || 'San Antonio, TX',
        timestamp: r.report_date || r.date_of_occurrence || new Date().toISOString(),
        status: 'Reported', priority: '3',
        severity: mapCallSeverity(r.ucr_category || r.category || r.offense_description || ''),
        source: 'SAPD',
        lat: coords.lat, lng: coords.lng,
      };
    });
  } catch (err) { console.error('San Antonio fetch error:', err); return []; }
}

async function fetchSanAntonioFallback(): Promise<DispatchCall[]> {
  try {
    // Try alternate SAPD feed
    const url = 'https://data.sanantonio.gov/resource/4yhy-2cjb.json?$order=date%20DESC&$limit=25';
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.map((r: any) => {
      const id = `SAT-${r._id || Math.random().toString(36).substr(2, 8)}`;
      const coords = approximateCoords('San Antonio', id);
      return {
        id, city: 'San Antonio',
        callType: r.category || r.offense || 'Unknown',
        description: r.category || '',
        location: r.address || r.location || 'San Antonio, TX',
        timestamp: r.date || new Date().toISOString(),
        status: 'Reported', priority: '3',
        severity: mapCallSeverity(r.category || r.offense || ''),
        source: 'SAPD',
        lat: coords.lat, lng: coords.lng,
      };
    });
  } catch (err) { return []; }
}

// ── Deduplication ──
function deduplicateCalls(calls: DispatchCall[]): DispatchCall[] {
  const seen = new Map<string, DispatchCall>();
  for (const call of calls) {
    if (!seen.has(call.id)) seen.set(call.id, call);
  }
  return Array.from(seen.values());
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const city = url.searchParams.get('city') || 'all';
    const limit = parseInt(url.searchParams.get('limit') || '100');

    let calls: DispatchCall[] = [];

    if (city === 'all') {
      const [austin, dallas, houston, sanAntonio] = await Promise.allSettled([
        fetchAustin(), fetchDallas(), fetchHouston(), fetchSanAntonio(),
      ]);
      if (austin.status === 'fulfilled') calls.push(...austin.value);
      if (dallas.status === 'fulfilled') calls.push(...dallas.value);
      if (houston.status === 'fulfilled') calls.push(...houston.value);
      if (sanAntonio.status === 'fulfilled') calls.push(...sanAntonio.value);
      
      // Log results for debugging
      console.log(`Fetched: AUS=${austin.status === 'fulfilled' ? austin.value.length : 'ERR'} DAL=${dallas.status === 'fulfilled' ? dallas.value.length : 'ERR'} HOU=${houston.status === 'fulfilled' ? houston.value.length : 'ERR'} SAT=${sanAntonio.status === 'fulfilled' ? sanAntonio.value.length : 'ERR'}`);
    } else {
      switch (city.toLowerCase()) {
        case 'austin': calls = await fetchAustin(); break;
        case 'dallas': calls = await fetchDallas(); break;
        case 'houston': calls = await fetchHouston(); break;
        case 'san antonio': case 'sanantonio': calls = await fetchSanAntonio(); break;
      }
    }

    calls = deduplicateCalls(calls);
    calls.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    calls = calls.slice(0, limit);

    const result = {
      calls,
      total: calls.length,
      cities: {
        austin: calls.filter(c => c.city === 'Austin').length,
        dallas: calls.filter(c => c.city === 'Dallas').length,
        houston: calls.filter(c => c.city === 'Houston').length,
        sanAntonio: calls.filter(c => c.city === 'San Antonio').length,
      },
      lastUpdated: new Date().toISOString(),
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=30' },
    });
  } catch (error) {
    console.error('Dispatch data error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch dispatch data' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
