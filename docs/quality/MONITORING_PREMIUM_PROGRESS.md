# Monitoring Plateforme — durcissement Premium

## Etat de cette passe

Cette passe traite prioritairement les risques bloquants de securite et de certification du module Monitoring, sans modifier les regles metier ni le Centre Audit.

### Corrections effectuees

- Le contexte tenant utilise par Monitoring provient exclusivement du contexte authentifie de la requete.
- Les valeurs `organisationId`, `ecoleId` et `utilisateurId` fournies par query/body ne peuvent plus remplacer le contexte de session.
- Toutes les routes Monitoring transmettent maintenant explicitement `request.context` aux controleurs.
- Les erreurs internes HTTP ne divulguent plus le message technique brut au client.
- Les erreurs de validation Monitoring sont exposees en HTTP 400 et les absences en HTTP 404.
- Les validateurs HTTP Alert, Incident, Trace et Context effectuent maintenant une validation runtime reelle.
- Le frontend Monitoring Plateforme n exige plus une ecole active pour construire son contexte API.
- Le faux collecteur `runtime_latency = 5 ms` a ete remplace par des metriques reelles du processus Node (uptime, RSS, heap, CPU).
- Le faux etat de dependance `memoire-locale HEALTHY` a ete supprime : aucune dependance externe n est declaree saine sans sonde reelle.
- Le faux `latenceMillisecondes: 5` du composant local a ete retire.
- Un lanceur de tests `test:monitoring` dedie a `shared/monitoring/tests` a ete ajoute.
- La CI appelle maintenant `npm --prefix backend run test:monitoring`.
- Des tests de non-ecrasement du contexte tenant et de fonctionnement Plateforme sans ecole ont ete ajoutes.

## Verification realisee dans l environnement ChatGPT

- `node --check backend/scripts/run-shared-monitoring-tests.cjs` : OK.
- `backend/package.json` parse comme JSON valide : OK.
- 18 appels de routes Monitoring transmettent les headers et 18 transmettent maintenant le contexte authentifie.
- Recherche des sentinelles de simulation `runtime_latency`, `memoire-locale`, `latenceMillisecondes: 5`, `Collecte locale active` dans l infrastructure Monitoring : aucune occurrence restante.

## Verification encore requise dans l environnement officiel EduSync

La certification finale exige Node 24, les dependances du depot, PostgreSQL/Redis et la CI GitHub. L environnement de travail ChatGPT de cette passe execute Node 22 et ne peut donc pas produire le verdict officiel.

A executer apres integration :

```bash
npm --prefix backend ci
npm --prefix frontend ci
npm --prefix backend run typecheck
npm --prefix backend run build
npm --prefix backend run test:monitoring
npm --prefix backend run test:global
npm --prefix backend run test:security
npm --prefix backend run test:audit
npm run lint:backend
npm run lint:frontend
npm run verify:all
```

## Suite Premium

Les prochains chantiers restent : persistance durable Monitoring, sondes PostgreSQL/Redis/BullMQ reelles, integration Prometheus/Grafana/Loki, UI cockpit, E2E par role, resilience et certification globale.

## M2 — Persistance PostgreSQL durable (implementation terminee dans le paquet)

- Les routes Monitoring de production reutilisent desormais le pool PostgreSQL transverse Auth au lieu de creer un second pool.
- Alertes, incidents, diagnostics et traces sont branches sur leurs repositories PostgreSQL.
- Capacity et Saturation disposent maintenant de snapshots PostgreSQL durables et indexes.
- Les migrations Monitoring sont executees par le plugin PostgreSQL transverse apres Auth/Audit/Security.
- Les series temporelles metier/techniques ne sont volontairement pas dupliquees dans PostgreSQL : Prometheus en reste proprietaire.
- Les repositories memoire restent disponibles pour les tests et les fabriques explicitement non-production.

### Validation non certifiee dans cet environnement

