import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface WeatherAlert {
  id: string;
  type: 'weather';
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  urgency: string;
  event: string;
  areas: string;
  onset: string;
  expires: string;
  senderName: string;
  status: string;
}

export interface TrafficCondition {
  id: string;
  type: 'traffic';
  title: string;
  description: string;
  location: string;
  lat: number;
  lng: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  source: string;
  status: string;
  timestamp: string;
}

export interface LiveData {
  weatherAlerts: WeatherAlert[];
  trafficConditions: TrafficCondition[];
  dpsAlerts: any[];
  lastUpdated: string;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

async function fetchLiveData(source: string = 'all'): Promise<LiveData> {
  const res = await fetch(
    `${SUPABASE_URL}/functions/v1/live-data?source=${source}`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch live data: ${res.status}`);
  }

  return res.json();
}

export function useLiveData(source: string = 'all') {
  return useQuery({
    queryKey: ['live-data', source],
    queryFn: () => fetchLiveData(source),
    refetchInterval: 60000, // Refresh every 60 seconds
    staleTime: 30000,
    retry: 2,
  });
}

export function useWeatherAlerts() {
  return useQuery({
    queryKey: ['live-data', 'weather'],
    queryFn: () => fetchLiveData('weather'),
    refetchInterval: 120000, // Refresh every 2 minutes
    staleTime: 60000,
    retry: 2,
    select: (data) => data.weatherAlerts || [],
  });
}
