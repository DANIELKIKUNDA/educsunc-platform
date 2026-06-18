# Realtime

Module shared de diffusion temps reel pour EducSyn.

## Mission

Le module `shared/realtime` centralise la diffusion des evenements visibles vers les interfaces clientes sans rechargement manuel.

Il doit permettre a EducSyn d etre :
- reactif
- collaboratif
- multi-tenant
- offline-first
- permission-aware
- runtime-aware
- observable

Ce module n est pas :
- un module metier
- un moteur de decision metier
- un remplacement de `notifications`
- un remplacement de `monitoring`
- un remplacement de `security`

Il est officiellement :
- event-driven
- audience-aware
- offline-first
- tenant-aware
- security-aware
- ux-driven

## Vision

`Realtime` se situe entre :
- les modules metiers et shared qui produisent des evenements diffusables
- le frontend qui doit voir des changements immediats

La regle structurante du module est :
- les autres modules decident
- `realtime` transporte

Autrement dit :
- le metier decide qu un evenement est diffusable
- `realtime` decide seulement comment le transporter proprement

## Responsabilites

Le module est proprietaire de :
- `EvenementTempsReel`
- `EvenementDiffusable`
- `AudienceTempsReel`
- `CanalTempsReel`
- `ConnexionTempsReel`
- `AbonnementTempsReel`
- `MessageTempsReel`
- `ContexteTempsReel`
- `PrioriteTempsReel`
- `TypeDiffusion`
- `PolitiqueDiffusion`
- `ValeurUtilisateur`
- `FiltreDiffusion`

Il prend en charge :
- la validation de diffusabilite
- la transformation evenement -> message
- la gestion logique des connexions
- la gestion logique des abonnements
- la diffusion controlee
- la reconnexion
- la degradation acceptable
- l observabilite runtime locale
- le support operational du module

## Limites

Le module ne possede jamais :
- `auth`
- `security`
- `configuration`
- `notifications`
- `monitoring`
- `referentiel-academique`
- `scolarite-eleves`
- `paiements-facturation`
- `bulletins-evaluations`
- `synchronisation`

Il ne doit jamais :
- recalculer les roles metier comme titulaires, prefets, caissiers ou directeurs
- acceder directement aux bases des autres modules
- contenir les regles metier des autres BC
- diffuser a tout le monde sans audience autorisee
- devenir une dependance metier bloquante

`Realtime` transporte les evenements visibles.
Il ne cree pas leur verite metier.

## Evenements Diffusables

Tous les evenements metier ne deviennent pas des evenements temps reel.

Un evenement est diffusable seulement s il :
- est visible par un utilisateur
- a une valeur utilisateur immediate
- impacte une interface
- necessite une reaction ou une mise a jour visible
- possede une audience autorisee

Exemples generalement diffusables :
- `PaiementEnregistre`
- `PaiementAnnule`
- `NotificationCreee`
- `NotificationCritiqueCreee`
- `BulletinGenere`
- `FicheCotationValidee`
- `SynchronisationTerminee`
- `AlerteCritiqueCreee`
- `IncidentCritiqueDetecte`

Exemples generalement non diffusables :
- `ProjectionReconstruite`
- `CacheRecharge`
- `IndexMisAJour`
- `RetryExecute`
- `WorkerDemarre`
- `WorkerArrete`
- `ReadModelActualise`

## Audience Et Permissions

`Realtime` ne calcule jamais seul qui doit recevoir quoi.

L audience vient de :
- `auth`
- `security`
- le module ou BC proprietaire de l evenement

Le module applique ensuite :
- l audience autorisee
- les permissions requises
- la compatibilite organisation / ecole / utilisateur

Invariants :
- aucun message sans audience
- aucune audience sans permissions
- aucune diffusion hors contexte autorise

## Canaux

Les canaux realtime sont des espaces logiques de diffusion.

Exemples :
- `finance`
- `evaluations`
- `bulletins`
- `notifications`
- `monitoring`
- `synchronisation`
- `administration`

Le canal ne porte pas le metier.
Il porte seulement le flux de diffusion.

## Multi-Tenant

Le module est strictement `tenant-aware`.

Contraintes fortes :
- pas de fuite cross-tenant
- pas de fuite cross-organisation
- pas de fuite cross-ecole
- pas d exposition d une audience hors de son contexte

Les objets suivants doivent rester tenant-aware :
- `ConnexionTempsReel`
- `AudienceTempsReel`
- `MessageTempsReel`
- `ContexteTempsReel`
- `CanalTempsReel`

## Offline-First

Le module est explicitement offline-first.

Cela signifie :
- l application doit continuer sans realtime
- l API REST continue
- le metier continue
- les donnees continuent
- la synchronisation continue