Le typecheck a ete tente sous Node 22.16.0 mais les dependances du depot ne sont pas installees (`fastify`, `@types/node`, `prom-client`, etc.). Le resultat n'est donc pas interpretable comme une regression M2. La validation Node 24 + `npm ci` + PostgreSQL reel reste a executer lors de l'integration Codex.

## M3 — collecte technique réelle (implémentation terminée dans ce paquet)

- PostgreSQL : sonde réelle `SELECT 1`, timeout borné, latence et état du pool (`total/idle/waiting`).
- Redis : réutilisation du client Redis partagé, `PING` réel, latence, timeout ; le mode simulation est explicitement `DEGRADED` et jamais `HEALTHY`.
- BullMQ : observation en lecture seule des files existantes (notifications par défaut, surcharge possible via `EDUCSYN_MONITORING_BULLMQ_QUEUES`) ; compteurs waiting/active/completed/failed/delayed et workers réels ; aucune deuxième infrastructure de jobs n'est créée.
- Runtime Node.js : uptime, RSS, heap, external, arrayBuffers, CPU user/system, max RSS et event-loop utilization/active/idle issus du processus réel.
- HTTP/Fastify : les métriques existantes restent réutilisées ; aucune série artificielle n'est ajoutée.
- États : absence de sonde => `UNKNOWN`, simulation => `DEGRADED`, panne de sonde réelle => `CRITICAL`; aucun `HEALTHY` fixe pour PostgreSQL/Redis/BullMQ.
- Tests M3 ajoutés dans `tests/infrastructure/CollecteursTechniquesMonitoring.spec.ts`.

### Validation M3 restant à exécuter dans l'environnement officiel

L'environnement de travail de cette passe est Node 22.16.0 et ne contient pas `backend/node_modules`. Le projet exige Node 24. Les tests TypeScript et les sondes réelles PostgreSQL/Redis/BullMQ doivent donc être rejoués par Codex dans l'environnement officiel avec dépendances installées. Cette limitation n'empêche pas l'implémentation M3 d'être complète, mais interdit de la déclarer officiellement certifiée ici.

## M4 — alertes et incidents opérationnels (implémentation terminée dans ce paquet)

- Ajout d'un moteur applicatif d'alerting alimenté par les snapshots de santé réels ; il ne fabrique aucun signal lorsque l'état est `UNKNOWN`.
- Les états `DEGRADED` et `CRITICAL` produits par les sondes M3 déclenchent respectivement des alertes WARNING/CRITICAL sans réinventer de seuil métrique : le moteur consomme le niveau déjà calculé par la sonde propriétaire.
- Retour `HEALTHY` : résolution automatique de l'alerte de santé correspondante.
- Déduplication des alertes actives par indicateur + composant et idempotence par `alertId`, afin d'éviter les tempêtes à chaque cycle de collecte.
- L'ouverture d'incident est idempotente sur `incidentId`.
- Le cycle d'incident reste strictement celui du domaine officiel : `DETECTED -> INVESTIGATING -> MITIGATED -> RESOLVED`. Aucun nouveau statut n'a été créé.
- Ajout de `monitoring_incident_timeline` avec contrainte FK, index chronologique et unicité par transition ; les sauvegardes d'incident inscrivent durablement les transitions sans doublon.
- Les transitions de timeline et la sauvegarde de l'incident sont transactionnelles.
- Aucun endpoint d'acquittement ou de résolution d'incident n'a été inventé : les workflows figés MON-05/MON-06/MON-07 ne documentent que lecture, ouverture et escalade. Les statuts déjà présents dans le domaine restent utilisables par les flux internes existants.
- Tests M4 ajoutés : création depuis dégradation réelle, déduplication, résolution au retour HEALTHY et absence d'alerte artificielle sur UNKNOWN.

### Validation M4 restant à exécuter dans l'environnement officiel

Le paquet ne contient pas `backend/node_modules` et l'environnement ChatGPT est Node 22 alors que le projet exige Node 24. Il reste donc à exécuter `npm --prefix backend ci`, `npm --prefix backend run typecheck`, `npm --prefix backend run test:monitoring` et les tests PostgreSQL réels après intégration. La migration de timeline doit être appliquée sur une base de test puis vérifiée en redémarrage/réhydratation avant certification officielle.

