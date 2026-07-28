# Doctrine Frontend EduSync

## Statut

Ce document est la doctrine officielle d'architecture frontend d'EduSync.

Il constitue la source de verite frontend de reference pour toutes les phases suivantes :

- acteurs
- permissions effectives
- cas d'usage
- workflows
- navigation
- pages
- dashboards
- contrats d'ecran
- temps reel
- notifications
- configuration visible cote UI

Les phases de formalisation deja ouvertes sont notamment :

- [04-workflows.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/04-workflows.md)
- [05-workflows-reels.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/05-workflows-reels.md)
- [14-cartographie-finale-workflows.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/14-cartographie-finale-workflows.md)
- [15-navigation-frontend.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/15-navigation-frontend.md)

Toute decision frontend future doit rester coherente avec cette doctrine, ou bien la mettre a jour explicitement.

## Positionnement General

Le frontend EduSync est une application :

- modulaire par domaine
- orientee bounded contexts cote experience
- gouvernee transversalement par le contexte actif et les permissions effectives
- organisee selon MVVM au niveau des ecrans et des features
- appuyee sur un socle transverse fort
- separee d'une infrastructure technique dediee
- separee d'un design system dedie
- reliee a un backend qui reste la source officielle de verite metier

Le frontend n'est pas l'autorite metier du systeme.

Le frontend porte :

- la composition de l'experience
- l'orchestration de presentation
- les parcours utilisateurs
- les etats d'ecran
- les contrats de donnees orientes usage
- le contexte actif
- les permissions effectives cote UI

Le backend porte :

- la verite metier
- les validations metier
- les decisions metier
- les invariants metier
- la coherence tenant / organisation / ecole
- les permissions metier reelles
- les acteurs derives reels

## Blocs Officiels

Les blocs structurants officiels du frontend sont :

- `app`
- `modules`
- `shared`
- `infrastructure`
- `design-system`

Chaque bloc a une responsabilite distincte.

## Role de `app`

`app` constitue le noyau d'execution du frontend.

`app` porte :

- le bootstrap
- le router
- les layouts globaux
- les providers globaux
- les guards globaux
- la composition des services transverses
- l'initialisation de la session
- l'initialisation du contexte actif
- la composition des grands flux de navigation

`app` orchestre.

`app` ne doit pas devenir une zone de logique metier ecran par ecran.

## Role de `modules`

`modules` regroupe les domaines fonctionnels visibles du produit.

Un module represente un domaine d'experience frontend aligne avec les grandes capacites du systeme.

Chaque module peut porter :

- des pages
- des vues
- des viewmodels
- des services UI locaux
- des composants de feature
- des contrats de donnees de feature
- des comportements de presentation specifiques

Un module ne doit jamais recalculer seul :

- le tenant
- l'organisation active
- l'ecole active
- les permissions brutes
- les permissions effectives globales
- la logique de titulariat
- la mecanique realtime transverse
- la mecanique infrastructure

Un module consomme le socle transverse.

## Role de `shared`

`shared` est le socle transverse officiel du frontend.

Il contient les capacites communes consommees par plusieurs modules.

`shared` doit porter explicitement les sous-systemes transverses suivants :

- `auth`
- `active-context`
- `permissions`
- `navigation`
- `notifications`
- `realtime`
- `configuration`
- `api`
- `ui`
- `utils`

Point de doctrine important :

EduSync ne peut pas fonctionner proprement sur la seule notion de session.

Le frontend doit porter explicitement :

- l'identite
- le contexte actif
- les permissions effectives
- les informations d'acteur derive exposees par le backend quand elles sont necessaires a l'experience

## Role de `infrastructure`

`infrastructure` regroupe la mecanique technique du frontend.

Il contient notamment :

- les clients HTTP
- les clients WebSocket / SSE
- la persistance locale
- le cache
- le query layer
- les adaptateurs de transport
- les mecanismes offline
- les mecanismes de rehydratation
- les connecteurs temps reel

`infrastructure` ne porte ni decisions UX, ni decisions metier.

## Role de `design-system`

`design-system` est separe du metier et separe des flux transverses.

Il porte :

- les composants visuels reutilisables
- les primitives UI
- les tokens
- la typographie
- les patterns de formulaires
- les patterns de tables
- les regles responsive
- l'accessibilite

Un composant du design system ne decide jamais :

- si une action est autorisee
- si un scope est valide
- si un message temps reel doit partir
- si une notification peut etre affichee

