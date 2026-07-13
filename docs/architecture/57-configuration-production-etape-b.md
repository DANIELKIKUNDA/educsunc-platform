# Configuration - Etape B

## Portee

Cette etape industrialise la persistence reelle du module `shared/configuration`
au-dela de la memoire et du JSON local.

Elle couvre :

- la persistence PostgreSQL des configurations
- la persistence PostgreSQL des versions
- la persistence PostgreSQL des snapshots
- la journalisation PostgreSQL de l amorcage officiel
- la migration idempotente de schema
- le choix de stockage par environnement

Elle ne couvre pas encore :

- le branchement complet des moteurs runtime consommateurs
- l administration UI finale de toutes les familles
- les conflits multi-noeuds de tres haute concurrence

## Decisions appliquees

### Mode de stockage

Le module supporte maintenant trois modes explicites :

- `memory`
- `local-json`
- `postgres`

Resolution actuelle :

- environnement `test` : `memory`
- `EDUCSYN_CONFIGURATION_STORAGE=memory` : `memory`
- `EDUCSYN_CONFIGURATION_STORAGE=local-json` ou `json` : `local-json`
- sinon : `postgres`

### Persistence PostgreSQL

Les repositories PostgreSQL ajoutes sont :

- `RepositoryConfigurationPostgres`
- `RepositoryConfigurationVersionPostgres`
- `RepositoryConfigurationSnapshotPostgres`
- `PortSuppressionConfigurationPostgres`

Les lectures PostgreSQL ajoutees sont :

- `ConfigurationReadModelPostgres`
- `EffectiveConfigurationReadModelPostgres`
- `ConfigurationSnapshotReadModelPostgres`

### Tables creees

La migration idempotente cree :

- `educsyn_configuration_entries`
- `educsyn_configuration_versions`
- `educsyn_configuration_snapshots`
- `educsyn_configuration_bootstrap_journal`

Objectif :

- conserver les reglages
- conserver l historique
- conserver les instantanes
- conserver les traces d amorcage officiel

### Amorcage officiel

`ConfigurationInitialisationOfficielleService` n ecrit plus uniquement dans un
fichier journal.

Il depend maintenant d un store abstrait :

- `ConfigurationBootstrapJournalStoreFichier`
- `ConfigurationBootstrapJournalStorePostgres`

Ce point permet :

- de garder le fallback local
- de journaliser proprement en PostgreSQL
- de conserver l idempotence de l amorcage

### Snapshot corrige

La structure de `ConfigurationSnapshot` porte maintenant explicitement :

- `identifiantSnapshot`
- `configurationId`
- `valeurs`
- `creeLe`

Cette correction ferme une dette reelle :

- un snapshot n etait pas suffisamment rattache a sa configuration source
- la persistence et la relecture par configuration restaient fragiles

## Impact backend

`backend/src/app/routes/configuration.routes.ts` selectionne maintenant les bons
repositories, read models et stores selon le mode de stockage.

En pratique :

- les routes restent identiques
- la source de persistence change sans casser les use cases
- le bootstrap SYSTEM reste appele au demarrage
- les modules Organisation et Ecole continuent a passer par Configuration

## Tests ajoutes ou renforces

Points maintenant couverts :

- catalogue officiel des cles
- classification des notifications globales et personnelles
- bootstrap idempotent Organisation, Ecole et Utilisateur
- support d un journal externe et d un lister asynchrone
- conservation du `configurationId` dans les snapshots

## Limites restantes

### Validation machine locale

La machine Windows actuelle presente encore un blocage d execution Node sur le
profil `C:\\Users\\MON PC` avec erreur `EPERM / lstat`.

Cela ne remet pas en cause l architecture implemente, mais complique la
validation automatique locale tant que le contournement d environnement n est
pas stabilise.

### Runtime complet

Les moteurs consommateurs doivent encore relire et exploiter davantage les
reglages persistants pour fermer completement la boucle de production :

- retry
- replay
- cache
- theme utilisateur
- autres consommateurs notifications

## Verdict de l etape B

Etape B : structurellement industrialisee.

Ce qui est ferme :

- persistence PostgreSQL
- migration idempotente
- journal d amorcage abstrait
- snapshots rattaches proprement a leur configuration

Ce qui reste pour les prochaines etapes :

- validation machine totalement fiable sur ce poste Windows
- exploitation runtime complete des reglages persistants