Si `realtime` tombe :
- la mise a jour instantanee disparait
- mais la plateforme ne doit pas etre bloquee

`Realtime` est un accelerateur UX, pas une dependance metier.

## Reconnexion Et Resilience

Le module prepare :
- la reconnexion
- la reprise apres rupture
- le replay leger si necessaire
- la protection anti-tempete
- la relance runtime

Objectifs :
- ne pas saturer les interfaces
- ne pas saturer le reseau
- ne pas rendre le systeme fragile
- garder un comportement degrade acceptable

## Integrations

Le module collabore avec :
- `auth`
- `security`
- `configuration`
- `notifications`
- `monitoring`
- `synchronisation`
- `referentiel-academique`
- `scolarite-eleves`
- `paiements-facturation`
- `bulletins-evaluations`

Regles d architecture :
- adapters
- mappers
- listeners
- orchestrators
- publishers
- anti-corruption layers
- bridges

Jamais :
- acces DB direct cross-module
- import d agregats externes comme source de verite
- duplication de metier externe

## Runtime

Le runtime du module vit dans `runtime/`.

Il couvre :
- connexions
- abonnements
- diffusion
- offline
- resilience
- observabilite
- health
- coordinators
- registry
- bootstrap

Il doit :
- coordonner
- consolider
- exposer un snapshot local
- rester pilotable

Il ne doit pas :
- redevenir la couche metier
- remplacer `application`
- remplacer `integration`

## Workers

Les workers du module vivent dans `workers/`.

Ils couvrent :
- diffusion
- dispatch
- connexions
- heartbeat
- nettoyage
- abonnements
- reconnexion
- replay leger
- recovery
- protection tempete
- observabilite
- metriques
- diagnostics

Leur role :
- executer des traitements specialises
- rester fins
- deleguer au runtime
- ne pas embarquer du metier profond

## Structure

- `domain` : agregats, entites, value objects, policies, services, specifications
- `application` : use cases, commands, queries, DTO, ports, validateurs, orchestrateurs, read-models
- `infrastructure` : persistence, repositories, diffusion, audience, security, configuration, observability, offline, resilience
- `interfaces` : controllers, routes, validateurs HTTP, presenters, contrats et DTO exposes
- `integration` : ponts vers auth, security, configuration, notifications, monitoring, synchronisation et BC metier
- `runtime` : coordination des connexions, abonnements, diffusion, reconnexion et diagnostics
- `workers` : executions specialisees du module
- `tests` : validation transverse du module
- `operational` : bootstrap, health-checks, diagnostics, recovery, manifests, support, scripts

Le repo conserve `integration/` au singulier pour rester coherent avec l existant global.

## Dependances Autorisees

Le module peut dependre de :
- son propre `domain`
- son propre `application`
- son propre `infrastructure`
- ses propres `interfaces`
- ses propres `integration`
- son propre `runtime`
- ses propres `workers`
- ses propres `operational`
- des contrats et adapters explicites des autres modules

## Dependances Interdites

Interdictions fortes :
- acces direct aux repositories externes
- acces direct aux tables externes
- import d agregats metier externes comme dependances de travail
- bypass des ports applicatifs
- bypass des permissions
- bypass de l isolation tenant
- dependances circulaires non controlees
- logique metier des autres BC dans `realtime`

## Tests

La cible documentaire du module couvre :
- domaine
- application
- infrastructure
- interfaces
- integrations
- runtime
- workers
- multi-tenant
- security
- offline
- resilience
- performance

Le noyau actuellement pose couvre deja des preuves reelles sur :
- evenement diffusable
- connexion
- isolation
- use cases de publication et connexion
- repository memoire
- controller HTTP principal
- integration notifications
- integration configuration
- runtime registry
- runtime observabilite
- worker broadcast
- offline-first

## Operational

Le support local du module vit dans `operational/`.

Il couvre :
- bootstrap
- health-checks
- diagnostics
- recovery
- manifests
- support
- scripts

Important :
- pas de `docker-compose` local ici
- pas de `nginx` ici
- pas de `postgres` global ici
- pas d orchestration plateforme dupliquee ici

L infra globale reste a la racine du projet.

## Etat Actuel

Le module est actuellement materialise avec :
- `domain`
- `application`
- `infrastructure`
- `interfaces`
- `integration`
- `runtime`
- `workers`
- `tests`
- `operational`

Etat technique actuel :
- compile stricte backend : OK
- noyau de tests Realtime : present et executable

## Frontiere Fondamentale

`Realtime` transporte les evenements visibles.

`Realtime` ne possede aucun metier externe.

Sa responsabilite est de rendre la plateforme :
- plus immediate
- plus lisible
- plus collaborative
- plus reactive

dans des frontieres DDD et Clean Architecture strictes.
