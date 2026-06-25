# Phase 47 - Plan Implementation Lot 1 Shell

## Statut

Ce document ouvre le plan d'implementation officiel du `Lot 1` frontend EduSync.

Il ne cree :

- aucun nouveau workflow
- aucun nouvel acteur
- aucune nouvelle permission
- aucune nouvelle route backend
- aucun nouveau contrat d'ecran

Il transforme en plan d'execution technique ce qui est deja fige dans :

- la doctrine frontend
- la navigation
- les pages et routes
- les vues
- les composants
- les contrats d'ecran
- les maquettes shell

La suite naturelle de cette phase est l'implementation des premiers ecrans pilotes metier a partir du shell stabilise.

## Objectif

Le `Lot 1` doit poser le socle d'experience commun du frontend EduSync pour :

- le web desktop
- le web mobile
- la future PWA
- la future enveloppe Capacitor

Le `Lot 1` ne doit pas chercher a "finir le frontend".

Il doit seulement stabiliser :

- l'architecture d'execution
- le shell global
- le routage principal
- la navigation visible
- le contexte actif
- les gardes d'acces visibles
- les composants UI transverses de base

## Sources De Verite

Cette phase s'appuie exclusivement sur :

- [00-doctrine-frontend.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/00-doctrine-frontend.md)
- [15-navigation-frontend.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/15-navigation-frontend.md)
- [16-navigation-par-acteur.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/16-navigation-par-acteur.md)
- [17-navigation-par-module.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/17-navigation-par-module.md)
- [18-pages-et-routes-frontend.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/18-pages-et-routes-frontend.md)
- [19-vues-frontend.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/19-vues-frontend.md)
- [20-composants-ui.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/20-composants-ui.md)
- [21-contrats-ecran.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/21-contrats-ecran.md)
- [31-synthese-contrats-ecran.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/31-synthese-contrats-ecran.md)
- [32-maquettes-shell-global.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/32-maquettes-shell-global.md)

Le frontend existant actuel sert de base technique de depart, mais non de doctrine cible.

## Lecture CTO Du Frontend Actuel

Le depot `frontend/` contient deja un socle Vue/Vite exploitable :

- [frontend/package.json](/C:/Users/MON%20PC/Documents/EducSyn/frontend/package.json)
- [frontend/vite.config.ts](/C:/Users/MON%20PC/Documents/EducSyn/frontend/vite.config.ts)
- [frontend/src/main.ts](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/main.ts)
- [frontend/src/App.vue](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/App.vue)
- [frontend/src/router/index.ts](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/router/index.ts)

Le depot contient aussi :

- une premiere base de services transverses
- une base de stores
- une base de styles
- un lot `referentiel` deja structure
- une couche `offline` deja ouverte

Cependant, le frontend actuel ne doit pas etre pris comme architecture finale globale.

Le point de convergence cible n'est pas :

- un layout par acteur
- une duplication de structures par role
- une simple extension du module `referentiel`

Le point de convergence cible est :

- un shell commun
- une navigation pilotee par capacites visibles
- un contexte actif transverse
- des domaines modules coherents avec la doctrine frontend

## Resultat Attendu Du Lot 1

A la fin du `Lot 1`, le projet frontend doit fournir :

- un shell desktop reel
- un shell mobile reel
- un routeur principal stabilise
- une navigation par module compatible avec les acteurs documentes
- un composant de changement de contexte actif
- une garde visible d'acces UI
- des vues racines par module
- un socle de composants UI transverses reutilisable

Le `Lot 1` doit permettre d'ouvrir ensuite sans hesitation :

- `SCR-PF-001`
- `SCR-PED-001`
- `SCR-SCO-001`

## Architecture Cible Du Lot 1

La structure cible de `frontend/src/` devient :

- `app/`
- `router/`
- `shell/`
- `shared/ui/`
- `shared/layout/`
- `shared/navigation/`
- `shared/auth/`
- `shared/permissions/`
- `shared/session/`
- `shared/http/`
- `shared/pwa/`
- `domains/finances/`
- `domains/pedagogique/`
- `domains/scolarite/`
- `domains/academique/`
- `domains/monitoring/`
- `domains/audit/`
- `domains/configuration/`
- `domains/notifications/`
- `domains/security/`

