# EduSync — Handoff Monitoring Premium

## État réel du paquet

Ce paquet est basé sur le ZIP de la branche `feat/platform-monitoring` fourni par l'utilisateur et contient les modifications effectivement persistées dans le checkpoint Monitoring M1.

Travail effectivement présent :
- durcissement du contexte HTTP Monitoring contre l'écrasement par des champs client ;
- validation runtime renforcée sur plusieurs entrées Monitoring ;
- passage explicite du contexte authentifié dans plusieurs routes ;
- premières corrections de collecteurs techniques pour éviter certains états simulés ;
- runner backend `test:monitoring` ;
- intégration CI du runner Monitoring ;
- tests ciblés de sécurité de contexte ;
- premières adaptations frontend de l'API Monitoring ;
- documentation de progression `MONITORING_PREMIUM_PROGRESS.md`.

Ce paquet n'est PAS une certification finale du module Monitoring.

## Limite d'environnement constatée

L'environnement d'exécution disponible ici est Node 22.16.0 alors que le projet exige Node 24. La validation officielle doit donc être reprise sous Node 24, avec PostgreSQL, Redis, E2E et GitHub Actions.

## Mission pour la prochaine discussion

Continuer à partir de ce ZIP et terminer intégralement le Centre Monitoring Plateforme au niveau premium/maximal, sans toucher aux travaux Audit L2–L6 en cours ailleurs.

### 1. Refaire un audit différentiel avant toute modification
- comparer ce paquet au code Monitoring existant ;
- vérifier les documents officiels MON-01 à MON-17 et SCR-MON-001 à SCR-MON-009 ;
- confirmer les rôles `MANAGER_SYSTEME`, `OPERATEUR_SYSTEME`, `SUPPORT_SYSTEME` et les permissions déjà figées ;
- ne modifier aucune règle métier ni G1.

### 2. Sécurité et contrats HTTP
- garantir que scope, organisation, école, utilisateur et permissions viennent exclusivement du contexte authentifié ;
- interdire tout écrasement par query/body/header ;
- valider réellement IDs, enums, limites, plages de dates, tailles et payloads ;
- `additionalProperties: false` quand approprié ;
- erreurs homogènes 400/401/403/404/409/500 ;
- aucune fuite de stack, SQL, secret ou payload sensible ;
- OpenAPI complet pour toutes les routes Monitoring.

### 3. Clarifier définitivement le périmètre Plateforme
- Monitoring principal = gouvernance PLATEFORME ;
- ne pas exiger artificiellement une école active pour le Manager Système ;
- organisation/école peuvent servir de dimensions d'observation, jamais d'autorité client ;
- vérifier routes, guards, frontend, navigation et tests E2E.

### 4. Persistance durable PostgreSQL
Remplacer les stockages mémoire de production pour les objets qui doivent survivre à un redémarrage :
- alertes ;
- incidents ;
- historique/timeline d'incident ;
- diagnostics ;
- capacity snapshots ;
- saturations ;
- traces opérationnelles uniquement si la doctrine l'exige.

Ne pas dupliquer les séries temporelles Prometheus dans PostgreSQL.

Créer :
- migrations versionnées ;
- contraintes SQL alignées sur les vrais enums ;
- index utiles ;
- repositories PostgreSQL ;
- mappers/réhydratation domaine ;
- tests PostgreSQL réels ;
- stratégie de rollback/compatibilité.

### 5. Collecte technique réelle
Supprimer tout faux `HEALTHY`, latence fixe ou worker fictif.

Raccorder des sondes réelles pour :
- PostgreSQL ;
- Redis ;
- BullMQ/queues/workers existants ;
- Node runtime : uptime, RSS, heap, CPU, event-loop lag/utilization, GC si disponible ;
- Fastify HTTP : débit, latence, 4xx/5xx ;
- stockage/services externes seulement s'ils existent réellement.

Règle : inconnu => `UNKNOWN`, simulation => `DEGRADED`, jamais `HEALTHY` artificiel.

### 6. BullMQ / workers
- observer le registre/infra BullMQ déjà existant ;
- ne pas créer un second système de queues ;
- exposer snapshot : waiting, active, completed, failed, delayed ;
- distinguer runtime réel vs simulation ;
- workers morts, failed jobs, backlog et saturation doivent être visibles ;
- ajouter tests de dégradation et de reprise.

### 7. Prometheus / Grafana / Loki / Uptime Kuma
- réutiliser `prom-client` et `/metrics` existants ;
- audit de cardinalité ;
- aucun userId/eventId/correlationId/texte libre comme label Prometheus ;
- raccorder le Centre Monitoring à de vraies métriques ;
- versionner les règles Prometheus/alerting si le dépôt les contient ;
- préparer/provisionner Grafana/Loki si cela appartient au dépôt ;
- Uptime Kuma peut rester externe, mais les liens/états doivent être cohérents ;
- EduSync = cockpit opérationnel synthétique, pas clone de Grafana.

### 8. Alerting opérationnel
Règles basées sur des signaux réels, par exemple selon seuils documentés :
- disponibilité ;
- 5xx ;
- latence p95/p99 ;
- PostgreSQL indisponible ;
- Redis indisponible ;
- queue backlog ;
- failed jobs ;
- worker absent ;
- heap/event-loop ;
- stockage/capacité.