## M5 — Prometheus / Grafana / Loki / Uptime Kuma

Implementation terminee dans le paquet : reutilisation du `/metrics` `prom-client` existant, audit de cardinalite renforce par tests, configuration Prometheus versionnee avec secret fichier, regle d'indisponibilite sans seuil metier invente, provisioning Grafana Prometheus/Loki, dashboard technique de base, configuration Loki avec retention explicite, journalisation HTTP minimisee et structuree pour Loki, Uptime Kuma maintenu externe sans etat fictif. Voir `docs/quality/MONITORING_M5_OBSERVABILITY.md`.

Certification officielle restante : Node 24, dependances installees, lancement reel de la pile, scrape Prometheus, ingestion Loki, Grafana, Uptime Kuma et CI.

## M6 — Frontend premium / cockpit (implementation)

Etat: **IMPLEMENTATION TERMINEE — certification Node 24 restante**.

Realise:
- remplacement des projections JSON brutes par un cockpit structure;
- contrats TypeScript explicites pour state, dashboard, health, alertes, incidents, diagnostics, capacity, saturation et traces;
- dashboard avec KPI, cartes de sante, dependances/runtime et disponibilite;
- tables structurees alertes/incidents/traces;
- diagnostics presentes en causes probables + recommandations;
- MON-14 capacity et MON-15 saturation conserves comme actions distinctes;
- formulaires types, bornes et sans textarea JSON;
- actions mutationnelles masquees selon les permissions effectives, notamment SUPPORT_SYSTEME en lecture;
- ajout des policies frontend manquantes diagnostics.create, saturation.calculate et traces.create;
- confirmations avant resolution/escalade;
- notifications succes via le service Toast partage du design system;
- loading, empty, error, disabled, focus-visible, responsive et attributs ARIA sur validations critiques;
- composants Monitoring reutilisables: status badge, KPI card, health grid, empty state;
- runner dedie `npm --prefix frontend run test:monitoring`.

Validation executee dans cet environnement:
- `node --test frontend/scripts/run-monitoring-tests.cjs`: **4/4 PASS**.
- recherche Monitoring `JSON.stringify|payloadJson|optionsJson|mon-preview`: **aucune occurrence production**.
- `frontend/node_modules`: absent; `vue-tsc`/build complet non executable ici.

Certification restante pour Codex/environnement officiel:
- Node 24 + `npm ci` frontend;
- `npm --prefix frontend run test:monitoring`;
- `npm --prefix frontend run build` (vue-tsc + Vite);
- lint officiel;
- tests navigateur/E2E des trois roles plateforme et acteur non plateforme;
- verification visuelle responsive/contrastes dans navigateur reel.

## M7 — Realtime — implementation terminee (certification environnement officiel restante)

- `shared/realtime/integration/monitoring` est reutilise : aucun second bus SSE/WebSocket n'a ete cree.
- Contrat Monitoring realtime borne aux evenements UI utiles : alerte creee/resolue, incident cree/changement/resolution, composant degrade.
- Les commandes sont diffusees sur le canal `monitoring`, audience plateforme controlee par `monitoring.read`, sans autorite organisation/ecole injectee.
- Priorite critique supportee, requestId/correlationId propages sans les utiliser comme labels metriques.
- Anti-tempete/deduplication courte fenetre et journal diagnostic borne a 200 messages.
- Le frontend dispose d'un fallback polling borne (30 s, minimum 15 s, backoff jusqu'a 120 s), suspendu quand l'onglet est masque et arrete au unmount.
- Aucun `EventSource`/`WebSocket` parallele n'est invente : le depot ne fournit pas encore de transport navigateur Monitoring exploitable ; le raccordement au transport officiel shared/realtime reste un point d'integration a certifier dans l'environnement complet.
- Tests frontend M7 executes localement : `npm --prefix frontend run test:monitoring:realtime` => 3/3 PASS.
- Tests backend TypeScript M7 ajoutes dans `shared/realtime/tests/integration/MonitoringIntegrationRealtime.spec.ts`; execution officielle restante sous Node 24 avec dependances installees.

