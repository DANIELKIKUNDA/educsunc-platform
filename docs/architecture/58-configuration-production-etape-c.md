# Configuration - Etape C

## Portee

Cette etape branche l exploitation runtime reelle des reglages persistants deja
industrialises a l etape B.

Elle couvre :

- la projection runtime interne des reglages plateforme
- la synchronisation explicite des reglages Notifications vers le runtime actif
- le rechargement runtime branche sur les vraies configurations persistantes
- l application du bootstrap SYSTEM aux consommateurs runtime au demarrage

Elle ne couvre pas encore :

- le theme frontend utilisateur en consommation directe
- tous les moteurs runtime secondaires non encore branches dans le backend
- une orchestration multi-processus distribuee

## Decisions appliquees

### Synchronisation runtime

Un service applicatif d orchestration a ete ajoute :

- `backend/src/app/services/ConfigurationRuntimeSynchronisationService.ts`

Il :

- relit les configurations persistantes courantes
- reprojette un `RuntimeConfiguration` coherent
- convertit les cles `notifications.*` en changements exploitables par le
  runtime Notifications
- ignore explicitement les preferences personnelles `notifications.preferences.*`
  qui ne relevent pas du runtime global

### Demarrage

Au demarrage des routes Configuration :

- le bootstrap SYSTEM continue de garantir les cles officielles
- puis une synchronisation runtime applique l etat courant aux consommateurs

Ainsi :

- le runtime local Configuration ne reste plus sur des valeurs purement hardcodees
- le runtime Notifications recoit les reglages persistants des qu ils existent

### Reload runtime

`RechargeurRuntimeConfiguration` ne journalise plus seulement un evenement de
reload.

Il peut maintenant recevoir une synchronisation reelle injectable, ce qui permet :

- de garder le meme port applicatif
- de ne pas casser les tests existants
- de brancher le reload effectif depuis `configuration.routes.ts`

### Notifications

Le runtime Notifications expose maintenant un point d application explicite des
changements venant de Configuration.

Le facade runtime :

- partage le meme `ConfigurationNotificationRuntime`
- expose `appliquerConfiguration(...)`
- conserve un snapshot lisible de la configuration appliquee

Cela ferme enfin l ecart entre :

- les reglages persistants `notifications.*`
- et le moteur Notifications qui tourne en memoire

## Preuves backend

Fichiers principaux :

- `backend/src/app/services/ConfigurationRuntimeSynchronisationService.ts`
- `backend/src/app/plugins/notifications-runtime.ts`
- `backend/src/app/routes/configuration.routes.ts`
- `backend/src/shared/configuration/infrastructure/reload/RechargeurRuntimeConfiguration.ts`

## Tests

Points verifies :

- hydration runtime au demarrage
- translation `notifications.providers.*` vers le runtime Notifications
- translation `notifications.retry.*` vers le runtime Notifications
- exclusion des preferences utilisateur du runtime global
- reload runtime branche sur une synchronisation reelle injectable

## Verdict etape C

Etape C : fonctionnellement branchee.

Ce qui est ferme :

- projection runtime plateforme
- rechargement runtime reel
- synchronisation runtime Notifications
- bootstrap SYSTEM applique aux consommateurs runtime

Ce qui reste pour la suite :

- consommation directe du theme utilisateur dans les couches finales qui en ont besoin
- eventuelle extension vers d autres moteurs runtime si de nouvelles cles officielles sont ajoutees
