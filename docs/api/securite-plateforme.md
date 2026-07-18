# Centre Sécurité Plateforme — exploitation

## Ordre de démarrage

Les migrations s’exécutent dans l’ordre Auth, Audit, puis Sécurité. Elles sont protégées par verrou consultatif et peuvent être rejouées sans duplication.

## Familles d’API

- `/api/v1/security/overview` : synthèse Plateforme.
- `/api/v1/security/accounts` : comptes, détail, cycle de vie, déverrouillage et réinitialisation.
- `/api/v1/security/administrators` : vues transversales des administrateurs.
- `/api/v1/security/organizations/:organisationId/administrators` : gouvernance Organisation.
- `/api/v1/security/emergency/organizations/:organisationId/schools/:ecoleId/administrators` : récupération Plateforme exceptionnelle.
- `/api/v1/security/assignments` : affectations et scopes.
- `/api/v1/security/roles` et `/api/v1/security/permission-catalog` : rôles, fiches, autorisations et limitations.
- `/api/v1/security/sessions` : connexions et révocations.
- `/api/v1/security/login-attempts` : tentatives et verrouillages.
- `/api/v1/security/audit/logs` : historique durable unifié.

Toutes les mutations exigent la session Auth C, la permission correspondante, le scope réel, une clé d’idempotence lorsque le client l’envoie et un motif pour les décisions sensibles.

## Diagnostic

Le script `npm run security:certify:postgres` vérifie les migrations, le rollback, la relecture durable des rôles, l’audit append-only, la persistance documentaire et le masquage des secrets.

Le script `npm run security:certify:governance` crée des périmètres temporaires isolés et vérifie l’absence de fuite multi-tenant, le refus d’une école étrangère, la protection concurrente du dernier administrateur, le cycle création-retrait-réactivation d’une affectation et son audit durable. Les données temporaires sont nettoyées sans réinitialiser la base normale.

## Données interdites

Les journaux ne doivent jamais contenir mot de passe, hash, access token, refresh token, cookie, JWT, secret ou en-tête d’autorisation.
