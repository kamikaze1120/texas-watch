import { useQuery } from '@tanstack/react-query';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export interface Camera {
  id: string;
  name: string;
  roadway: string;
  direction: string;
  lat: number;
  lng: number;
  online: boolean;
  hasSnapshot: boolean;
  district: string;
}

export interface CameraList {
  district: string;
  cameras: Camera[];
  total: number;
}

// Friendly metro -> backend district param
export const CAMERA_METROS: { label: string; value: string }[] = [
  { label: 'Austin', value: 'austin' },
  { label: 'Dallas', value: 'dallas' },
  { label: 'Fort Worth', value: 'fortworth' },
  { label: 'Houston', value: 'houston' },
  { label: 'San Antonio', value: 'sanantonio' },
  { label: 'El Paso', value: 'elpaso' },
];

async function fetchCameras(metro: string): Promise<CameraList> {
  const res = await fetch(
    `${SUPABASE_URL}/functions/v1/txdot-camera-proxy?action=list&district=${metro}`,
    { headers: { 'Content-Type': 'application/json' } }
  );
  if (!res.ok) throw new Error(`Failed to fetch cameras: ${res.status}`);
  return res.json();
}

export function useCameras(metro: string = 'austin') {
  return useQuery({
    queryKey: ['cameras', metro],
    queryFn: () => fetchCameras(metro),
    staleTime: 120000,
    retry: 1,
  });
}

// Build a snapshot URL. The `bust` value forces the browser to re-fetch live frames.
export function cameraSnapshotUrl(metro: string, cameraId: string, bust?: number): string {
  const base = `${SUPABASE_URL}/functions/v1/txdot-camera-proxy?action=snapshot&district=${encodeURIComponent(
    metro
  )}&camera=${encodeURIComponent(cameraId)}`;
  return bust ? `${base}&t=${bust}` : base;
}
