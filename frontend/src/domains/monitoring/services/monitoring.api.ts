import { clientApi } from '../../../shared/http/api.client';
import { construireEntetesPilotageActif, lireContexteApiPlateformeGlobal } from '../../../shared/session/api-context';
import type { AlertResponse, CapacityPayload, CapacityResponse, CaptureTracePayload, DiagnosticResponse, GenerateDiagnosticPayload, HealthSnapshotResponse, IncidentResponse, MonitoringApiContext, MonitoringDashboardResponse, ObservabilityResponse, OpenIncidentPayload, SaturationPayload, SaturationResponse, SystemStateResponse, TraceResponse, CreateAlertPayload } from '../models/monitoring.model';
function idempotency(prefixe:string){return `${prefixe}-${typeof crypto!=='undefined'&&crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random().toString(36).slice(2)}`}`}
function headers(c:MonitoringApiContext){if(!c.utilisateurId)throw new Error('Le contexte utilisateur du monitoring est indisponible.');return construireEntetesPilotageActif(c,{inclureOrganisationActive:false,inclureEcoleActive:false});}
function mutation(c:MonitoringApiContext,p:string){return {...headers(c),'idempotency-key':idempotency(p)}}
export const lireContexteApiMonitoring=():MonitoringApiContext=>lireContexteApiPlateformeGlobal();
export const monitoringApi={
 lireEtat:(c:MonitoringApiContext)=>clientApi.envoyer<SystemStateResponse>({chemin:'/api/v1/monitoring/state',entetes:headers(c)}),
 lireDashboard:(c:MonitoringApiContext)=>clientApi.envoyer<MonitoringDashboardResponse>({chemin:'/api/v1/monitoring/dashboard',entetes:headers(c)}),
 lireObservabilite:(c:MonitoringApiContext)=>clientApi.envoyer<ObservabilityResponse>({chemin:'/api/v1/monitoring/observability',entetes:headers(c)}),
 lireHealth:(c:MonitoringApiContext)=>clientApi.envoyer<SystemStateResponse>({chemin:'/api/v1/monitoring/health',entetes:headers(c)}),
 lireHealthSnapshot:(c:MonitoringApiContext)=>clientApi.envoyer<HealthSnapshotResponse>({chemin:'/api/v1/monitoring/health/snapshot',entetes:headers(c)}),
 lireIncidents:(c:MonitoringApiContext)=>clientApi.envoyer<readonly IncidentResponse[]>({chemin:'/api/v1/monitoring/incidents',entetes:headers(c)}),
 ouvrirIncident:(p:OpenIncidentPayload,c:MonitoringApiContext)=>clientApi.envoyer<IncidentResponse>({chemin:'/api/v1/monitoring/incidents',methode:'POST',corps:p,entetes:mutation(c,'monitoring-incident-open')}),
 escaladerIncident:(id:string,c:MonitoringApiContext)=>clientApi.envoyer<IncidentResponse>({chemin:`/api/v1/monitoring/incidents/${encodeURIComponent(id)}/escalate`,methode:'POST',entetes:mutation(c,'monitoring-incident-escalate')}),
 lireAlertes:(c:MonitoringApiContext)=>clientApi.envoyer<readonly AlertResponse[]>({chemin:'/api/v1/monitoring/alerts',entetes:headers(c)}),
 creerAlerte:(p:CreateAlertPayload,c:MonitoringApiContext)=>clientApi.envoyer<AlertResponse>({chemin:'/api/v1/monitoring/alerts',methode:'POST',corps:p,entetes:mutation(c,'monitoring-alert-create')}),
 resoudreAlerte:(id:string,c:MonitoringApiContext)=>clientApi.envoyer<AlertResponse>({chemin:`/api/v1/monitoring/alerts/${encodeURIComponent(id)}/resolve`,methode:'POST',corps:{resolvedAt:new Date().toISOString()},entetes:mutation(c,'monitoring-alert-resolve')}),
 lireDiagnostics:(c:MonitoringApiContext)=>clientApi.envoyer<readonly DiagnosticResponse[]>({chemin:'/api/v1/monitoring/diagnostics',entetes:headers(c)}),
 genererDiagnostic:(id:string,p:GenerateDiagnosticPayload,c:MonitoringApiContext)=>clientApi.envoyer<DiagnosticResponse>({chemin:`/api/v1/monitoring/incidents/${encodeURIComponent(id)}/diagnostics`,methode:'POST',corps:p,entetes:mutation(c,'monitoring-diagnostic-generate')}),
 lireCapacite:(c:MonitoringApiContext)=>clientApi.envoyer<readonly CapacityResponse[]>({chemin:'/api/v1/monitoring/capacity',entetes:headers(c)}),
 calculerCapacite:(p:CapacityPayload,c:MonitoringApiContext)=>clientApi.envoyer<CapacityResponse>({chemin:'/api/v1/monitoring/capacity',methode:'POST',corps:p,entetes:mutation(c,'monitoring-capacity-calculate')}),
 calculerSaturation:(p:SaturationPayload,c:MonitoringApiContext)=>clientApi.envoyer<SaturationResponse>({chemin:'/api/v1/monitoring/capacity/saturation',methode:'POST',corps:p,entetes:mutation(c,'monitoring-saturation-calculate')}),
 lireTraces:(c:MonitoringApiContext)=>clientApi.envoyer<readonly TraceResponse[]>({chemin:'/api/v1/monitoring/traces',entetes:headers(c)}),
 capturerTrace:(p:CaptureTracePayload,c:MonitoringApiContext)=>clientApi.envoyer<TraceResponse>({chemin:'/api/v1/monitoring/traces',methode:'POST',corps:p,entetes:mutation(c,'monitoring-trace-capture')}),
};
