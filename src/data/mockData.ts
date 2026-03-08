export type IncidentType = 'crime' | 'traffic' | 'fire' | 'medical' | 'alert' | 'weather' | 'hazard';
export type Severity = 'critical' | 'high' | 'medium' | 'low';

export interface Incident {
  id: string;
  type: IncidentType;
  title: string;
  description: string;
  location: string;
  lat: number;
  lng: number;
  timestamp: string;
  severity: Severity;
  source: string;
  status: 'active' | 'responding' | 'resolved';
}

export interface Alert {
  id: string;
  type: 'amber' | 'blue' | 'silver' | 'weather' | 'emergency';
  title: string;
  description: string;
  timestamp: string;
  active: boolean;
}
