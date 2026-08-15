# Monitoring M13 — Performance

## Etat
M13 est implemente. La certification de charge complete reste a executer dans l'environnement officiel Node 24 + PostgreSQL + k6.

## Controles implementes
- campagne k6 dediee `performance/k6/monitoring-baseline.js` sur state/dashboard/observability/health ;
- seuils conservateurs alignes sur la baseline qualite existante : erreurs <1%, 5xx = 0, p95 <1500 ms, p99 <3000 ms ;
- payload Monitoring borne a 2 MB dans la campagne ;
- campagne integree au runner officiel `npm run verify:performance` et rapport separe ;
- polling frontend borne : minimum 15 s, nominal 30 s, backoff maximum 120 s ;
- polling suspendu lorsque l'onglet est masque et timer libere au demontage ;
- pas de `setInterval` agressif ;
- indexes PostgreSQL Monitoring verifies sur statut/date, gravite/date, incident/date, type/date et ressource/date ;
- cardinalite Prometheus deja durcie en M5 ;
- memoire Node et event-loop collectees en M3/M5 pour detecter les regressions sous charge.

## Certification restante
Executer sous Node 24 avec les dependances officielles et PostgreSQL isole :

```text
npm run verify:performance
```

Archiver `artifacts/quality/performance/monitoring-k6-summary.json`, le p95/p99, le debit, les 5xx et observer RSS/heap/event-loop avant, pendant et apres la campagne. La certification doit echouer si les seuils k6 echouent ou si une fuite memoire est constatee.
