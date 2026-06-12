import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ITS_BASE = 'https://its.txdot.gov/its/DistrictIts';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// Friendly metro name -> TxDOT district code
const DISTRICTS: Record<string, string> = {
  austin: 'AUS',
  dallas: 'DAL',
  fortworth: 'FTW',
  houston: 'HOU',
  sanantonio: 'SAT',
  elpaso: 'ELP',
  AUS: 'AUS', DAL: 'DAL', FTW: 'FTW', HOU: 'HOU', SAT: 'SAT', ELP: 'ELP',
};

function resolveDistrict(input: string | null): string {
  if (!input) return 'AUS';
  const key = input.trim().toLowerCase().replace(/\s+/g, '');
  return DISTRICTS[key] || DISTRICTS[input.toUpperCase()] || input.toUpperCase();
}

// Fetch the camera list (locations + status) for a district
async function fetchCameraList(district: string) {
  const url = `${ITS_BASE}/GetCctvStatusListByDistrict?districtCode=${district}`;
  const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' } });
  if (!res.ok) throw new Error(`status ${res.status}`);
  const data = await res.json();

  const roadwayMap = data?.roadwayCctvStatuses ?? {};
  const cameras: any[] = [];
  for (const roadway of Object.keys(roadwayMap)) {
    for (const cam of roadwayMap[roadway] || []) {
      const lat = Number(cam.latitude);
      const lng = Number(cam.longitude);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
      cameras.push({
        id: cam.icd_Id,
        name: cam.name || cam.icd_Id,
        roadway: cam.equipLoc?.roadway || roadway,
        direction: cam.dirDescription || cam.equipLoc?.direction || '',
        lat,
        lng,
        online: (cam.statusDescription || '').toLowerCase().includes('online'),
        hasSnapshot: !!cam.hasSnapshot,
        district,
      });
    }
  }
  return cameras;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'snapshot';
    const district = resolveDistrict(url.searchParams.get('district'));

    if (action === 'list') {
      const cameras = await fetchCameraList(district);
      return new Response(JSON.stringify({ district, cameras, total: cameras.length }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=120' },
      });
    }

    // Snapshot mode — returns a live JPEG image for one camera
    const camera = url.searchParams.get('camera');
    if (!camera) {
      return new Response(JSON.stringify({ error: 'Missing camera parameter' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const snapUrl = `${ITS_BASE}/GetCctvSnapshotByIcdId?icdId=${encodeURIComponent(camera)}&districtCode=${district}`;
    const res = await fetch(snapUrl, { headers: { 'User-Agent': UA, Accept: 'application/json' } });

    if (!res.ok) {
      return new Response(JSON.stringify({ error: 'Camera feed unavailable' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await res.json();
    const b64: string | null = data?.snippet || null;
    if (!b64) {
      return new Response(JSON.stringify({ error: 'No snapshot available' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Decode base64 JPEG to binary
    const binary = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    return new Response(binary, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=20',
        'X-Snapshot-Time': data?.timestampFormatted || '',
      },
    });
  } catch (error) {
    console.error('Camera proxy error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