Cette structure reste coherente avec la doctrine modulaire de [00-doctrine-frontend.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/00-doctrine-frontend.md).

## Fichiers Cibles Du Lot 1

Les fichiers de base a viser sont :

- `frontend/src/app/main.ts`
- `frontend/src/app/AppRoot.vue`
- `frontend/src/router/index.ts`
- `frontend/src/router/routes.ts`
- `frontend/src/router/guards.ts`
- `frontend/src/shell/AppShellSwitcher.vue`
- `frontend/src/shell/AppShellDesktop.vue`
- `frontend/src/shell/AppShellMobile.vue`
- `frontend/src/shell/components/AppSidebar.vue`
- `frontend/src/shell/components/AppTopbar.vue`
- `frontend/src/shell/components/AppDrawerMobile.vue`
- `frontend/src/shell/components/ContextSwitcher.vue`
- `frontend/src/shell/components/ModuleQuickAccess.vue`
- `frontend/src/shell/components/UserMenu.vue`
- `frontend/src/shared/layout/PageContainer.vue`
- `frontend/src/shared/layout/PageHeader.vue`
- `frontend/src/shared/layout/SectionBlock.vue`
- `frontend/src/shared/ui/EmptyState.vue`
- `frontend/src/shared/ui/LoadingState.vue`
- `frontend/src/shared/ui/ErrorState.vue`
- `frontend/src/shared/ui/StatChip.vue`
- `frontend/src/shared/ui/ContextBadge.vue`
- `frontend/src/shared/ui/PermissionTag.vue`
- `frontend/src/shared/navigation/navigation.types.ts`
- `frontend/src/shared/navigation/navigation.config.ts`
- `frontend/src/shared/navigation/navigation.builder.ts`
- `frontend/src/shared/auth/session.store.ts`
- `frontend/src/shared/permissions/ability.types.ts`
- `frontend/src/shared/permissions/ability.store.ts`
- `frontend/src/shared/permissions/AccessBoundary.vue`
- `frontend/src/shared/session/active-context.store.ts`
- `frontend/src/shared/http/api.client.ts`
- `frontend/src/shared/pwa/register-sw.ts`
- `frontend/src/domains/finances/routes.ts`
- `frontend/src/domains/pedagogique/routes.ts`
- `frontend/src/domains/scolarite/routes.ts`
- `frontend/src/domains/academique/routes.ts`
- `frontend/src/domains/monitoring/routes.ts`
- `frontend/src/domains/audit/routes.ts`
- `frontend/src/domains/configuration/routes.ts`
- `frontend/src/domains/notifications/routes.ts`
- `frontend/src/domains/security/routes.ts`
- `frontend/src/domains/*/views/ModuleHomeView.vue`

## Ce Qu'il Faut Garder Du Frontend Actuel

Les elements suivants peuvent etre conserves puis reclasses :

- [frontend/src/services/api.ts](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/services/api.ts)
- [frontend/src/services/auth.service.ts](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/services/auth.service.ts)
- [frontend/src/services/tenancy.service.ts](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/services/tenancy.service.ts)
- [frontend/src/store/auth.store.ts](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/store/auth.store.ts)
- [frontend/src/store/tenant.store.ts](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/store/tenant.store.ts)
- [frontend/src/store/ui.store.ts](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/store/ui.store.ts)
- [frontend/src/styles/variables.css](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/styles/variables.css)
- [frontend/src/styles/base.css](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/styles/base.css)
- [frontend/src/styles/layout.css](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/styles/layout.css)

Ces fichiers ne doivent pas forcer l'architecture finale.

Ils doivent seulement accelerer l'implementation du socle.

## Ce Qu'il Faut Deprecier Comme Patron

Les elements suivants ne doivent pas devenir la norme d'architecture globale :

- [frontend/src/layouts/LayoutAdmin.vue](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/layouts/LayoutAdmin.vue)
- [frontend/src/layouts/LayoutParent.vue](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/layouts/LayoutParent.vue)
- [frontend/src/layouts/LayoutTitulaire.vue](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/layouts/LayoutTitulaire.vue)
- la structure `frontend/src/modules/referentiel/*` comme modele unique de tous les domaines

La logique cible est :

