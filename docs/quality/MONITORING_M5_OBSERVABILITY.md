# Monitoring M5 — Prometheus / Grafana / Loki / Uptime Kuma

## Statut

M5 est implemente dans le paquet. La certification d'exploitation reste a executer dans l'environnement officiel Node 24 et dans l'infrastructure de deploiement cible.

## Prometheus

Le backend reutilise exclusivement `prom-client` et `GET /metrics`. Aucun second registre metrique Monitoring n'est expose.

Labels HTTP autorises : `method`, `route`, `status_code`. La route est le patron Fastify normalise, jamais l'URL concrete. `userId`, `eventId`, `requestId`, `correlationId`, identifiants tenant et texte libre ne sont pas des labels Prometheus.

La configuration versionnee se trouve sous `docker/observability/prometheus/`. Le token de scrape n'est pas versionne : Prometheus le lit depuis `/run/secrets/edusync_metrics_token`.

Une seule alerte d'infrastructure est versionnee ici : cible backend Prometheus indisponible (`up == 0`). Aucun seuil 5xx, latence, heap ou queue n'a ete invente : ces regles devront utiliser les seuils officiels lorsqu'ils seront disponibles.

## Grafana

Grafana reste la console technique profonde. Le dashboard provisionne fournit uniquement une vue technique de base (debit HTTP, p95, 5xx, memoire Node). Le cockpit Vue EduSync reste responsable de la synthese operationnelle, des alertes et incidents.

Les datasources Prometheus et Loki sont provisionnees automatiquement.

## Loki

Loki recoit les logs JSON produits par Pino via le mecanisme de collecte de logs de l'environnement cible. Ce paquet ne cree pas un agent de collecte parallele, car aucun agent officiel (Promtail/Alloy) n'est defini dans le depot.

Les logs HTTP sont structures avec : `requestId`, `correlationId`, `service`, `composant`, `methode`, `route`, `statut`, `dureeMs`. Les dimensions utilisateur/organisation/ecole ont ete retirees de la journalisation HTTP courante pour minimiser les donnees envoyees vers Loki. Le logger Pino conserve son masquage des secrets.

La retention Loki provisionnee est de 168 h (7 jours). Elle est explicite et peut etre ajustee par la politique d'exploitation officielle sans changement de contrat metier.

## Uptime Kuma

Uptime Kuma reste externe au depot. Aucun faux etat Uptime Kuma n'est genere par EduSync. L'exploitation doit configurer au minimum les checks publics/techniques deja disponibles (`/health/live` et `/health/ready`) selon la politique reseau du deploiement.

## Deploiement

Fichier : `docker/observability/docker-compose.observability.yml`.

Variables/secrets obligatoires :

- `EDUCSYN_METRICS_TOKEN_FILE` : chemin hote vers un fichier contenant le meme token que `EDUCSYN_METRICS_TOKEN` du backend ;
- `GRAFANA_ADMIN_USER` ;
- `GRAFANA_ADMIN_PASSWORD`.

Le backend doit etre joignable depuis le reseau Compose sous `backend:3000`, ou la cible Prometheus doit etre adaptee par l'integration de deploiement.

## Validation M5

Tests de non-regression ajoutes au runner `test:observability` :

- protection du endpoint `/metrics` ;
- cardinalite des labels ;
- absence d'identifiant dynamique dans les metriques ;
- presence du scrape Prometheus avec secret fichier ;
- regle d'indisponibilite versionnee sans seuil metier invente ;
- provisioning Grafana Prometheus/Loki ;
- dashboard utilisant les metriques EduSync ;
- retention Loki explicite ;
- absence de secret statique dans le Compose ;
- structure des logs HTTP et minimisation des dimensions sensibles.

## Reste a certifier dans l'environnement officiel

1. `npm --prefix backend ci` sous Node 24 ;
2. `npm --prefix backend run test:observability` ;
3. `npm --prefix backend run test:coverage` ;
4. `npm --prefix backend run typecheck:strict` ;
5. demarrage Prometheus/Grafana/Loki avec les secrets reels ;
6. scrape effectif de `/metrics` ;
7. affichage du dashboard Grafana ;
8. ingestion Loki via l'agent de logs retenu par l'infrastructure cible ;
9. checks Uptime Kuma ;
10. verification de la CI GitHub Actions.
