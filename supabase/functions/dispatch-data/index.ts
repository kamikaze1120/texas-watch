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

// ── Austin: APD CAD Incidents (Socrata SODA API) ──
async function fetchAustin(): Promise<DispatchCall[]> {
  try {
    const url = 'https://data.austintexas.gov/resource/22de-7rzg.json?$order=call_datetime%20DESC&$limit=50&$where=call_datetime%3E%272026-01-01%27';
    const res = await fetch(url, {
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) {
      console.error(`Austin API returned ${res.status}`);
      return [];
    }
    const data = await res.json();
    return data.map((r: any) => ({
      id: `AUS-${r.incident_number || r.cad_incident_number || Math.random().toString(36).substr(2, 8)}`,
      city: 'Austin',
      callType: r.problem || r.call_type || 'Unknown',
      description: r.initial_problem_description || r.problem || '',
      location: r.address || r.block || 'Austin, TX',
      timestamp: r.call_datetime || r.response_datetime || new Date().toISOString(),
      status: r.disposition || r.call_status || 'Active',
      priority: r.priority || '3',
      severity: mapPriority(r.priority),
      source: 'Austin PD CAD',
      lat: r.latitude ? parseFloat(r.latitude) : undefined,
      lng: r.longitude ? parseFloat(r.longitude) : undefined,
    }));
  } catch (err) {
    console.error('Austin fetch error:', err);
    return [];
  }
}

// ── Dallas: Police Active Calls (Socrata SODA API) ──
async function fetchDallas(): Promise<DispatchCall[]> {
  try {
    const url = 'https://www.dallasopendata.com/resource/9fxf-t2tr.json?$limit=50';
    const res = await fetch(url, {
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) {
      console.error(`Dallas API returned ${res.status}`);
      return [];
    }
    const data = await res.json();
    return data.map((r: any) => ({
      id: `DAL-${r.incident_number || Math.random().toString(36).substr(2, 8)}`,
      city: 'Dallas',
      callType: r.nature_of_call || r.type_of_incident || 'Unknown',
      description: r.nature_of_call || r.type_of_incident || '',
      location: `${r.block || ''} ${r.location || ''}`.trim() || 'Dallas, TX',
      timestamp: r.date ? `${r.date}T${r.time || '00:00:00'}` : new Date().toISOString(),
      status: r.status || 'Active',
      priority: r.priority || '3',
      severity: mapDallasSeverity(r.nature_of_call || r.type_of_incident || ''),
      source: 'Dallas PD Active Calls',
      lat: undefined,
      lng: undefined,
    }));
  } catch (err) {
    console.error('Dallas fetch error:', err);
    return [];
  }
}

// ── Houston: HPD Crime Stats (no live CAD available publicly) ──
async function fetchHouston(): Promise<DispatchCall[]> {
  try {
    // Houston uses a different data portal (CKAN-based) — try the police incidents endpoint
    const url = 'https://data.houstontx.gov/api/3/action/datastore_search?resource_id=f9db5fb6-7a6d-4d87-b06f-e3bfae982e54&limit=30&sort=_id%20desc';
    const res = await fetch(url, {
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) {
      console.log(`Houston API returned ${res.status}, trying fallback`);
      return await fetchHoustonFallback();
    }
    const data = await res.json();
    if (!data.result?.records?.length) {
      return await fetchHoustonFallback();
    }
    return data.result.records.map((r: any) => ({
      id: `HOU-${r.Incident || r._id || Math.random().toString(36).substr(2, 8)}`,
      city: 'Houston',
      callType: r.Offense_Type || r.offense_type || 'Unknown',
      description: r.Offense_Type || '',
      location: `${r.Block_Range || ''} ${r.Street_Name || ''}`.trim() || 'Houston, TX',
      timestamp: r.Date || r.Occurrence_Date || new Date().toISOString(),
      status: 'Reported',
      priority: '3',
      severity: 'medium' as const,
      source: 'Houston PD',
    }));
  } catch (err) {
    console.error('Houston fetch error:', err);
    return [];
  }
}

async function fetchHoustonFallback(): Promise<DispatchCall[]> {
  try {
    // Try the citizens police report data
    const url = 'https://data.houstontx.gov/api/3/action/datastore_search?resource_id=57124b23-0161-4a74-8329-4e04d4087c48&limit=20&sort=_id%20desc';
    const res = await fetch(url, {
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.result?.records) return [];
    return data.result.records.map((r: any) => ({
      id: `HOU-${r._id || Math.random().toString(36).substr(2, 8)}`,
      city: 'Houston',
      callType: r.offense_type || r.Offense_Type || 'Police Incident',
      description: r.offense_type || '',
      location: `${r.block_range || ''} ${r.street_name || ''}`.trim() || 'Houston, TX',
      timestamp: r.date || new Date().toISOString(),
      status: 'Reported',
      priority: '3',
      severity: 'medium' as const,
      source: 'Houston PD',
    }));
  } catch (err) {
    console.log('Houston fallback also failed:', err);
    return [];
  }
}

// ── San Antonio: SAPD Calls for Service (CKAN API) ──
async function fetchSanAntonio(): Promise<DispatchCall[]> {
  try {
    const url = 'https://data.sanantonio.gov/api/3/action/datastore_search?resource_id=calls-for-service&limit=30&sort=_id%20desc';
    const res = await fetch(url, {
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) {
      console.log(`San Antonio API returned ${res.status}, trying alternate`);
      return await fetchSanAntonioAlternate();
    }
    const data = await res.json();
    if (!data.result?.records?.length) {
      return await fetchSanAntonioAlternate();
    }
    return data.result.records.map((r: any) => ({
      id: `SAT-${r.INCIDENTID || r._id || Math.random().toString(36).substr(2, 8)}`,
      city: 'San Antonio',
      callType: r.Category || r.CATEGORY || r.Problem || 'Unknown',
      description: r.Category || r.CATEGORY || '',
      location: r.Address || r.XBLK || 'San Antonio, TX',
      timestamp: r.OPENEDDATETIME || r.openeddatetime || new Date().toISOString(),
      status: r.Disposition || 'Active',
      priority: r.Priority || '3',
      severity: mapPriority(r.Priority),
      source: 'SAPD Calls for Service',
    }));
  } catch (err) {
    console.error('San Antonio fetch error:', err);
    return [];
  }
}

async function fetchSanAntonioAlternate(): Promise<DispatchCall[]> {
  try {
    // Try direct SAPD Calls for Service CSV resource
    const url = 'https://data.sanantonio.gov/dataset/73cb90a0-9e22-40da-87ca-a0cae7bcb592/resource/284df1f5-f7a3-40ae-bdbf-1c8b97e84e66/download/sapd-calls-for-service.csv';
    const res = await fetch(url, {
      headers: { 'Accept': 'text/csv' },
    });
    if (!res.ok) return [];
    const text = await res.text();
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    // Take last 30 rows (most recent)
    const recentLines = lines.slice(-30);
    
    return recentLines.map((line, i) => {
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      const row: Record<string, string> = {};
      headers.forEach((h, idx) => { row[h] = values[idx] || ''; });
      
      return {
        id: `SAT-${row['INCIDENTID'] || row['IncidentID'] || i}`,
        city: 'San Antonio',
        callType: row['Category'] || row['CATEGORY'] || 'Unknown',
        description: row['Category'] || '',
        location: row['Address'] || row['XBLK'] || 'San Antonio, TX',
        timestamp: row['OPENEDDATETIME'] || row['OpenedDateTime'] || new Date().toISOString(),
        status: 'Reported',
        priority: row['Priority'] || '3',
        severity: mapPriority(row['Priority']),
        source: 'SAPD Calls for Service',
      };
    });
  } catch (err) {
    console.log('San Antonio alternate also failed:', err);
    return [];
  }
}

// ── Severity mapping helpers ──
function mapPriority(priority: string | undefined): 'critical' | 'high' | 'medium' | 'low' {
  switch (priority?.toString()) {
    case '0': case '1': return 'critical';
    case '2': return 'high';
    case '3': return 'medium';
    default: return 'low';
  }
}

function mapDallasSeverity(natureOfCall: string): 'critical' | 'high' | 'medium' | 'low' {
  const call = natureOfCall.toLowerCase();
  if (call.includes('shooting') || call.includes('stabbing') || call.includes('major') || call.includes('homicide') || call.includes('active shooter')) return 'critical';
  if (call.includes('robbery') || call.includes('assault') || call.includes('burglary') || call.includes('weapon') || call.includes('injury')) return 'high';
  if (call.includes('theft') || call.includes('accident') || call.includes('suspicious') || call.includes('disturbance')) return 'medium';
  return 'low';
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
      // Fetch all cities in parallel
      const [austin, dallas, houston, sanAntonio] = await Promise.allSettled([
        fetchAustin(),
        fetchDallas(),
        fetchHouston(),
        fetchSanAntonio(),
      ]);

      if (austin.status === 'fulfilled') calls.push(...austin.value);
      if (dallas.status === 'fulfilled') calls.push(...dallas.value);
      if (houston.status === 'fulfilled') calls.push(...houston.value);
      if (sanAntonio.status === 'fulfilled') calls.push(...sanAntonio.value);
    } else {
      switch (city.toLowerCase()) {
        case 'austin': calls = await fetchAustin(); break;
        case 'dallas': calls = await fetchDallas(); break;
        case 'houston': calls = await fetchHouston(); break;
        case 'san antonio': case 'sanantonio': calls = await fetchSanAntonio(); break;
      }
    }

    // Sort by timestamp descending
    calls.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Limit results
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
