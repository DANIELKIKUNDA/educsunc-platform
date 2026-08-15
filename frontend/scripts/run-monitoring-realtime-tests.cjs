const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
const root=path.resolve(__dirname,'..');const read=(p)=>fs.readFileSync(path.join(root,p),'utf8');
test('M7 fallback polling est borne et gere visibilite/backoff',()=>{const s=read('src/domains/monitoring/realtime/monitoring-realtime.ts');assert.match(s,/Math\.max\(15_000/);assert.match(s,/120_000/);assert.match(s,/visibilitychange/);assert.match(s,/2\*\*Math\.min\(failures,3\)/)});
test('M7 overview demarre et arrete le fallback avec le cycle Vue',()=>{const s=read('src/domains/monitoring/views/MonitoringOverviewView.vue');assert.match(s,/onMounted/);assert.match(s,/onUnmounted/);assert.match(s,/realtime\.stop\(\)/)});
test('M7 ne cree pas EventSource ou WebSocket parallele',()=>{const s=read('src/domains/monitoring/realtime/monitoring-realtime.ts');assert.doesNotMatch(s,/new\s+EventSource|new\s+WebSocket/)});
