import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const cameraName = url.searchParams.get('camera');
    const district = url.searchParams.get('district');

    if (!cameraName || !district) {
      return new Response(JSON.stringify({ error: 'Missing camera or district parameter' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // TxDOT camera snapshot URL pattern
    const encodedCamera = encodeURIComponent(cameraName);
    const txdotUrl = `https://its.txdot.gov/ITS_WEB/FrontEnd/snapshots/${encodedCamera}_${district}.jpg`;

    console.log(`Fetching camera: ${txdotUrl}`);

    const response = await fetch(txdotUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'image/jpeg,image/png,image/*',
        'Referer': 'https://its.txdot.gov/',
      },
    });

    if (!response.ok) {
      console.error(`TxDOT returned ${response.status} for ${txdotUrl}`);
      return new Response(JSON.stringify({ error: 'Camera feed unavailable', status: response.status }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    return new Response(imageBuffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=30',
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
