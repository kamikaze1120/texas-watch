import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Fetch NOAA active weather alerts for Texas
async function fetchWeatherAlerts() {
  try {
    const res = await fetch('https://api.weather.gov/alerts/active?area=TX', {
      headers: {
        'User-Agent': '(TPSIP, admin@tpsip.app)',
        'Accept': 'application/geo+json',
      },
    });
    if (!res.ok) {
      console.error(`NOAA returned ${res.status}`);
      return [];
    }
    const data = await res.json();
    return (data.features || []).slice(0, 25).map((f: any) => ({
      id: f.properties.id,
      type: 'weather',
      title: f.properties.headline || f.properties.event,
      description: f.properties.description?.substring(0, 300) || '',
      severity: mapNoaaSeverity(f.properties.severity),
      urgency: f.properties.urgency,
      event: f.properties.event,
      areas: f.properties.areaDesc,
      onset: f.properties.onset,
      expires: f.properties.expires,
      senderName: f.properties.senderName || 'NWS',
      status: 'active',
    }));
  } catch (err) {
    console.error('NOAA fetch error:', err);
    return [];
  }
}

function mapNoaaSeverity(s: string): string {
  switch (s) {
    case 'Extreme': return 'critical';
    case 'Severe': return 'high';
    case 'Moderate': return 'medium';
    default: return 'low';
  }
}

// Fetch TxDOT road conditions / closures from DriveTexas
async function fetchTxDOTConditions() {
  try {
    // TxDOT GIS endpoint for road conditions
    const res = await fetch(
      'https://services.arcgis.com/KTcxiTD9dsQw4r7Z/arcgis/rest/services/TxDOT_Road_Conditions/FeatureServer/0/query?where=1%3D1&outFields=*&f=json&resultRecordCount=50',
      { headers: { 'Accept': 'application/json' } }
    );
    if (!res.ok) {
      console.error(`TxDOT conditions returned ${res.status}`);
      return [];
    }
    const data = await res.json();
    return (data.features || []).map((f: any) => ({
      id: `TXDOT-${f.attributes.OBJECTID || Math.random().toString(36).substr(2, 9)}`,
      type: 'traffic',
      title: f.attributes.Condition || 'Road Condition Alert',
      description: f.attributes.Remarks || f.attributes.Description || '',
      location: `${f.attributes.Road_Name || 'Unknown'}, ${f.attributes.From_Location || ''} to ${f.attributes.To_Location || ''}`,
      lat: f.geometry?.y || 31.0,
      lng: f.geometry?.x || -100.0,
      severity: f.attributes.Condition?.toLowerCase().includes('closed') ? 'critical' : 'medium',
      source: 'TxDOT',
      status: 'active',
      timestamp: new Date().toISOString(),
    }));
  } catch (err) {
    console.error('TxDOT conditions fetch error:', err);
    return [];
  }
}

// Fetch Texas DPS alerts (AMBER/Silver/Blue)
async function fetchDPSAlerts() {
  try {
    const res = await fetch('https://www.dps.texas.gov/api/alerts', {
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) {
      // DPS may not have a public JSON API - fall back to empty
      console.log(`DPS alerts returned ${res.status}, using NOAA alert data as fallback`);
      return [];
    }
    const data = await res.json();
    return data;
  } catch (err) {
    console.log('DPS alerts not available via API, will rely on NOAA data');
    return [];
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const source = url.searchParams.get('source') || 'all';

    let result: any = {};

    if (source === 'all' || source === 'weather') {
      result.weatherAlerts = await fetchWeatherAlerts();
    }

    if (source === 'all' || source === 'traffic') {
      result.trafficConditions = await fetchTxDOTConditions();
    }

    if (source === 'all' || source === 'alerts') {
      result.dpsAlerts = await fetchDPSAlerts();
    }

    result.lastUpdated = new Date().toISOString();

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=60' },
    });
  } catch (error) {
    console.error('Live data error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch live data' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
