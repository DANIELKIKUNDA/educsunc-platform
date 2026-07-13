# Configuration - Etape A

## Portee

Cette etape pose le socle officiel du module Configuration avant la migration PostgreSQL
et avant le branchement complet des moteurs runtime.

Elle couvre :

- le catalogue officiel backend des reglages
- les valeurs par defaut officielles
- l amorcage SYSTEM, ORGANIZATION, SCHOOL et USER
- les notifications globales et personnelles au niveau catalogue

Elle ne couvre pas encore :

- la persistance PostgreSQL
- le branchement runtime effectif du retry, du replay et du cache
- le branchement complet du theme utilisateur
- les formulaires premium finaux

## Decisions appliquees

### Source unique backend

Le catalogue officiel est centralise dans :

- `backend/src/shared/configuration/domain/constants/CatalogueConfigurationOfficielle.ts`

Il decrit pour chaque reglage :

- la cle
- la portee
- la categorie
- le type de valeur
- la valeur par defaut
- les bornes ou valeurs autorisees
- l unite si necessaire
- la sensibilite
- le moteur consommateur vise
- le moment d amorcage officiel
- la preuve backend

### Defaults officialises

Defaults officiellement poses des cette etape :

- `runtime.retry.maxAttempts = 3`
- `runtime.replay.enabled = true`
- `runtime.cache.ttlSeconds = 120`
- `notifications.providers.in_app.enabled = true`
- `notifications.providers.sms.enabled = true`
- `notifications.providers.email.enabled = true`
- `notifications.providers.whatsapp.enabled = false`
- `notifications.providers.push.enabled = false`
- `notifications.providers.webhook.enabled = false`
- `notifications.retry.enabled = true`
- `notifications.retry.maxAttempts = 5`
- `notifications.retry.defaultBackoffMs = 60000`
- `notifications.replay.enabled = true`
- `notifications.replay.batchSize = 100`
- `preferences.theme = system`
- `notifications.preferences.muted = false`
- `notifications.preferences.preferredChannel = IN_APP`
- `notifications.preferences.enabledChannels = [IN_APP, EMAIL]`

### Amorcage

Le service :

- `backend/src/app/services/ConfigurationInitialisationOfficielleService.ts`

cree maintenant les defaults officiels :

- au bootstrap SYSTEM
- a la creation ORGANIZATION
- a la creation SCHOOL
- au premier usage USER

sans ecrasement des personnalisations existantes.

### Classification

La politique de classification reconnait maintenant :

- les notifications globales runtime comme `SYSTEM`
- les preferences `notifications.preferences.*` comme `USER`

Ce point etait indispensable pour rendre coherents les nouveaux defaults.

## Limites restantes

### Production

La persistance de production reste encore locale JSON tant que l etape B n a pas remplace
le repository courant par PostgreSQL.

### Effet reel

Le catalogue et les defaults existent maintenant, mais certains moteurs consommateurs
restent a brancher :

- retry plateforme
- replay plateforme
- cache plateforme
- theme utilisateur
- gouvernance runtime complete des notifications

## Validation attendue avant etape B

Verifier humainement :

- que les defaults choisis sont bien les bons
- que la portee SYSTEM et USER des notifications est validee
- que le catalogue officiel couvre bien le minimum attendu de production

Une fois validee, l etape suivante est :

- persistance PostgreSQL
- migration idempotente
- tests de redemarrage et de persistence
