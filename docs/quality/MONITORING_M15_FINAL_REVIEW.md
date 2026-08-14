# Monitoring M15 — revue finale

Date: 2026-08-12

## Verdict

**MONITORING — PRÊT POUR INTÉGRATION, CERTIFICATION OFFICIELLE RESTANTE**

Le verdict `MONITORING — CERTIFIÉ` n'est pas prononcé dans cet environnement : Node disponible v22.16.0 (Node 24 requis), dépendances backend/frontend absentes, PostgreSQL/Redis/BullMQ/Grafana/Prometheus/Loki et navigateur Playwright non certifiés ici, et aucune métadonnée `.git` n'est incluse dans le paquet de travail.

## Revue M15 effectuée

Recherche ciblée effectuée sur Monitoring : `TODO`, `FIXME`, `placeholder`, `mock`, `simulation`, `JSON.stringify`, `unknown`, repositories mémoire, `setTimeout`, latence fixe et `HEALTHY` fixe.

### Corrections M15

1. `EtatSysteme` conservait encore un défaut dangereux : après CRITICAL/DEGRADED, un runtime/dépendance/composant `UNKNOWN` pouvait retomber sur `HEALTHY`. La consolidation traite désormais explicitement `UNKNOWN` et un test de non-régression a été ajouté.
2. `ApplicationObservabilityService` dupliquait le calcul Capacity/Saturation et produisait notamment `DEGRADED` pour toute capacité sous 90 %. Il délègue désormais aux services de domaine `ServiceCalculCapacite` et `ServiceCalculSaturation`, source unique du calcul.

### Occurrences conservées volontairement

- `Repository*Memoire` / `Stockage*Memoire` : conservés pour tests et compatibilité de composants historiques. Le wiring HTTP de production Monitoring (`backend/src/app/routes/monitoring.routes.ts`) utilise les repositories PostgreSQL.
- `unknown` : conservé aux frontières génériques/HTTP/intégrations lorsque le type n'est pas connu avant validation. Les contrats frontend Monitoring connus sont typés explicitement.
- `JSON.stringify` : conservé dans les repositories PostgreSQL pour sérialiser les payloads JSONB ; aucun gros JSON libre n'est rendu dans l'UX Monitoring.
- `HEALTHY` du collecteur du processus Node local : légitime lorsque le collecteur s'exécute dans le processus vivant ; aucune latence ou dépendance externe n'y est simulée.
- `simulation` : conservé uniquement comme état explicite de l'infrastructure Redis/BullMQ et dans les tests ; une simulation est exposée `DEGRADED`, jamais `HEALTHY`.
- purge SQL `DELETE` : uniquement diagnostics/traces et uniquement lorsqu'une politique de rétention explicite est configurée. Aucune migration destructive n'a été détectée dans les migrations Monitoring.

## Contrôles exécutés dans cet environnement

- `npm --prefix frontend run test:monitoring` → **9/9 PASS**.
- `npm --prefix frontend run test:monitoring:realtime` → **3/3 PASS**.
- `node --test frontend/scripts/run-monitoring-performance-tests.cjs` → **4/4 PASS**.
- `node scripts/quality/verify-monitoring-ci.mjs` → **PASS, 19 contrôles**.
- `node --check scripts/quality/run-performance.mjs` → **PASS**.
- `node --check scripts/quality/run-verification.mjs` → **PASS**.
- recherche fichiers temporaires → aucun `.tmp`, `.bak`, `.swp` détecté.
- recherche `node_modules` → aucun dossier `node_modules` dans le paquet final.
- recherche simple de secrets codés en dur dans le périmètre Monitoring/observabilité/CI → aucun secret littéral détecté.

## Contrôles tentés mais non certifiables ici

- `npm --prefix backend run test:monitoring` → bloqué : `backend/node_modules/tsx/dist/cli.mjs` absent ; runtime Node v22.16.0.
- `npm --prefix frontend run test:e2e:monitoring:list` → Playwright du projet non installé dans `frontend/node_modules`.
- `git diff --check` → impossible sur le paquet ZIP sans métadonnées `.git`.

## Certification obligatoire à faire après intégration par Codex

Sous Node 24 et les dépendances officielles :

1. installer via les lockfiles officiels (`npm ci`) ;
2. appliquer les migrations Monitoring sur PostgreSQL de test ;
3. démarrer PostgreSQL, Redis et l'infrastructure BullMQ officielle ;
4. exécuter `npm --prefix backend run test:monitoring` ;
5. exécuter les suites backend global/security/audit exigées par la CI ;
6. exécuter `npm --prefix frontend run test:monitoring` et `test:monitoring:realtime` ;
7. exécuter `npm --prefix frontend run test:e2e:monitoring` ;
8. exécuter typecheck, build et ESLint backend/frontend ;
9. exécuter Semgrep, Gitleaks, Trivy et audit dépendances ;
10. exécuter la campagne k6 Monitoring avec l'application réellement démarrée ;
11. provoquer les pannes PostgreSQL/Redis/BullMQ/Prometheus/Grafana prévues par M8 et vérifier le comportement dégradé ;
12. exécuter `git diff --check` dans le vrai dépôt ;
13. pousser la branche et exiger une GitHub Actions entièrement verte.

Seulement après ces validations le verdict peut devenir `MONITORING — CERTIFIÉ`.