## Backend Comme Source Officielle de Verite

Le backend est la source officielle de verite metier.

Cela signifie que le frontend :

- ne reconstitue pas seul les etats metier
- ne deduit pas arbitrairement les droits metier
- ne decide pas seul les transitions metier
- ne recompose pas les acteurs derives a partir de conventions locales
- ne devient jamais un mini-backend

Le frontend peut :

- transformer des donnees pour l'usage UI
- mettre en forme
- agreger de la presentation
- sequencer l'experience utilisateur
- memoriser des etats de navigation ou de saisie

Le frontend ne peut pas :

- reinventer la verite metier
- interpreter librement des etats backend ambigus
- recalculer seul la logique de titulariat
- reconstruire seul les permissions reelles

## Architecture Modulaire

L'architecture globale d'EduSync frontend est modulaire par domaine.

Le projet n'est pas organise principalement :

- par couche technique pure
- ni par type de fichier uniquement
- ni par composants generiques sans frontiere domaine

Le domaine reste l'axe de structuration principal.

Consequences :

- les ecrans d'un meme domaine restent proches
- les services UI d'un meme domaine restent proches
- les contrats d'ecran d'un meme domaine restent proches
- les dependances transverses sont explicites

## MVVM Uniquement au Niveau des Ecrans et Features

MVVM est valide uniquement comme pattern d'organisation de la presentation.

Il n'est pas l'architecture globale du projet.

La chaine officielle est :

`View`
-> `ViewModel`
-> `UI Service`
-> `Repository / API Client`
-> `Backend`

### Role de `View`

La vue :

- affiche
- declenche les interactions utilisateur
- delegue l'etat et les comportements au ViewModel

### Role du `ViewModel`

Le ViewModel :

- porte l'etat d'ecran
- expose les comportements de presentation
- prepare les donnees pour l'affichage
- orchestre les intentions UI

Le ViewModel n'est pas autorise a dialoguer directement avec :

- HTTP
- WebSocket
- LocalStorage
- Dexie
- Realtime
- infrastructure technique brute

### Role du `UI Service`

Le UI Service :

- orchestre un usage d'ecran ou de feature
- coordonne les appels necessaires
- transforme les reponses backend en structures utiles a la presentation
- centralise les comportements frontend plus riches qu'une simple action de composant

Le UI Service ne doit pas devenir une couche de logique metier backend deplacee dans le frontend.

### Role des `Repository / API Client`

Les repositories et API clients :

- dialoguent avec le backend
- encapsulent les details de transport
- appliquent les conventions d'appel
- isolent les details techniques du ViewModel

## Active Context Comme Pilier Central

EduSync est hierarchique et multi-tenant.

Le frontend doit donc porter explicitement un `Active Context`.

Le contexte actif represente la position courante de l'utilisateur dans le systeme, notamment :

- plateforme active
- organisation active
- ecole active
- annee scolaire active
- utilisateur courant
- scope courant
- permissions effectives
- capacites UI effectives
- modules effectivement disponibles

Le contexte actif pilote :

- navigation
- menus
- dashboards
- visibilite de certaines actions
- resolution de certains ecrans
- restrictions de perimetre

Le frontend ne doit pas disperser cette logique entre :

- router
- auth
- composants
- modules metier
- pages
- menus

Le contexte actif doit etre centralise dans `shared/active-context`.

## Distinction Officielle Entre `auth`, `active-context` et `permissions`

Ces trois blocs sont lies mais distincts.

`auth` repond a :

- qui est connecte ?

`active-context` repond a :

- ou agit-il actuellement ?

`permissions` repond a :

- que peut-il faire ici et maintenant ?

Cette separation est obligatoire.

## Permissions Effectives

Le frontend ne doit pas consommer des permissions brutes comme pivot UX principal.

Il doit consommer des permissions effectives, c'est-a-dire des capacites deja contextualisees par :

- la session
- le contexte actif
- les affectations
- les restrictions
- la portee reelle
- les policies metier
- les acteurs derives exposes par le backend

Une permission effective est une permission reellement mobilisable dans le contexte courant.

Le frontend privilegie donc :

- la capacite effective
- le droit effectif dans le scope courant

et jamais :

- le role brut seul
- la permission brute seule

## Projection Unique Des Capacites Effectives

Le frontend consomme une projection authentifiee unique produite par le backend pour la session et le contexte courants.

Cette projection porte au minimum :

