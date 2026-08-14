const fs=require('fs');const path=require('path');
const root=path.resolve(__dirname,'..');let pass=0;function ok(cond,msg){if(!cond)throw new Error(msg);pass++;console.log(`PASS ${msg}`)}
const realtime=fs.readFileSync(path.join(root,'src/domains/monitoring/realtime/monitoring-realtime.ts'),'utf8');
const overview=fs.readFileSync(path.join(root,'src/domains/monitoring/views/MonitoringOverviewView.vue'),'utf8');
ok(/Math\.max\(15_000/.test(realtime)&&/120_000/.test(realtime),'polling borne entre 15s et 120s');
ok(/visibilityState==='hidden'/.test(realtime),'polling suspendu quand onglet masque');
ok(/onUnmounted\(\(\)=>realtime\.stop\(\)\)/.test(overview),'timer realtime libere au demontage');
ok(!/setInterval\(/.test(realtime),'aucun setInterval agressif dans realtime Monitoring');
console.log(`Monitoring performance frontend: ${pass}/4 PASS`);
