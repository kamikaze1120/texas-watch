import { useQuery } from '@tanstack/react-query';

export interface DispatchCall {
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

export interface DispatchData {
  calls: DispatchCall[];
  total: number;
  cities: {
    austin: number;
    dallas: number;
    houston: number;
    sanAntonio: number;
  };
  lastUpdated: string;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

async function fetchDispatchData(city: string = 'all'): Promise<DispatchData> {
  const res = await fetch(
    `${SUPABASE_URL}/functions/v1/dispatch-data?city=${city}&limit=100`,
    { headers: { 'Content-Type': 'application/json' } }
  );
  if (!res.ok) throw new Error(`Failed to fetch dispatch data: ${res.status}`);
  return res.json();
}

export function useDispatchData(city: string = 'all') {
  return useQuery({
    queryKey: ['dispatch-data', city],
    queryFn: () => fetchDispatchData(city),
    refetchInterval: 60000,
    staleTime: 30000,
    retry: 2,
  });
}