- l'identite et l'etat du compte
- l'etat de la session
- les acteurs disponibles et l'acteur actif
- les permissions effectives de l'acteur actif
- les scopes autorises
- les restrictions applicables
- le niveau de gouvernance
- l'organisation, l'ecole et l'annee scolaire actives
- les modules effectivement disponibles
- les capacites metier derivees, dont le titulariat effectif

La chaine officielle est :

`session authentifiee`
-> `projection backend des capacites effectives`
-> `resolver frontend unique`
-> `modules`
-> `menus`
-> `routes`
-> `composants`
-> `actions`
-> `appels API`

Le frontend ne fabrique jamais une projection de secours a partir d'un role visible, d'un profil de demonstration ou d'une permission stockee localement. Une projection absente, invalide ou obsolete ferme les acces jusqu'a sa relecture.

Lorsque plusieurs roles sont disponibles, les permissions de tous les roles ne sont jamais fusionnees. Seules les permissions, restrictions et scopes de l'acteur actif dans le contexte courant alimentent la projection.

## Doctrine Officielle du Titulariat

Le titulariat fait partie de la doctrine frontend officielle, parce qu'il change directement :

- la lecture des acteurs
- la lecture des permissions effectives
- la lecture des cas d'usage
- la visibilite de certaines actions

### Regle Metier Officielle

`ENSEIGNANT` est le seul role pedagogique de base.

`TITULAIRE` n'est pas un role securite autonome.

`TITULAIRE` est un acteur metier effectif derive.

### Derivation Officielle par Niveau d'Enseignement

Pour le frontend, la verite officielle backend est maintenant la suivante :

- `Maternelle` :
  - `ENSEIGNANT responsable de classe`
  - = `TITULAIRE` effectif
- `Primaire` :
  - `ENSEIGNANT responsable de classe`
  - = `TITULAIRE` effectif
- `Secondaire` :
  - `ENSEIGNANT responsable de classe`
  - + `AffectationTitulariat` active et scoped
  - = `TITULAIRE` effectif

### Regle de Consommation Frontend

Le frontend ne doit pas recalculer seul cette doctrine.

Le frontend ne doit pas deduire localement :

- qu'un enseignant primaire serait titulaire par convention
- qu'un enseignant secondaire serait titulaire a partir d'indices partiels

Le frontend doit consommer la verite exposee par le backend sous forme de :

- permissions effectives
- capacites effectives
- et, si necessaire dans les contrats, informations d'acteur derive ou de source de titulariat effectif

### Consequence de Modelisation UI

Le frontend peut afficher ou raisonner en termes de `TITULAIRE` comme acteur d'experience.

Mais il ne doit jamais modeliser `TITULAIRE` comme :

- un role brut autonome
- un code role de base
- une branche de permissions recalculee en local

## Menus

Les menus dependent toujours de :

- la session
- le contexte actif
- les permissions effectives

Ils ne dependent jamais d'un role brut seul.

Dans le cas du titulariat, cela signifie qu'un menu ou une action specifique titulaire :

- ne doit pas etre affiche a partir du seul role `ENSEIGNANT`
- ne doit pas etre affiche a partir d'une simple hypothese sur la section
- doit etre affiche uniquement lorsque la projection authentifiee confirme le titulariat sur la classe et l'annee scolaire concernees

## Regle D'Absence Des Elements Interdits

Un element interdit par l'acteur actif, la permission, le scope, le tenant, le module, une restriction ou l'ownership est absent de l'interface.

Cette regle s'applique aux :

- modules
- menus et sous-menus
- pages et routes
- onglets et cartes
- boutons et actions
- filtres, exports, liens et raccourcis
- appels API associes

Un element peut rester visible mais desactive uniquement lorsque l'acteur est autorise en principe et qu'une condition metier temporaire n'est pas satisfaite. Cette indisponibilite doit alors etre expliquee en langage metier.

Le frontend ne charge pas une donnee interdite pour la masquer ensuite. Le backend reste l'autorite finale pour toute requete, y compris lorsqu'une URL ou une requete est fabriquee manuellement.

## Cycle De Vie Du Contexte Et Des Acces

Tout changement d'utilisateur, de session, d'acteur actif, d'organisation, d'ecole, d'annee scolaire ou de contexte metier constitue une transition atomique.

La transition officielle impose :

1. validation du nouveau contexte par le backend
2. relecture de la projection des capacites effectives
3. invalidation des stores lies a l'ancien contexte
4. annulation des requetes de l'ancien contexte
5. rejet de toute reponse tardive portant une ancienne version de contexte
6. recalcul des modules, menus, routes et actions
7. redirection si la page courante n'est plus autorisee