Prévoir :
- severité ;
- statut ;
- acquittement ;
- escalade ;
- résolution ;
- deduplication ;
- correlation ;
- timeline ;
- audit des actions humaines.

### 9. Incidents premium
Cycle de vie aligné sur le domaine officiel. Ne pas inventer d'états si les documents les fixent.

Un incident doit pouvoir présenter :
- id ;
- résumé/titre ;
- gravité/niveau ;
- composant/source ;
- statut ;
- détection ;
- acquittement si prévu ;
- investigation ;
- mitigation ;
- résolution ;
- propriétaire ;
- timeline ;
- alertes associées ;
- diagnostics ;
- traces/correlation IDs ;
- impact ;
- cause/résolution si documentés.

### 10. Capacity / saturation
Brancher les concepts existants sur de vraies données :
- CPU/mémoire ;
- DB pool/connexions ;
- queue depth ;
- workers ;
- stockage ;
- débit et croissance si disponible.

Préserver exactement MON-14/MON-15 et leurs permissions distinctes.

### 11. Traces / diagnostic
- supprimer toute saisie JSON libre dans l'UX normale ;
- utiliser des contrats typés ;
- requestId/correlationId ;
- contrôles de taille ;
- pas de secrets ;
- OpenTelemetry seulement si justifié par l'architecture, pas comme nouvelle infrastructure gratuite.

### 12. Frontend premium
Transformer les écrans Monitoring en cockpit professionnel :
- dashboard santé globale ;
- cartes API/PostgreSQL/Redis/Queues/Workers ;
- alertes ;
- incidents ;
- diagnostics ;
- capacity/saturation ;
- traces ;
- tendances utiles ;
- états loading/empty/error/degraded ;
- filtres structurés ;
- pagination si nécessaire ;
- actions conditionnées par permissions ;
- aucun gros `JSON.stringify` ni textarea JSON pour les utilisateurs ;
- types TypeScript réels, éviter `unknown` lorsque le contrat est connu ;
- accessibilité clavier/ARIA/contrastes ;
- responsive desktop/laptop/tablette.

### 13. Realtime
Si `shared/realtime` existe déjà :
- notifications live des alertes/incidents/changements d'état ;
- SSE/WebSocket selon l'existant ;
- fallback polling borné ;
- ne pas créer une infra parallèle.

### 14. Permissions et acteurs
Vérifier l'alignement exact :
- backend ;
- doctrine frontend ;
- routes ;
- actions visibles ;
- E2E.

Support doit rester lecture seule pour les mutations si les documents officiels le disent.

### 15. Résilience
Tests réels ou simulés de panne :
- PostgreSQL DOWN ;
- Redis DOWN ;
- Prometheus indisponible ;
- Grafana indisponible ;
- queue saturée ;
- jobs FAILED ;
- worker absent ;
- timeout de sonde ;
- restart du backend ;
- persistance des incidents/alertes ;
- Monitoring ne doit jamais faire tomber l'application surveillée.

### 16. Rétention
Définir/documenter :
- métriques => Prometheus ;
- logs => Loki ;
- incidents/alertes => PostgreSQL selon politique ;
- traces/diagnostics => politique bornée ;
- aucune suppression silencieuse.

### 17. Tests et couverture
Créer/renforcer :
- `test:monitoring` backend ;
- tests domaine/application ;
- tests sécurité/context forgé ;
- tests PostgreSQL ;
- tests Redis/BullMQ ;
- tests résilience ;
- tests permissions ;
- frontend tests dédiés Monitoring ;
- E2E par rôle ;
- couverture Monitoring dédiée, mesurer d'abord puis poser des seuils réalistes ;
- performance et non-régression.

### 18. E2E minimum
- MANAGER_SYSTEME : dashboard + lectures + mutations autorisées ;
- OPERATEUR_SYSTEME : capacités opérationnelles prévues ;
- SUPPORT_SYSTEME : lectures autorisées, mutations refusées ;
- rôle école/organisation non autorisé : accès Monitoring refusé ;
- incident/alerte/diagnostic/trace/capacity ;
- états degraded/down ;
- refresh/realtime si présent.

### 19. CI
La CI doit exécuter explicitement Monitoring :
- backend tests Monitoring ;
- PostgreSQL ;
- Redis/BullMQ si possible ;
- frontend Monitoring ;
- typecheck ;
- build ;
- ESLint ;
- Semgrep ;
- Gitleaks ;
- Trivy ;
- dépendances ;
- E2E ;
- performance selon pipeline existante.

Ne jamais diminuer les contrôles pour obtenir du vert.

### 20. Revue finale
Avant ZIP final :
- audit complet du diff ;
- recherche des TODO/FIXME/placeholders/simulations ;
- recherche des repositories mémoire encore composés en production ;
- recherche des `JSON.stringify`/textarea JSON dans l'UX Monitoring ;
- recherche des contextes tenant venant du client ;
- recherche des secrets/logs sensibles ;
- `git diff --check` ;
- dépôt propre ;
- documentation de certification.

## Verdict attendu
Ne déclarer `MONITORING — CERTIFIÉ` que si les tests officiels dans l'environnement Node 24, PostgreSQL/Redis, E2E et la CI GitHub sont réellement verts.

Sinon utiliser :
`MONITORING — PRÊT POUR INTÉGRATION, CERTIFICATION OFFICIELLE RESTANTE`.