- un shell principal
- puis des variations d'experience par contexte
- et non des applications parallèles par acteur

## Routes A Poser Dans Le Lot 1

Le `Lot 1` doit stabiliser les routes racines suivantes :

- `/connexion`
- `/app`
- `/app/finances`
- `/app/pedagogique`
- `/app/scolarite`
- `/app/academique`
- `/app/monitoring`
- `/app/audit`
- `/app/configuration`
- `/app/notifications`
- `/app/security`

Ces routes doivent suivre les regles de [18-pages-et-routes-frontend.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/18-pages-et-routes-frontend.md).

## Composants UI Minimum A Sortir

Le `Lot 1` doit sortir au minimum :

- `AppSidebar`
- `AppTopbar`
- `AppDrawerMobile`
- `PageContainer`
- `PageHeader`
- `SectionBlock`
- `EmptyState`
- `LoadingState`
- `ErrorState`
- `StatChip`
- `ContextBadge`
- `PermissionTag`
- `ActionBar` si utile dans le shell

Leur style doit rester aligne sur :

- [20-composants-ui.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/20-composants-ui.md)
- [32-maquettes-shell-global.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/32-maquettes-shell-global.md)

## Ecrans Techniques Du Lot 1

Le `Lot 1` doit materialiser les briques suivantes.

### 1. `AppShellDesktop`

Role :

- sidebar principale
- topbar de contexte
- zone de contenu
- zone d'actions globales

### 2. `AppShellMobile`

Role :

- header mobile
- navigation compacte
- drawer ou panneau lateral mobile
- logique propre au mobile

Le shell mobile ne doit pas etre une simple reduction du desktop.

### 3. `ContextSwitcher`

Role :

- changer d'ecole active
- changer d'annee scolaire active
- reconstituer la navigation visible

### 4. `AccessBoundary`

Role :

- masquer les blocs UI non accessibles
- exprimer la lecture frontend de `permission + perimetre`

Il ne remplace jamais la securite backend.

### 5. `ModuleHomeView`

Role :

- servir de racine visible par domaine
- offrir un point d'entree stable tant que les vues metier profondes ne sont pas encore branchees

## Etapes D'Implementation Recommandees

### Etape 1

Stabiliser l'entree applicative :

- refondre `main.ts`
- introduire `AppRoot.vue`
- centraliser le montage du routeur

### Etape 2

Stabiliser le routage :

- creer `routes.ts`
- creer `guards.ts`
- poser les routes racines modules

### Etape 3

Construire le shell :

- `AppShellSwitcher`
- `AppShellDesktop`
- `AppShellMobile`
- composants shell associes

### Etape 4

Construire la navigation :

- `navigation.types.ts`
- `navigation.config.ts`
- `navigation.builder.ts`

### Etape 5

Stabiliser le contexte et les permissions visibles :

- `session.store.ts`
- `active-context.store.ts`
- `ability.store.ts`
- `AccessBoundary.vue`

### Etape 6

Sortir les composants UI transverses de base :

- layouts communs
- etats vides/chargement/erreur
- badges et chips de contexte

### Etape 7

Brancher des vues racines minimales par domaine :

- `ModuleHomeView.vue`
- tests de navigation de base

## Ce Que Le Lot 1 Ne Doit Pas Faire

Le `Lot 1` ne doit pas :

- implementer toute la logique finances
- implementer toute la logique pedagogique
- brancher tous les tableaux analytiques
- refaire le moteur PDF
- inventer une logique metier offline profonde
- imposer Capacitor avant stabilisation du shell web

## Definition De Fini

Le `Lot 1` sera considere comme termine lorsque :

- l'application Vue charge un shell desktop et mobile coerents
- les routes racines modules sont en place
- la navigation varie selon les capacites visibles
- le contexte actif est present dans l'UI
- des vues racines de module sont accessibles
- les composants UI transverses de base existent
- le frontend est pret a ouvrir `SCR-PF-001`, `SCR-PED-001` et `SCR-SCO-001`

## Verdict

Le `Lot 1` peut maintenant etre implemente sans invention produit supplementaire.

La doctrine, les routes, les vues, les contrats et les maquettes necessaires existent deja.

Le travail restant est un travail d'execution technique disciplinee, et non un travail de reinvention fonctionnelle.
