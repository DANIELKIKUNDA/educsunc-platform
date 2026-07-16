# Authentification - Persistance PostgreSQL

## Portee

Cette etape industrialise uniquement la persistance du BC `shared/auth`.
Elle ne modifie ni le format des JWT, ni la protection globale HTTP, ni le frontend de connexion.

## Stockage de production

Les adaptateurs `Postgres*Repository` utilisent exclusivement le pool PostgreSQL Auth partage.
Il n'existe aucun fallback memoire en production ou en developpement standard.

Tables gerees par la migration Auth idempotente :

- `auth_utilisateurs`
- `auth_refresh_tokens`
- `auth_sessions_utilisateurs`
- `auth_contextes_actifs`
- `auth_tentatives_connexion`
- `auth_schema_migrations`

Les ecritures composees utilisent le meme contexte transactionnel PostgreSQL. Les versions des
agregats protegent les mises a jour concurrentes et les contraintes SQL protegent les identifiants,
emails, hashes de refresh tokens, relations et contextes actifs.

Les sessions et refresh tokens persistants ne portent aucune date d'expiration. La table des refresh
tokens conserve la `token_version_emise`, ce qui interdit a une ancienne chaine de recevoir une
version de securite plus recente apres un changement sensible. La migration 004 revoque une fois
les anciennes chaines non versionnees, puis supprime leurs anciennes colonnes d'expiration.

## Stockage memoire

Les doubles memoire restent uniquement dans
`backend/src/shared/auth/tests/support/AuthMemoryRepositories.ts` pour les tests unitaires isoles.
Ils ne sont exportes par aucun module d'infrastructure de production et ne sont jamais injectes par
le serveur.

## Environnement et commandes

La connexion utilise les variables PostgreSQL communes `DB_HOST`, `DB_PORT`, `DB_USER`,
`DB_PASSWORD` et `DB_NAME`. Aucun secret Auth supplementaire n'est necessaire pour cette etape.

Commandes de preuve :

```text
npm run test:auth:postgres
npm run auth:certify:postgres
```

La seconde commande execute l'ecriture et la relecture dans deux processus Node distincts. Elle
prouve la survie du compte, de la session, du refresh token, du contexte, des tentatives et du
verrouillage apres arret complet du premier processus.

Le durcissement ulterieur des JWT, rotations et revocations est documente dans
`docs/architecture/authentification-jetons-sessions.md`.
