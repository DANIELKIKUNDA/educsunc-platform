const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
const root=path.resolve(__dirname,'..');const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const doctrine=read('src/shared/doctrine/frontend-doctrine.ts');const policy=read('src/shared/permissions/access-policy.ts');
const supportRead=['MON-005','MON-006','MON-007','MON-008','MON-009'];
const mutations=['monitoring.incidents.open','monitoring.incidents.escalate','monitoring.alerts.create','monitoring.alerts.resolve','monitoring.diagnostics.generate','monitoring.capacity.compute','monitoring.saturation.compute','monitoring.traces.capture'];
test('M9 garde les ecrans de lecture Monitoring accessibles au SUPPORT_SYSTEME',()=>{for(const code of supportRead){const i=doctrine.indexOf(`code: '${code}'`);assert.ok(i>=0,code);const chunk=doctrine.slice(i,doctrine.indexOf('\n  },',i));assert.match(chunk,/actorCodes: monitoringReadActors/);}});
test('M9 associe chaque mutation visible a une policy de permission',()=>{for(const action of mutations){assert.match(doctrine,new RegExp(action.replaceAll('.','\\.')));assert.match(policy,new RegExp(action.replaceAll('.','\\.')));const i=policy.indexOf(`['${action}']`);const chunk=policy.slice(i,policy.indexOf('\n  }),',i)+5);assert.match(chunk,/mutation: true/);}});
test('M9 ne donne pas une mutation Monitoring au support par doctrine de role frontend',()=>{assert.match(doctrine,/const monitoringReadActors = \['MANAGER_SYSTEME', 'OPERATEUR_SYSTEME', 'SUPPORT_SYSTEME'\]/);});
