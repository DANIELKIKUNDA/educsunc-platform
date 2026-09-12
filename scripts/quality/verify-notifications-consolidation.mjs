import fs from 'node:fs';
const checks = [];
const read = (p) => fs.readFileSync(p, 'utf8');
const runtime = read('backend/src/app/plugins/notifications-runtime.ts');
const support = read('backend/src/shared/notifications/interfaces/http/controllers/NotificationsControllerSupport.ts');
const email = read('backend/src/shared/notifications/infrastructure/providers/ProviderNotificationEmail.ts');
const sms = read('backend/src/shared/notifications/infrastructure/providers/ProviderNotificationSms.ts');
const push = read('backend/src/shared/notifications/infrastructure/providers/ProviderNotificationPush.ts');
const inapp = read('backend/src/shared/notifications/infrastructure/providers/ProviderNotificationInApp.ts');
const views = fs.readdirSync('frontend/src/domains/notifications/views').filter(x=>x.endsWith('.vue')).map(x=>read(`frontend/src/domains/notifications/views/${x}`)).join('\n');
function check(name, ok){ checks.push({name,ok}); if(!ok) process.exitCode=1; }
check('tenant headers not authoritative', !support.includes("lireHeader(requete.headers, 'x-organisation-id')") && !support.includes("lireHeader(requete.headers, 'x-ecole-id')"));
check('payload cannot override tenant/actor', support.includes('organisationId: contexte.organisationId') && support.includes('acteurId: contexte.utilisateurId'));
check('email has no simulated success', !email.includes('randomUUID') && email.includes('Aucun transport Email reel'));
check('sms has no simulated success', !sms.includes('randomUUID') && sms.includes('Aucun agregateur SMS reel'));
check('push provider is vendor neutral and fail closed', push.includes('PortTransportPush') && push.includes('Aucun transport Push reel'));
check('in-app uses durable notification id', !inapp.includes('randomUUID') && inapp.includes('charge.identifiantNotification'));
check('runtime does not instantiate future SSE/WebSocket', !runtime.includes('new CanalWebSocketNotificationFutur') && !runtime.includes('new CanalSseNotificationFutur'));
check('runtime writes aggregates to PostgreSQL', runtime.includes('new DepotNotificationsPostgres(obtenirPoolPostgresAuth())'));
check(
  'runtime uses shared BullMQ queues',
  /new FileNotificationsBullMq\([^)]*\)/.test(runtime)
    && /new FileRetryNotificationsBullMq\([^)]*\)/.test(runtime),
);
check('runtime registers push/sms providers', runtime.includes('new ProviderNotificationPush()') && runtime.includes('new ProviderNotificationSms()'));
check('frontend has no raw JSON preview', !views.includes('store.formatJson') && !views.includes('<pre class="notif-preview">'));
check('internal 500 details are not exposed', runtime.includes("message: 'Erreur interne Notifications.'"));
for (const c of checks) console.log(`${c.ok?'PASS':'FAIL'} ${c.name}`);
console.log(`${checks.filter(c=>c.ok).length}/${checks.length} checks passed`);
