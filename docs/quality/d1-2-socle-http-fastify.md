# D1.2 - Socle HTTP Fastify

## Decision

Le socle HTTP transverse repose sur Fastify 5 et les plugins officiels
`@fastify/cors` et `@fastify/helmet`. Les routes et les controles metier restent
inchanges.

## Capacites standardisees

- CORS refuse les origines inconnues au lieu de leur attribuer une origine de
  secours.
- Les origines locales sont reservees aux environnements de developpement et de
  test. La production utilise uniquement `EDUCSYN_CORS_ADDITIONAL_ORIGINS`.
- Les en-tetes HTTP de securite sont appliques a toutes les routes.
- Les erreurs internes sont journalisees cote serveur et remplacees par un
  contrat public stable.
- Les routes absentes renvoient un message public stable.
- `SIGINT` et `SIGTERM` ferment Fastify une seule fois ; les hooks `onClose`
  ferment ensuite les workers, adaptateurs et pools PostgreSQL.

## Capacites volontairement non ajoutees

- Cookies : AUTH utilise des Bearer tokens et aucun workflow cookie n'existe.
- Multipart : aucun endpoint d'upload multipart n'est actuellement expose.
- OpenAPI : les routes ne possedent pas encore un catalogue complet de schemas
  publiables ; une documentation partielle serait trompeuse.
- Rate limiting global : AUTH possede deja ses politiques ciblees de limitation
  pour le login et le refresh. Une seconde limite globale changerait le
  comportement fonctionnel.

Ces choix evitent les dependances sans consommateur et pourront etre reexamines
uniquement lorsqu'un workflow backend reel les exigera.

## Verification

```text
npm run typecheck:strict
npm run test:http
npm run test:global
npm run test:security
npm run build
```

Les tests du socle couvrent les origines autorisees et refusees, la production,
les en-tetes de securite, la non-divulgation des erreurs, les routes absentes et
l'arret gracieux idempotent.