## M8 — Resilience — implementation terminee (certification environnement officiel restante)

- PostgreSQL DOWN est absorbe par la sonde et expose `CRITICAL`; aucune exception de sonde n'est propagee au cockpit.
- Redis DOWN est absorbe et expose `CRITICAL`; le mode simulation reste `DEGRADED`.
- Les timeouts de sondes PostgreSQL/Redis sont bornes et testables sans attente arbitraire longue.
- BullMQ non raccorde reste `UNKNOWN`; une erreur d'observation reelle reste `CRITICAL`.
- Worker absent avec backlog, queue avec backlog/delayed et failed jobs degradent le runtime sans inventer `HEALTHY`.
- L'evaluation BullMQ a ete isolee dans une fonction deterministe afin de couvrir les scenarios worker mort / saturation / failed jobs par tests de non-regression.
- Prometheus/Grafana restent des dependances d'observabilite externes : leur indisponibilite ne fait pas partie du chemin de calcul du cockpit et ne peut donc pas faire crasher le Monitoring. Les liens/provisioning restent optionnels et l'etat doit etre degrade/inconnu lors de l'integration si leur disponibilite est exposee.
- Le redemarrage backend s'appuie sur la persistance PostgreSQL M2 pour les objets durables; la preuve de rehydratation apres redemarrage exige l'environnement PostgreSQL officiel.
- Tests M8 ajoutes dans `shared/monitoring/tests/infrastructure/ResilienceMonitoring.spec.ts` et inclus automatiquement par `test:monitoring`.

Certification restante pour Codex/environnement officiel : Node 24 + dependances, PostgreSQL/Redis/BullMQ reels, arrets/reprises Docker controles, redemarrage backend avec verification de rehydratation, indisponibilite Prometheus/Grafana en environnement compose, puis `npm run test:monitoring` et CI officielle.

## M9 — Permissions (implémentation fermée)

- Catalogue backend aligné sur la doctrine Plateforme : MANAGER_SYSTEME et OPERATEUR_SYSTEME disposent des lectures et mutations Monitoring officielles ; SUPPORT_SYSTEME conserve toutes les lectures Monitoring et aucune mutation.
- Correction d'une divergence réelle : le catalogue de rôles ne portait pas toutes les permissions Monitoring utilisées par les routes/fixtures.
- Doctrine frontend corrigée : SUPPORT_SYSTEME peut désormais atteindre les écrans Incidents, Alertes et Capacity en lecture, tandis que les actions de mutation restent gouvernées par les policies de permissions.
- Actions frontend manquantes ajoutées à la doctrine : diagnostic.generate, saturation.compute, traces.capture.
- Tests backend M9 ajoutés au runner `test:monitoring` pour les rôles Plateforme et le refus des rôles non Plateforme.
- Tests statiques frontend M9 exécutés : 3/3 PASS.
- Certification d'intégration restante : exécuter sous Node 24 les tests TypeScript backend et les E2E navigateur avec authentification réelle.

## M10 — Retention (implementation fermee)

- Metriques laissees a Prometheus; aucune copie/purge temporelle PostgreSQL ajoutee.
- Logs laisses a Loki; retention versionnee Loki 168h conservee et documentee.
- Alertes/incidents/timeline/capacity/saturation : aucune purge automatique M10.
- Diagnostics/traces : politique explicite par variables d'environnement, desactivee par defaut afin de ne pas inventer une duree.
- Service PostgreSQL transactionnel de retention avec rapport de suppressions; aucune suppression silencieuse.
- Scheduler retention rendu explicitement non automatique; execution volontaire uniquement.
- Tests de non-regression M10 ajoutes au runner `test:monitoring`.
- Certification restante : Node 24, dependances, PostgreSQL reel, verification runtime Prometheus/Loki et CI.

## M11 — Tests dédiés Monitoring (implementation fermee)

