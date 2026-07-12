# Configuration

Module shared de gouvernance de configuration pour EducSyn.

## Vision

Le module `shared/configuration` centralise, gouverne, securise et pilote l ensemble des parametres configurables de la plateforme.

Il doit permettre a EducSyn d etre :
- configurable
- personnalisable
- modulaire
- multi-tenant
- auditable
- securise

Ce module n est pas :
- un simple dossier `settings`
- une table cle-valeur fourre-tout
- un remplaÃ§ant des regles metier des autres BC

Il est officiellement :
- governance-driven
- SaaS-driven
- modularity-driven
- branding-aware
- audit-aware
- security-aware
- tenant-aware

## Responsabilites

Le module est proprietaire de :
- branding et identite visuelle configurables
- parametres des modules activables
- parametres Notifications
- parametres runtime
- hierarchie de configuration
- heritage
- overrides
- locks
- configuration effective
- validation de configuration
- snapshots
- historique et gouvernance de configuration

Il pilote notamment :
- activation modules
- quotas
- templates
- preferences
- policies configurables
- branding ecole
- options documentaires
- reload runtime
- propagation locale

## Limites

Le module ne possede jamais :
- `auth`
- `security`
- `audit`
- `notifications`
- `referentiel-academique`
- `scolarite-eleves`
- `paiements-facturation`
- `bulletins-evaluations`
- `monitoring`
- le moteur runtime des autres modules

Il ne doit jamais :
- dupliquer les agregats des autres BC
- acceder directement a leurs bases
- contenir leur logique metier
- casser la verite metier de ces modules

Configuration gouverne leur comportement configurable, mais ne les remplace pas.

## Hierarchie

Hierarchie officielle :

```text
SYSTEM
  > ORGANIZATION
    > SCHOOL
      > USER
```

Principes :
- une configuration est definie a un niveau de portee
- un niveau inferieur herite du niveau superieur par defaut
- un override n est possible que si la configuration l autorise
- un lock bloque les modifications selon son niveau minimal autorise
- en cas de conflit, la priorite suit `USER > SCHOOL > ORGANIZATION > SYSTEM`, seulement si l override est autorise

Chaque parametre doit declarer au minimum :
- `scope`
- `owner`
- `heritable`
- `overridable`
- `locked`
- `visible`
- `auditRequired`
- `restartRequired`

## Heritage Et Overrides

Le domaine Configuration est :
- inheritance-aware
- override-aware
- lock-aware

Regles principales :
- l heritage doit etre deterministe
- un override interdit doit echouer
- un lock ne peut pas etre contourne
- une configuration ne doit jamais fuiter cross-tenant
- une configuration non visible pour un niveau ne doit pas etre exposee a ce niveau

## Snapshots Et Audit

Le module prend en charge :
- `ConfigurationVersion`
- `ConfigurationSnapshot`
- `EffectiveConfiguration`
- `ConfigurationChange`

Les changements importants doivent rester :
- historises
- tracables
- auditables
- explicables

Les snapshots servent a :
- figer un etat effectif
- comparer deux etats
- preparer des diagnostics et des retours arriere futurs

## Integrations

Le module collabore avec :
- `auth`
- `security`
- `audit`
- `notifications`
- `referentiel-academique`
- `scolarite-eleves`
- `paiements-facturation`
- `bulletins-evaluations`
- `monitoring`
- `runtime`

Regle d architecture :
- ports
- adapters
- mappers
- listeners
- anti-corruption layers

Jamais :
- acces DB direct cross-module
- couplage fort aux agregats externes
- duplication sauvage des modeles metier

## Structure

- `domain` : agregats, entites, value objects, policies, services, specifications
- `application` : use cases, commands, queries, DTO, ports, validateurs, read models
- `infrastructure` : persistence, repositories, cache, propagation, reload, monitoring, diagnostics
- `interfaces` : controllers, routes, validateurs HTTP, presenters, contrats et DTO exposes
- `integration` : ponts vers les autres modules et BC
- `tests` : validation transverse du module
- `operational` : diagnostics, health, monitoring, propagation, reload, scripts locaux

## Dependances Autorisees

Le module peut dependra de :
- son propre `domain`
- son propre `application`
- son propre `infrastructure`
- ses propres `interfaces`
- ses propres `integration`
- des contrats/ports propres des autres modules via adapters

Dans le repo, la couche `integration/` au singulier est conservee volontairement pour respecter l existant, meme si le document parle de `integrations/`.

## Dependances Interdites

