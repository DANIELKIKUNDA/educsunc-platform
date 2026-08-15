export interface MonitoringApiContext { organisationId: string | null; ecoleId: string | null; utilisateurId: string | null; }
export type HealthLevel = 'HEALTHY' | 'DEGRADED' | 'CRITICAL' | 'UNKNOWN';
export type AlertSeverity = 'INFO' | 'WARNING' | 'MAJOR' | 'CRITICAL';
export type AlertStatus = 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED' | 'SUPPRESSED';
export type IncidentStatus = 'DETECTED' | 'INVESTIGATING' | 'MITIGATED' | 'RESOLVED';
export type TraceType = 'REQUEST' | 'JOB' | 'EVENT' | 'DIAGNOSTIC' | 'FORENSIC';
export interface MonitoringContext { organisationId?: string; ecoleId?: string; utilisateurId?: string; module?: string; composant?: string; correlationId?: string; }
export interface CorrelationMonitoring { correlationId?: string; requestId?: string; [key: string]: string | undefined; }
export interface ComponentHealth { nom: string; niveau: HealthLevel; message: string; latenceMillisecondes?: number; dernierControleLe: string; contexte: MonitoringContext; }
export interface DependencyHealth { nom: string; source: string; niveau: HealthLevel; disponible: boolean; message: string; verifieLe: string; }
export interface RuntimeHealth { niveau: HealthLevel; filesActives: readonly string[]; workersActifs: readonly string[]; jobsEnCours: number; jobsEnRetard: number; misAJourLe: string; }
export interface SystemStateResponse { contexte: MonitoringContext; niveau: HealthLevel; composants: readonly ComponentHealth[]; dependances: readonly DependencyHealth[]; runtime: RuntimeHealth; }
export interface AlertResponse { identifiant: string; indicateur: string; gravite: AlertSeverity; statut: AlertStatus; message: string; seuil: { warning: number; critical: number; unite: string }; valeurObservee: number; contexte: MonitoringContext; correlation: CorrelationMonitoring; declencheeLe: string; resolueLe?: string; }
export interface DiagnosticResponse { incidentId: string; resume: string; causesProbables: readonly string[]; recommandations: readonly string[]; niveau: HealthLevel; contexte: MonitoringContext; correlation: CorrelationMonitoring; genereLe: string; }
export interface IncidentResponse { identifiant: string; resume: string; niveau: HealthLevel; statut: IncidentStatus; contexte: MonitoringContext; correlation: CorrelationMonitoring; alertes: readonly AlertResponse[]; diagnostics: readonly DiagnosticResponse[]; detecteLe: string; resoluLe?: string; }
export interface CapacityResponse { ressource: string; utilisationActuelle: number; capaciteMax: number; margeDisponible: number; niveau: HealthLevel; estimeeLe: string; }
export interface SaturationResponse { ressource: string; taux: number; niveau: HealthLevel; goulot: boolean; observeeLe: string; }
export interface TraceResponse { identifiant: string; type: TraceType; operation: string; succes: boolean; dureeMillisecondes: number; message?: string; contexte: MonitoringContext; correlation: CorrelationMonitoring; captureeLe: string; }
export interface MonitoringDashboardResponse { etatSysteme: SystemStateResponse; alertes: readonly AlertResponse[]; incidents: readonly IncidentResponse[]; diagnostics: readonly DiagnosticResponse[]; capacites: readonly CapacityResponse[]; saturations: readonly SaturationResponse[]; }
export interface ObservabilityResponse { etatSysteme: SystemStateResponse; incidents: readonly IncidentResponse[]; diagnostics: readonly DiagnosticResponse[]; traces: readonly TraceResponse[]; capacites: readonly CapacityResponse[]; saturations: readonly SaturationResponse[]; }
export interface HealthSnapshotResponse { etat: SystemStateResponse; captureLe: string; scoreDisponibilite: number; }
export interface CreateAlertPayload { alertId: string; indicateur: string; warning: number; critical: number; unite: string; valeurObservee: number; message: string; correlationId: string; }
export interface OpenIncidentPayload { incidentId: string; resume: string; niveau: HealthLevel; correlationId: string; }
export interface GenerateDiagnosticPayload { traceIds?: readonly string[]; }
export interface CapacityPayload { ressource: string; utilisationActuelle: number; capaciteMax: number; }
export interface SaturationPayload { ressource: string; taux: number; }
export interface CaptureTracePayload { traceId: string; type: TraceType; operation: string; succes: boolean; dureeMillisecondes: number; message?: string; correlationId: string; }
export type MonitoringOverviewMode = 'state' | 'dashboard' | 'observability' | 'health';
