import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Scrape camera list and snapshots from TxDOT's rendered HTML
async function scrapeCameraPage(district: string): Promise<any[]> {
  const url = `https://its.txdot.gov/its/District/${district}/cameras`;
  console.log(`Scraping camera page: ${url}`);
  
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
  });
  
  if (!res.ok) {
    console.error(`TxDOT page returned ${res.status}`);
    return [];
  }
  
  const html = await res.text();
  
  // The page is a Knockout.js SPA - the camera data is embedded in the JS
  // Try to extract camera IDs from the rendered HTML
  const cameras: any[] = [];
  
  // Look for camera IDs in the HTML - they appear in data-bind attributes and text content
  // Format: DISTRICT.ROAD.INTERSECTION or DISTRICT-ROAD @ INTERSECTION
  const idPattern = new RegExp(`${district}[.\\-][\\w\\s/@]+`, 'gi');
  const matches = html.match(idPattern) || [];
  
  // Deduplicate
  const uniqueIds = [...new Set(matches)].slice(0, 20);
  
  for (const id of uniqueIds) {
    cameras.push({
      id: id.trim(),
      district,
    });
  }
  
  return cameras;
}

// Try multiple URL patterns for camera snapshots
async function fetchCameraSnapshot(cameraName: string, district: string): Promise<Response | null> {
  const urls = [
    // Old pattern (http)
    `http://its.txdot.gov/ITS_WEB/FrontEnd/snapshots/${encodeURIComponent(cameraName)}_${district}.jpg`,
    // HTTPS version  
    `https://its.txdot.gov/ITS_WEB/FrontEnd/snapshots/${encodeURIComponent(cameraName)}_${district}.jpg`,
    // New pattern with dots
    `https://its.txdot.gov/ITS_WEB/FrontEnd/snapshots/${encodeURIComponent(cameraName)}.jpg`,
  ];

  for (const url of urls) {
    try {
      console.log(`Trying: ${url}`);
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': '*/*',
        },
        redirect: 'follow',
      });
      
      if (response.ok) {
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('image')) {
          return response;
        }
      }
      console.log(`${url} returned ${response.status}`);
      // Consume the body to prevent leaks
      await response.text();
    } catch (err) {
      console.log(`Failed to fetch ${url}: ${err}`);
    }
  }
  
  return null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'snapshot';
    
    if (action === 'list') {
      // List available cameras for a district
      const district = url.searchParams.get('district') || 'HOU';
      const cameras = await scrapeCameraPage(district);
      return new Response(JSON.stringify({ cameras, district }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Snapshot mode
    const cameraName = url.searchParams.get('camera');
    const district = url.searchParams.get('district');

    if (!cameraName || !district) {
      return new Response(JSON.stringify({ error: 'Missing camera or district parameter' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const response = await fetchCameraSnapshot(cameraName, district);
    
    if (!response) {
      return new Response(JSON.stringify({ error: 'Camera feed unavailable' }), {
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
