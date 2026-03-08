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

const now = new Date();
const minutesAgo = (m: number) => new Date(now.getTime() - m * 60000).toISOString();

export const mockIncidents: Incident[] = [
  {
    id: 'INC-001',
    type: 'crime',
    title: 'Armed Robbery in Progress',
    description: 'Armed robbery reported at convenience store. Two suspects, one armed with handgun.',
    location: 'Houston, TX - Westheimer Rd',
    lat: 29.7372,
    lng: -95.4613,
    timestamp: minutesAgo(3),
    severity: 'critical',
    source: 'HPD 911 Dispatch',
    status: 'responding',
  },
  {
    id: 'INC-002',
    type: 'traffic',
    title: 'Multi-Vehicle Collision - I-35',
    description: '4-vehicle pileup on I-35 northbound. Multiple injuries reported. Lanes blocked.',
    location: 'Austin, TX - I-35 & 51st St',
    lat: 30.3074,
    lng: -97.7164,
    timestamp: minutesAgo(8),
    severity: 'high',
    source: 'TxDOT',
    status: 'responding',
  },
  {
    id: 'INC-003',
    type: 'fire',
    title: 'Structure Fire - Commercial',
    description: 'Two-alarm fire at warehouse facility. Fire department en route.',
    location: 'Dallas, TX - Industrial Blvd',
    lat: 32.7767,
    lng: -96.7970,
    timestamp: minutesAgo(12),
    severity: 'high',
    source: 'DFD Dispatch',
    status: 'responding',
  },
  {
    id: 'INC-004',
    type: 'medical',
    title: 'Mass Casualty Incident',
    description: 'Multiple patients at public event. EMS staging area established.',
    location: 'San Antonio, TX - Riverwalk',
    lat: 29.4241,
    lng: -98.4936,
    timestamp: minutesAgo(15),
    severity: 'critical',
    source: 'SAFD 911',
    status: 'active',
  },
  {
    id: 'INC-005',
    type: 'crime',
    title: 'Aggravated Assault',
    description: 'Assault with deadly weapon. Suspect fled on foot, eastbound.',
    location: 'Fort Worth, TX - Camp Bowie',
    lat: 32.7357,
    lng: -97.3832,
    timestamp: minutesAgo(20),
    severity: 'high',
    source: 'FWPD Dispatch',
    status: 'active',
  },
  {
    id: 'INC-006',
    type: 'traffic',
    title: 'Road Closure - Flooding',
    description: 'Flash flooding has closed FM 1960 in both directions.',
    location: 'Houston, TX - FM 1960',
    lat: 29.9214,
    lng: -95.5430,
    timestamp: minutesAgo(25),
    severity: 'medium',
    source: 'TxDOT',
    status: 'active',
  },
  {
    id: 'INC-007',
    type: 'weather',
    title: 'Tornado Warning',
    description: 'Tornado warning issued for Tarrant County. Seek shelter immediately.',
    location: 'Tarrant County, TX',
    lat: 32.7555,
    lng: -97.3308,
    timestamp: minutesAgo(5),
    severity: 'critical',
    source: 'NOAA NWS',
    status: 'active',
  },
  {
    id: 'INC-008',
    type: 'crime',
    title: 'Vehicle Pursuit',
    description: 'High-speed pursuit on I-10 westbound. Stolen vehicle.',
    location: 'El Paso, TX - I-10',
    lat: 31.7619,
    lng: -106.4850,
    timestamp: minutesAgo(2),
    severity: 'high',
    source: 'EPPD Dispatch',
    status: 'active',
  },
  {
    id: 'INC-009',
    type: 'hazard',
    title: 'Chemical Spill',
    description: 'Hazmat team dispatched to chemical spill at refinery.',
    location: 'Beaumont, TX - Refinery Row',
    lat: 30.0802,
    lng: -94.1266,
    timestamp: minutesAgo(30),
    severity: 'high',
    source: 'TCEQ',
    status: 'responding',
  },
  {
    id: 'INC-010',
    type: 'medical',
    title: 'Cardiac Emergency',
    description: 'Cardiac arrest at residential address. ALS en route.',
    location: 'Plano, TX - Legacy Dr',
    lat: 33.0198,
    lng: -96.6989,
    timestamp: minutesAgo(7),
    severity: 'medium',
    source: 'Plano 911',
    status: 'responding',
  },
  {
    id: 'INC-011',
    type: 'crime',
    title: 'Burglary - Commercial',
    description: 'Silent alarm triggered at electronics store. Officers responding.',
    location: 'Irving, TX - MacArthur Blvd',
    lat: 32.8140,
    lng: -96.9489,
    timestamp: minutesAgo(18),
    severity: 'medium',
    source: 'IPD Dispatch',
    status: 'responding',
  },
  {
    id: 'INC-012',
    type: 'traffic',
    title: 'Wrong-Way Driver Alert',
    description: 'Wrong-way driver reported on US-75 southbound.',
    location: 'McKinney, TX - US-75',
    lat: 33.1972,
    lng: -96.6397,
    timestamp: minutesAgo(1),
    severity: 'critical',
    source: 'TxDOT',
    status: 'active',
  },
];

export const mockAlerts: Alert[] = [
  {
    id: 'ALT-001',
    type: 'amber',
    title: 'AMBER ALERT: Missing Child',
    description: 'Last seen in red Toyota Camry, License: ABC-1234. Child: Maria G., age 7.',
    timestamp: minutesAgo(45),
    active: true,
  },
  {
    id: 'ALT-002',
    type: 'weather',
    title: 'Severe Thunderstorm Warning',
    description: 'Severe thunderstorms expected across North Texas. Large hail and damaging winds possible.',
    timestamp: minutesAgo(30),
    active: true,
  },
  {
    id: 'ALT-003',
    type: 'blue',
    title: 'BLUE ALERT: Officer in Danger',
    description: 'Suspect wanted for assault on officer. Armed and dangerous. Last seen in white pickup.',
    timestamp: minutesAgo(60),
    active: true,
  },
  {
    id: 'ALT-004',
    type: 'silver',
    title: 'SILVER ALERT: Missing Senior',
    description: 'James W., 82, last seen at 1400 Elm St Dallas. Has dementia. Driving silver Honda Accord.',
    timestamp: minutesAgo(120),
    active: true,
  },
];

export const statsData = {
  activeIncidents: 12,
  criticalIncidents: 3,
  respondingUnits: 28,
  alertsActive: 4,
  incidentsToday: 47,
  avgResponseTime: '4.2 min',
};
