# Monitoring M11 — Certification dédiée des tests

## Statut

**IMPLEMENTATION TESTS TERMINEE — certification officielle Node 24/infrastructures restantes.**

## Backend

Le runner officiel `npm --prefix backend run test:monitoring` découvre récursivement tous les `*.spec.ts` et `*.test.ts` de `src/shared/monitoring/tests` et inclut aussi le test d'intégration Monitoring de `shared/realtime`.

Couverture présente : domaine, application, HTTP/controllers/routes/validators/presenters, sécurité et contexte forgé, permissions/tenant isolation, repositories/persistance, collecteurs PostgreSQL/Redis/BullMQ/runtime, alerting/incidents, diagnostics, capacity/saturation/traces, observabilité, workers, rétention et résilience.

Les tests qui exigent une infrastructure réelle doivent être rejoués sous Node 24 avec PostgreSQL, Redis et BullMQ officiels. Aucun résultat vert n'est supposé en leur absence.

## Frontend

Le runner `npm --prefix frontend run test:monitoring` certifie statiquement le périmètre Monitoring sans dépendre de Vue runtime :
- contrats explicites;
- absence de JSON/textarea technique;
- permissions des mutations;
- accessibilité/focus/responsive;
- couverture des endpoints API et idempotence;
- store loading/ready/error/reset;
- validation des formulaires;
- états non nominaux;
- absence de polling agressif dans les vues.

Le runner `npm --prefix frontend run test:monitoring:realtime` couvre le fallback realtime/polling borné.

## Certification restante

Codex doit exécuter dans le dépôt intégré :

```bash
node --version
npm --prefix backend ci
npm --prefix frontend ci
npm --prefix backend run test:monitoring
npm --prefix frontend run test:monitoring
npm --prefix frontend run test:monitoring:realtime
npm --prefix backend run typecheck
npm --prefix frontend run build
```

Puis les tests PostgreSQL/Redis/BullMQ réels et les E2E M12. Node doit être 24.x.
