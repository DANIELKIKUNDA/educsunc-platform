# D1.3 - Observabilite et qualite backend

## Decision

Le socle D1.3 complete `shared/monitoring` sans le remplacer. Le domaine Monitoring
conserve les alertes, incidents, traces et vues metier. Le socle HTTP fournit les
signaux techniques standards attendus par l exploitation d un service Fastify.

## Metriques Prometheus

- `GET /metrics` expose les metriques runtime Node.js et les mesures HTTP.
- Les routes sont utilisees comme labels, jamais les URL contenant des identifiants.
- Chaque serveur utilise son propre registre afin d eviter les collisions en test.
- Les metriques sont actives par defaut en developpement et en test.
- Elles sont desactivees par defaut en production.
- Leur activation en production exige `EDUCSYN_METRICS_TOKEN`.
- Le collecteur utilise `Authorization: Bearer <jeton>` et une comparaison en temps
  constant.

Variables :

```text
EDUCSYN_METRICS_ENABLED=1
EDUCSYN_METRICS_TOKEN=<secret de supervision>
```

## Sante

- `GET /health` conserve le contrat historique de vivacite.
- `GET /health/live` indique que le processus HTTP repond.
- `GET /health/ready` execute une lecture minimale PostgreSQL.
- La disponibilite renvoie `200` lorsque PostgreSQL repond et `503` sinon.
- Les reponses publiques ne contiennent ni exception, ni chaine de connexion, ni
  information d authentification.

## OpenAPI

- `GET /openapi.json` expose l inventaire dynamique des routes et les schemas deja
  declares.
- Le document precise explicitement que les schemas detailles ne sont publies que
  lorsqu ils existent ; il ne pretend pas remplacer les contrats metier figes.
- Le catalogue est actif par defaut hors production et desactive par defaut en
  production via `EDUCSYN_OPENAPI_ENABLED`.
- Aucun Swagger UI ni endpoint supplementaire n est ajoute sans consommateur reel.

## Journalisation

- Pino produit des logs JSON portant service, environnement et horodatage.
- Les traitements HTTP portent methode, route normalisee, statut, duree, requestId
  et correlationId lorsqu ils sont disponibles.
- Les mots de passe, jetons, cookies et en-tetes d autorisation sont masques.
- `EDUCSYN_LOG_LEVEL` controle le niveau sans modification du code.
- Le `LogController` officiel Fastify remplace l option de journalisation depreciee.

## Couverture

La couverture native de Node 24 est utilisee, sans outil tiers. Elle controle le
socle D1.3 avec les seuils suivants :

- lignes : 80 % ;
- fonctions : 80 % ;
- branches : 75 %.

Le rapport LCOV est conserve par GitHub Actions. La couverture exhaustive de tous
les bounded contexts reste la responsabilite de D1.9, conformement au decoupage
qualite valide ; elle ne modifie pas la certification du socle D1.3.

## Commandes

```text
npm --prefix backend run test:observability
npm --prefix backend run test:coverage
npm --prefix backend run typecheck:strict
npm --prefix backend run test:http
npm --prefix backend run test:global
npm --prefix backend run build
```

## Frontieres

- aucune permission metier n est creee ;
- aucun workflow fonctionnel n est modifie ;
- aucune donnee tenant n est placee dans les labels Prometheus ;
- `shared/monitoring` n est pas contourne pour les incidents, alertes ou diagnostics ;
- OpenAPI reste un catalogue technique et non une nouvelle source de verite metier.

## Risque amont surveille

`npm audit --omit=dev` ne remonte aucune vulnerabilite. L audit complet signale une
alerte faible dans `esbuild`, dependance de developpement imposee par la plage
`~0.27.0` de `tsx`. La correction automatique exige actuellement une version hors
de cette plage. Aucun override force n est applique : il fragiliserait tous les
tests TypeScript pour corriger un serveur de developpement qui n est jamais livre
en production. La prochaine version compatible de `tsx` devra etre adoptee par la
maintenance des dependances.