Interdictions fortes :
- acces direct aux repositories externes
- acces direct aux tables externes
- import d agregats metier externes comme dependances de travail
- bypass des ports applicatifs
- bypass audit
- bypass validation
- bypass permissions
- dependances circulaires entre modules

## Tests

Le module doit etre couvert sur :
- domaine
- application
- infrastructure
- interfaces
- integrations
- security
- tenant
- performance
- resilience

Invariants critiques a verifier :
- heritage
- override
- locks
- configuration effective
- isolation tenant
- validation
- propagation
- reload
- audit
- monitoring

## Operational

Le support local du module vit dans `operational/`.

Il couvre :
- diagnostics
- health
- monitoring
- propagation
- reload
- scripts locaux

Important :
- pas de `docker-compose` local ici
- pas de `nginx` ici
- pas de `postgres` global ici

L infra globale reste a la racine du projet.

## Etat Actuel

Le module est actuellement materialise avec :
- `domain`
- `application`
- `infrastructure`
- `interfaces`
- `integration`
- `tests`
- `operational`

Etat technique :
- compile stricte backend : OK
- noyau de tests Configuration : vert

## Amorcage Officiel

L amorcage officiel des configurations initiales est industrialise autour de
`ConfigurationInitialisationOfficielleService`.

Objectif :
- initialiser seulement les cles officiellement prouvees
- ne jamais inventer une valeur par defaut non documentee
- ne jamais ecraser une personnalisation existante
- rester idempotent
- garder une trace exploitable de chaque passage

Moments d amorcage actuellement branches :
- `SYSTEM` : bootstrap global du module Configuration
- `ORGANIZATION` : creation d organisation et rattrapage idempotent au demarrage du BC
- `SCHOOL` : creation d ecole et rattrapage idempotent au demarrage du BC
- `USER` : aucun defaut persiste officiel n est encore prouve, donc aucun reglage n est cree arbitrairement

Inventaire officiel actuellement prouve :
- `modules.allowed`
  - scope : `ORGANIZATION`
  - valeur initiale : catalogue complet des modules connus
  - justification : l absence de cette cle etait deja interpretee comme une autorisation globale
- `modules.enabled`
  - scope : `SCHOOL`
  - valeur initiale : `[]`
  - justification : aucun module ne doit devenir actif automatiquement pour une ecole

Inventaire officiellement reconnu mais sans defaut persiste obligatoire a ce jour :
- `runtime.retry.maxAttempts`
- `runtime.replay.enabled`
- `runtime.cache.ttlSeconds`
- `branding.logo.primary`
- `notifications.templates.default`
- `preferences.theme`

Principe fondamental :
- une cle connue n implique pas automatiquement une valeur initiale obligatoire

## Persistance Locale Reelle

Le module ne repose plus uniquement sur de la memoire volatile pour les configurations creees.

Le repository `RepositoryConfigurationMemoirePersistante` :
- recharge les configurations existantes depuis le disque
- persiste chaque creation, mise a jour et suppression
- rehydrate les agregats avec leur compteur de versions

Fichiers locaux utilises :
- `stockage-local/configuration/configurations.json`
- `stockage-local/configuration/bootstrap-journal.json`

Le premier fichier porte la persistence locale exploitable.
Le second journalise les passages d amorcage officiel pour diagnostic et rattrapage.

## Semantique Des Modules

La gouvernance des modules suit strictement cette doctrine :

- Organisation :
  - `modules.allowed`
  - definit les modules autorises pour les ecoles de l organisation
- Ecole :
  - `modules.enabled`
  - definit les modules explicitement actives localement
- Resolution effective :
  - `modulesEffectifs = modules.allowed ∩ modules.enabled`

Regle critique :
- l absence de `modules.allowed` peut etre traitee comme catalogue autorisable complet
- l absence de `modules.enabled` ne doit jamais signifier activation implicite de tous les modules

Autrement dit :
- autorisation par defaut possible au niveau organisation
- activation automatique interdite au niveau ecole

## Rattrapage Des Contextes Existants

Au demarrage du BC `referentiel-academique`, un rattrapage idempotent parcourt :
- les organisations existantes
- les ecoles existantes

But :
- combler les contextes historiques deja presents avant l industrialisation
- sans doublons
- sans ecrasement
- sans mutation arbitraire

## Regle Fondamentale

`Configuration` ne contient pas le metier des autres modules.

`Configuration` gouverne le comportement configurable de ces modules, dans des frontieres DDD et Clean Architecture strictes.