Aucune donnee de l'ancien tenant ne doit rester visible, meme temporairement. Les options de contexte doivent provenir des contextes reellement autorises par le backend ; aucune organisation, ecole ou annee scolaire de demonstration ne constitue un choix implicite en production.

### Strategie D'Invalidation Des Stores

Chaque store consommant des donnees tenant-aware doit exposer une reinitialisation centralement orchestrable. La purge est obligatoire au logout et lors d'un changement incompatible d'organisation, d'ecole, d'annee ou d'acteur.

Une donnee globale peut etre conservee uniquement si son independance au tenant est explicite et prouvee. A defaut, le comportement est la purge.

Les stores ne choisissent pas individuellement de conserver une ancienne donnee par commodite. L'orchestrateur de cycle de vie applique la transition a tous les domaines concernes.

### Strategie D'Annulation Des Requetes

Chaque requete metier est rattachee a une version monotone du contexte et a un signal d'annulation.

Lors d'une transition :

- les requetes de l'ancienne version sont annulees
- une reponse tardive ne peut plus muter un store
- une nouvelle requete est emise uniquement avec le contexte confirme
- une reprise apres renouvellement de session utilise la nouvelle version de contexte

Cette regle protege notamment le scenario Organisation A vers Organisation B et Ecole A vers Ecole B.

## Workflows

Les workflows ne sont pas encore documentes individuellement ici, mais leur statut architectural est fige :

- ils structurent l'experience
- ils organisent la navigation
- ils gouvernent les enchainements d'ecran
- ils doivent preceder la definition fine des pages

Dans EduSync :

- backend = verite metier
- workflow = verite UX de parcours

## Contrats d'Ecran

Chaque ecran consomme un contrat de donnees :

- explicite
- limite
- oriente usage
- stabilise

Le frontend ne doit pas faire circuler sans controle :

- des agregats backend bruts
- des DTO massifs non contextualises
- des payloads techniques diffuses partout

Cette regle protege :

- la lisibilite
- l'evolutivite
- la stabilite des ecrans

## Regles Architecturales Officielles

### Regle 1

Aucun module metier ne connait directement :

- tenant
- organisation
- ecole
- permissions brutes

Il consomme uniquement `shared/active-context`.

### Regle 2

Aucun ViewModel ne dialogue directement avec :

- HTTP
- WebSocket
- LocalStorage
- Dexie
- Realtime

Chaine obligatoire :

`View`
-> `ViewModel`
-> `UI Service`
-> `Repository / API Client`
-> `Backend`

### Regle 3

Les menus dependent toujours de :

- Session
- ActiveContext
- EffectivePermissions

Jamais d'un role brut seul.

### Regle 4

Les workflows sont la source de verite UX.

Hierarchie officielle :

Cas d'usage
-> Workflows
-> Navigation
-> Pages
-> Composants

### Regle 5

Les permissions UI sont centralisees.

Les pages et composants ne recalculent pas leurs propres regles d'autorisation.

### Regle 6

Le frontend ne reconstitue jamais seul la verite metier.

Le backend reste la source de verite.

### Regle 7

Chaque ecran consomme un contrat de donnees explicite oriente usage.

Il n'y a pas de diffusion incontrolee de payloads backend bruts dans toute l'UI.

### Regle 8

Aucun composant UI ne dialogue directement avec :

- permissions
- realtime
- notifications
- infrastructure

Chaine obligatoire :

`Component`
-> `ViewModel`
-> `UI Service`
-> `Shared / Infrastructure`

## Consequence Pour les Phases Futures

Toutes les prochaines phases frontend devront etre coherentes avec cette doctrine :

- acteurs
- permissions
- cas d'usage
- workflows
- navigation
- pages
- dashboards
- temps reel
- notifications
- contrats UI
- widgets
- layouts

## Conclusion

La doctrine frontend officielle d'EduSync est figee comme suit :

- architecture globale modulaire
- MVVM au niveau des ecrans et features uniquement
- backend comme source officielle de verite metier
- socle transverse fort
- infrastructure technique separee
- design system separe
- active context comme pilier central
- permissions effectives comme pivot de capacite UI
- workflows comme source de verite UX
- contrats d'ecran explicites
- separation stricte entre presentation, orchestration, transport et verite metier
- titulariat traite comme acteur derive backend, jamais comme role brut frontend