- Runner backend `test:monitoring` durci : decouverte recursive de toute la suite Monitoring + integration realtime Monitoring.
- Couverture backend presente : domaine, application, HTTP, securite/contexte forge, permissions, tenant isolation, repositories, collecteurs, runtime, alerting/incidents, diagnostics, capacity/saturation/traces, observabilite, workers, retention et resilience.
- Runner frontend `test:monitoring` renforce pour services API, idempotence, store, vues, formulaires, erreurs/empty/disabled, permissions, accessibilite et absence de polling agressif.
- Runner realtime frontend conserve separement pour le fallback borne.
- Tests frontend M11 executables sans node_modules; certification TypeScript/backend/infrastructures reste a rejouer sous Node 24 avec dependances officielles.

## M12 — E2E (implémentation fermée)
- Suite Playwright dédiée `test:e2e:monitoring` ajoutée.
- MANAGER_SYSTEME et OPERATEUR_SYSTEME : accès cockpit/écrans opérationnels.
- SUPPORT_SYSTEME : lecture autorisée, mutations absentes.
- Acteur ECOLE : navigation Monitoring refusée sans appel API Monitoring.
- Erreur réseau : état d'erreur contenu, shell applicatif maintenu.
- Helper E2E étendu à OPERATEUR_SYSTEME.
- Certification navigateur officielle restante sous Node 24 + dépendances/infrastructures réelles.

## M13 — Performance (2026-08-12)
- Campagne k6 Monitoring dediee ajoutee et integree au runner officiel de performance.
- Dashboard/state/observability/health couverts avec p95/p99, 5xx, taux d'echec et borne de payload.
- Non-regression frontend : polling borne, backoff, suspension onglet masque, cleanup au demontage.
- Indexes PostgreSQL Monitoring audites ; cardinalite Prometheus et metriques memoire/event-loop reutilisees.
- Certification de charge officielle restante sous Node 24 + PostgreSQL + k6.

## M14 — CI / qualité / sécurité (2026-08-12)

Statut : **implémentation fermée ; certification GitHub Actions restante**.

- CI officielle Node 24 conserve PostgreSQL 16 et exécute explicitement `backend test:monitoring`.
- La CI frontend exécute désormais explicitement `test:monitoring` et `test:monitoring:realtime` avant le build.
- Le job E2E exécute désormais explicitement `test:e2e:monitoring`.
- `verify:code` inclut désormais les tests backend Monitoring, frontend Monitoring et frontend Monitoring realtime.
- Les contrôles existants restent actifs : typecheck strict, builds, ESLint, PostgreSQL, npm audit, Semgrep, Gitleaks, Trivy et performance k6 planifiée/manuelle.
- Aucun test ni contrôle existant n'a été supprimé ou affaibli pour obtenir du vert.
- Ajout de `scripts/quality/verify-monitoring-ci.mjs`, garde de non-régression qui vérifie statiquement 19 obligations de la CI Monitoring.
- Contrôles exécutés localement : contrat CI Monitoring PASS (19/19), syntaxe Node des scripts PASS, pinning GitHub Actions PASS.
- Certification restante : exécution réelle de la workflow GitHub Actions sur le dépôt intégré, avec Node 24, dépendances, PostgreSQL et outils de sécurité disponibles.

## M15 — Revue finale (2026-08-12)

- revue exhaustive des marqueurs de dette/faux états effectuée ;
- correction de la consolidation `UNKNOWN` qui pouvait encore produire `HEALTHY` ;
- déduplication du calcul Capacity/Saturation via les services de domaine ;
- contrôles frontend Monitoring 9/9 PASS ; realtime 3/3 PASS ; performance 4/4 PASS ; contrat CI 19/19 PASS ;
- aucun `node_modules` ou fichier temporaire inclus ;
- backend complet/E2E/Node24/infrastructures/GitHub CI laissés explicitement à la certification d'intégration ;
- verdict : **MONITORING — PRÊT POUR INTÉGRATION, CERTIFICATION OFFICIELLE RESTANTE**.
