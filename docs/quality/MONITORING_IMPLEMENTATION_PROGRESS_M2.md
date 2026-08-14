# Monitoring — progression implementation M2

## Implémenté dans cette passe

- socle PostgreSQL Monitoring dédié ;
- migration idempotente pour alertes, incidents, diagnostics et traces ;
- contraintes SQL alignées sur les enums domaine existants ;
- indexes statut/date, gravité/date, incident/date et trace/date ;
- repository PostgreSQL alertes avec upsert et réhydratation ;
- repository PostgreSQL incidents/diagnostics avec réhydratation du cycle domaine ;
- repository PostgreSQL traces ;
- exports infrastructure ajoutés.

## Intégration production encore à faire

Les routes/runtime utilisent encore les repositories mémoire. Le branchement PostgreSQL ne doit être fait qu'avec une fabrique de cycle de vie/pool propre et une migration de démarrage cohérente avec l'infrastructure globale. Les repositories mémoire restent nécessaires aux tests.

## Validation de cette passe

La validation TypeScript n'a pas pu être achevée dans l'environnement courant : le ZIP ne contenait pas `node_modules` et `npm ci` a dépassé la fenêtre d'exécution disponible. Aucun succès de certification n'est donc revendiqué.

Verdict : **MONITORING — IMPLEMENTATION EN COURS, NON CERTIFIÉ**.
