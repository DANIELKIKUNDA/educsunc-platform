# Monitoring

Module shared de monitoring, observabilite et diagnostic pour EducSyn.

## Mission

Le module `shared/monitoring` centralise la lecture de l etat de sante de la plateforme, la collecte des signaux, l analyse des incidents, le tracing, la production de diagnostics et la consolidation de vues d observabilite.

Il doit permettre a EducSyn d etre :
- observable
- diagnosable
- alertable
- forensic-ready
- capacity-aware
- runtime-aware
- multi-tenant

Ce module n est pas :
- un simple dossier de logs
- une pile Prometheus/Grafana embarquee dans le code
- un remplacement du metier des autres bounded contexts
- un moteur d audit global

Il est officiellement :
- health-driven
- observability-driven
- incident-aware
- tracing-aware
- forensic-aware
- tenant-aware

## Vision

Le monitoring dans EducSyn ne se limite pas a savoir si "le serveur repond".

Il doit donner une vue exploitable de :
- l etat global du systeme
- l etat de chaque composant
- l etat des dependances
- la derive des performances
- la saturation des ressources
- la correlation des traces
- les signaux d anomalie
- les alertes ouvertes et resolues
- les incidents et leur diagnostic
- les besoins de capacity planning

Le module doit aussi offrir une base propre pour :
- les operations locales
- la supervision runtime
- la coordination future avec `notifications`
- l escalation
- les enquetes forensiques

## Responsabilites

Le module est proprietaire de :
- `EtatSysteme`
- `EtatComposant`
- `EtatDependance`
- `EtatRuntime`
- `Alerte`
- `IncidentSysteme`
- `DiagnosticIncident`
- `TraceOperation`
- `SignalSysteme`
- `CapaciteSysteme`
- `Saturation`
- `EnqueteForensique`
- `TableauBordMonitoring`

Il prend en charge :
- la sante systeme
- la sante composants
- la sante dependances
- la collecte de metriques techniques
- la collecte de metriques metier
- le calcul d alertes
- l escalade d incidents
- la production de diagnostics
- la correlation de traces
- la consolidation d observabilite
- la retention locale
- le support operational du module

## Limites

Le module ne possede jamais :
- `auth`
- `security`
- `audit`
- `notifications`
- `configuration`
- `referentiel-academique`
- `scolarite-eleves`
- `paiements-facturation`
- `bulletins-evaluations`
- `sync`

Il ne doit jamais :
- reimplementer leur metier
- importer leurs agregats comme source de verite
- acceder directement a leurs bases
- contourner leurs ports applicatifs
- devenir un "god module" transverse qui aspire toute la plateforme

Monitoring observe ces modules.
Il ne les remplace pas.

## Sante Systeme

Le module couvre plusieurs niveaux de sante :
- sante globale du systeme
- sante par composant
- sante des dependances
- sante du runtime de supervision

Principes :
- une degradation locale doit pouvoir etre visible sans attendre une panne totale
- une dependance critique doit remonter dans la vue globale
- l etat runtime doit rester observable separement de l etat metier
- la vue de sante doit rester consolidable en snapshot

Les niveaux principaux sont :
- `HEALTHY`
- `DEGRADED`
- `CRITICAL`
- `UNKNOWN`

## Metriques

Le module distingue :
- metriques metier
- metriques techniques
- mesures de capacite
- mesures de saturation

Exemples de signaux vises :
- latence API
- taux d erreur
- retard de file
- nombre d incidents
- volume de traces
- consommation de ressources
- derive de capacite

Regles :
- une metrique doit avoir une unite
- une metrique doit avoir un horodatage
- une metrique doit rester correlable a un contexte
- les agregations doivent rester explicables

## Alertes

Le module gere :
- le declenchement
- la resolution
- la suppression logique
- l escalation

Une alerte doit porter au minimum :
- un identifiant
- un indicateur
- une gravite
- un statut
- un message
- un seuil
- une valeur observee
- un contexte
- une correlation

Invariants :
- pas d alerte sans seuil ou justification
- pas d alerte cross-tenant
- pas d escalation sans incident coheremment rattache
- pas de gravite critique silencieuse dans les vues de supervision

## Incidents Et Diagnostics

Le module suit le cycle de vie des incidents :
- detection
- investigation
- mitigation / escalation
- resolution

Un incident peut agreger :
- plusieurs alertes
- plusieurs diagnostics
- plusieurs traces correlees
- plusieurs evenements systeme

Le diagnostic doit produire :
- un resume
- des causes probables
- des recommandations
- un niveau de severite
- une correlation exploitable

## Tracing

Le module couvre :
- capture de traces
- correlation des traces
- sampling runtime
- relecture de traces

Types de traces supportes :
- `REQUEST`
- `JOB`
- `EVENT`
- `DIAGNOSTIC`
- `FORENSIC`

