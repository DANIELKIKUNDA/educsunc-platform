const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'../src/domains/monitoring');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');

const views=['MonitoringAlertsView.vue','MonitoringIncidentsView.vue','MonitoringDiagnosticsView.vue','MonitoringCapacityView.vue','MonitoringTracesView.vue','MonitoringOverviewView.vue'];

test('M6/M11 interdit JSON libre et projections brutes',()=>{for(const f of views){const s=read(`views/${f}`);assert.doesNotMatch(s,/JSON\.stringify|payloadJson|optionsJson|mon-preview/i);}});

test('M11 utilise les contrats frontend explicites du Monitoring',()=>{const s=read('models/monitoring.model.ts');for(const t of ['SystemStateResponse','MonitoringDashboardResponse','AlertResponse','IncidentResponse','DiagnosticResponse','CapacityResponse','SaturationResponse','TraceResponse'])assert.match(s,new RegExp(`interface ${t}`));});

test('M11 gouverne toutes les mutations par permissions',()=>{assert.match(read('views/MonitoringAlertsView.vue'),/monitoring\.alerts\.create/);assert.match(read('views/MonitoringIncidentsView.vue'),/monitoring\.incidents\.create/);assert.match(read('views/MonitoringDiagnosticsView.vue'),/monitoring\.diagnostics\.create/);assert.match(read('views/MonitoringCapacityView.vue'),/monitoring\.saturation\.calculate/);assert.match(read('views/MonitoringTracesView.vue'),/monitoring\.traces\.create/);});

test('M11 fournit focus, responsive et accessibilite de validation',()=>{const css=read('monitoring.css');assert.match(css,/focus-visible/);assert.match(css,/@media/);assert.match(read('views/MonitoringAlertsView.vue'),/aria-invalid/);});

test('M11 service API couvre lectures et mutations avec idempotence',()=>{const s=read('services/monitoring.api.ts');for(const route of ['/state','/dashboard','/observability','/health','/incidents','/alerts','/diagnostics','/capacity','/traces'])assert.match(s,new RegExp(route.replaceAll('/','\\/')));assert.match(s,/idempotency-key/);assert.match(s,/includeSchoolHeader:false/);});

test('M11 store couvre loading, ready, error et reset',()=>{const s=read('stores/monitoring.store.ts');assert.match(s,/state\.status='loading'/);assert.match(s,/state\.status='ready'/);assert.match(s,/state\.status='error'/);assert.match(s,/errorMessage/);assert.match(s,/reinitialiser/);assert.match(s,/registerScopedLifecycleStore/);});

test('M11 formulaires ont validation requise, bornes et nombres finis',()=>{const s=read('validation/monitoring-form.validation.ts');assert.match(s,/trim\(\)/);assert.match(s,/v\.length>max/);assert.match(s,/Number\.isFinite/);assert.match(s,/value >= 0/);});

test('M11 vues traitent erreurs et etats non nominaux',()=>{const joined=views.map(f=>read(`views/${f}`)).join('\n');assert.match(joined,/errorMessage|status === 'error'|status==='error'/);assert.match(joined,/disabled/);assert.match(joined,/empty|Aucun|aucun|vide/i);});

test('M11 cockpit n introduit aucun polling agressif dans les vues',()=>{for(const f of views)assert.doesNotMatch(read(`views/${f}`),/setInterval\s*\(/);});