Objectifs :
- comprendre un chemin d execution
- rattacher un symptome a un incident
- preparer une analyse forensic
- rendre les flux runtime explicables

## Observabilite

L observabilite consolidee doit rendre visible :
- l etat systeme
- les alertes actives
- les incidents ouverts
- les diagnostics disponibles
- les traces recentes
- les capacites
- les saturations

Le module expose notamment :
- des snapshots runtime
- un tableau de bord Monitoring
- des vues de signaux
- des vues de forensic

## Forensic

Le module est explicitement forensic-aware.

Cela implique :
- des correlations stables
- des traces reconsultables
- des evenements de securite historisables
- des diagnostics relisibles
- une retention distincte pour les donnees forensic

Le but n est pas seulement de "voir rouge".
Le but est aussi de comprendre apres coup :
- ce qui s est passe
- dans quel ordre
- sous quelle correlation
- avec quels impacts probables

## Capacity Planning

Le module doit preparer la plateforme a observer :
- sa marge disponible
- ses goulets
- sa saturation
- ses zones de risque

Les objets `CapaciteSysteme` et `Saturation` existent pour cela.

On ne cherche pas seulement a mesurer l etat courant.
On cherche aussi a rendre visible :
- la tendance
- le point de rupture probable
- le besoin d action avant incident

## Multi-Tenant

Le module est strictement `tenant-aware`.

Contraintes fortes :
- pas de melange cross-tenant
- pas de correlation abusive entre organisations non compatibles
- pas de vue incident/alerte exposee hors de son contexte autorise
- pas de fuite forensic entre tenants

Le `ContexteMonitoring` reste une frontiere de securite et de lisibilite.

## Integrations

Le module collabore avec :
- `audit`
- `auth`
- `security`
- `notifications`
- `configuration`
- `referentiel-academique`
- `scolarite-eleves`
- `paiements-facturation`
- `bulletins-evaluations`
- `sync`

Regles d architecture :
- adapters
- mappers
- listeners
- publishers
- anti-corruption layers
- orchestrators

Jamais :
- acces DB direct cross-module
- couplage fort a des agregats externes
- duplication de metier externe

## Runtime

Le runtime du module vit dans `runtime/`.

Il couvre :
- `health`
- `diagnostics`
- `alerts`
- `capacity`
- `tracing`
- `observability`
- `coordinators`
- `registry`
- `bootstrap`

Le runtime doit :
- superviser
- coordonner
- consolider
- produire des snapshots
- rester pilotable localement

Il ne doit pas :
- redevenir une couche metier
- dupliquer `application`
- dupliquer `infrastructure`

## Workers

Les workers du module vivent dans `workers/`.

Ils couvrent :
- health
- alerts
- diagnostics
- capacity
- observability
- tracing
- retention

Leur role :
- executer des traitements specialises
- appeler le runtime ou les use cases adaptes
- rester fins
- rester sans etat metier profond

## Structure

- `domain` : agregats, entites, value objects, policies, services, specifications
- `application` : use cases, commands, queries, DTO, ports, validateurs, orchestrateurs
- `infrastructure` : persistence, repositories, collecteurs, observability, cache, schedulers, runtime technique
- `interfaces` : controllers, routes, validateurs HTTP, presenters, contrats et DTO exposes
- `integration` : ponts vers audit, auth, security, notifications, configuration, BC metier et sync
- `runtime` : coordination d execution continue et supervision locale
- `workers` : executions specialisees du module
- `tests` : validation transverse du module
- `operational` : bootstrap, health-checks, diagnostics, retention, manifests, support, scripts

Le repo conserve volontairement `integration/` au singulier pour respecter l existant, meme si le document parle de `integrations/`.

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
- import d agregats externes comme dependances de travail
- bypass des ports applicatifs
- dependances circulaires non controlees
- logique metier des autres BC dans Monitoring

## Tests

La cible documentaire du module couvre :
- domaine
- application
- infrastructure
- interfaces
- integrations
- runtime
- multi-tenant
- resilience
- observability
- tracing
- forensic

Le noyau actuellement pose couvre deja des preuves reelles sur :
- etat systeme
- incident systeme
- use cases de sante et d alerte
- repositories memoire
- runtime health
- worker alerts
- integration configuration
- isolation tenant
- correlation de traces
- forensic security

## Operational

Le support local du module vit dans `operational/`.

Il couvre :
- bootstrap
- health-checks
- diagnostics
- retention
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
- noyau de tests Monitoring : present et executable

## Frontiere Fondamentale

`Monitoring` observe, corrige la visibilite et diagnostique.

`Monitoring` ne possede pas le metier des autres modules.

Sa responsabilite est de rendre la plateforme :
- lisible
- supervisable
- expliquable
- operable

dans des frontieres DDD et Clean Architecture strictes.
