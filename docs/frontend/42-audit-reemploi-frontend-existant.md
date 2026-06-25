# Phase 42 - Audit De Reemploi Du Frontend Existant

## Statut

Ce document audite le frontend Vue existant deja present dans le projet.

Il ne :

- reouvre aucun workflow
- ne cree aucune nouvelle regle metier
- ne remplace pas les doctrines frontend deja figees

Il sert uniquement a determiner ce qui peut etre reutilise intelligemment pour la future implementation.

## Objectif

Eviter deux erreurs couteuses :

- jeter un frontend qui contient deja de bons actifs
- reutiliser tel quel un frontend qui ne respecte pas encore la doctrine officielle EduSync

La question traitee ici est simple :

- que garder
- que refactorer
- que ne pas reconduire

## Sources De Verite

Cet audit s'appuie sur :

- [31-synthese-contrats-ecran.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/31-synthese-contrats-ecran.md)
- [32-maquettes-shell-global.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/32-maquettes-shell-global.md)
- [33-maquettes-finances.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/33-maquettes-finances.md)
- [34-maquettes-pedagogiques.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/34-maquettes-pedagogiques.md)
- [35-maquettes-scolarite.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/35-maquettes-scolarite.md)
- le frontend existant dans `frontend/src/*`

## Verdict Global

Le frontend actuel n'est pas a jeter.

Il contient :

- une base visuelle serieuse
- un langage graphique professionnel
- de vrais patterns de pages utiles
- quelques integrations backend deja reelles

Mais il n'est pas encore conforme tel quel a la doctrine frontend figee, car il reste :

- trop centre sur `referentiel`
- trop statique dans son shell
- trop faible sur la projection `permission + perimetre`
- incomplet pour le produit EduSync multi-domaines

La bonne lecture CTO est donc :

- frontend existant = base de reemploi
- pas frontend final
- pas rebut

## A Garder

### 1. La direction visuelle generale

Le socle visuel actuel est de bonne qualite pour EduSync :

- palette institutionnelle
- bon contraste
- navigation laterale solide
- surfaces propres
- cartes et tableaux lisibles

Preuves :

- [variables.css](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/styles/variables.css#L1)
- [layout.css](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/styles/layout.css#L1)

Lecture CTO :

- la direction visuelle peut devenir la base du vrai design system EduSync

### 2. Le socle technique Vue

Le projet frontend existe vraiment et repose deja sur une base moderne acceptable :

- `Vue 3`
- `Vite`
- `vue-router`
- typage TypeScript

Preuve :

- [package.json](/C:/Users/MON%20PC/Documents/EducSyn/frontend/package.json#L1)

Lecture CTO :

- il n'y a aucun besoin de recreer un frontend depuis zero juste pour changer d'ossature

### 3. Certains patterns de pages metier deja bien construits

Certaines pages ne sont pas de simples maquettes visuelles. Elles portent deja :

- appels API reels
- pagination
- modales de confirmation
- logique d'idempotence
- relecture detaillee d'entites

Preuves :

- [AnneesScolairesPage.vue](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/modules/referentiel/ecole/pages/annees/AnneesScolairesPage.vue#L1)
- [annees-scolaires.api.ts](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/modules/referentiel/ecole/services/annees-scolaires.api.ts#L87)

Lecture CTO :

- ces patterns doivent etre reutilises comme briques d'implementation, surtout pour les vues denses et les workflows critiques

### 4. Le debut de gestion de contexte ecole

Le frontend a deja une notion de contexte ecole :

- `idEcole`
- `tenantId`
- `idUtilisateur`
- `nomOrganisation`
- `nomEcole`

Preuve :

- [contexte-ecole.store.ts](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/modules/referentiel/ecole/stores/contexte-ecole.store.ts#L1)

Lecture CTO :

- ce n'est pas suffisant en l'etat, mais c'est une bonne base conceptuelle a industrialiser

## A Refactorer

### 1. Le shell principal

Le shell actuel est beau mais statique.

Problemes constates :

- menu code en dur
- contexte code en dur
- utilisateur affiche en dur
- absence de recomposition par acteur

Preuve :

- [LayoutAdmin.vue](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/layouts/LayoutAdmin.vue#L23)

Correction cible :

- transformer `LayoutAdmin` en vrai `AppShell`
- navigation pilotee par configuration
- contexte pilote par session et perimetre reel
- menus derives de `permission + perimetre + modules actifs`

### 2. Le routeur global

Le routeur racine reste borne au seul domaine `referentiel`.

Preuves :

- [index.ts](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/router/index.ts#L1)
- [referentiel.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/modules/referentiel/routes/referentiel.routes.ts)

Correction cible :

- passer d'un routeur de prototype a un routeur produit
- organiser par modules reels :
  - finances
  - pedagogique
  - scolarite
  - academique
  - audit
  - monitoring
  - configuration
  - notifications
  - security

### 3. Les stores globaux

Les stores globaux sont actuellement trop faibles pour porter le vrai produit.

Preuves :

- [auth.store.ts](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/store/auth.store.ts#L1)
- [tenant.store.ts](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/store/tenant.store.ts#L1)
- [ui.store.ts](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/store/ui.store.ts)

Correction cible :

- vrai store session
- vrai store contexte actif
- vrai store modules actifs
- vrai store navigation visible
- projection frontend des permissions effectives

### 4. Les pages tableau de bord qui inventent encore localement des etats

Certaines vues utilisent encore des donnees locales de presentation qui ne doivent pas devenir la source de verite metier.

Preuve :

- [TableauBordReferentielPage.vue](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/modules/referentiel/ecole/pages/TableauBordReferentielPage.vue#L21)

Correction cible :

- conserver le style
- supprimer l'invention locale de verite
- brancher les ecrans sur les contrats et sources backend reels

### 5. La base responsive

Le frontend actuel n'est pas encore un vrai socle web-mobile exploitable, car la base force un minimum de largeur.

Preuve :

- [base.css](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/styles/base.css#L6)

Correction cible :

- rendre le shell et les pages compatibles mobile
- ne plus imposer un socle desktop rigide

## A Abandonner

### 1. Le shell code en dur par domaine unique

Il ne faut pas reconduire tel quel :

- le menu fixe `Referentiel ecole`
- les labels de contexte statiques
- l'avatar et le profil de demonstration

Preuve :

- [LayoutAdmin.vue](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/layouts/LayoutAdmin.vue#L31)

### 2. La logique de frontend monodomaine

Il ne faut pas perpetuer une structure ou le produit semble commencer et finir dans `referentiel`.

Preuves :

- [index.ts](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/router/index.ts#L5)
- [referentiel-ecole.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/modules/referentiel/ecole/routes/referentiel-ecole.routes.ts#L11)

### 3. Les pseudo-stores symboliques

Les objets minimaux `authStore`, `tenantStore`, `uiStore` ne doivent pas etre etendus a l'infini.

Ils doivent etre remplaces par une vraie architecture d'etat.

Preuves :

- [auth.store.ts](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/store/auth.store.ts#L1)
- [tenant.store.ts](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/store/tenant.store.ts#L1)

## Strategie De Reemploi Recommandee

La trajectoire la plus propre est la suivante :

### Etape 1

Garder le frontend existant comme banque d'actifs :

- styles
- composants transverses utiles
- patterns de tableaux
- modales
- pages referentiel les plus serieuses

### Etape 2

Refondre le coeur de structure :

- shell
- routing
- session
- contexte actif
- projection des droits

### Etape 3

Rebrancher les modules prioritaires selon les maquettes figees :

- finances
- pedagogique
- scolarite

### Etape 4

Etendre ensuite aux autres domaines et aux usages mobiles utiles.

## Ordre CTO Recommande

L'ordre le plus sain n'est pas :

- tout effacer
- ni continuer a empiler des pages sur le prototype actuel

L'ordre le plus sain est :

1. figer l'audit de reemploi
2. definir l'architecture frontend cible Vue
3. transformer le shell existant en shell doctrinal
4. reimplementer les ecrans pilotes a partir des maquettes figees
5. reutiliser progressivement les bons actifs visuels et techniques

## Verdict Final

Le frontend existant EduSync est :

- reutilisable : oui
- conforme tel quel a la doctrine actuelle : non
- digne d'etre conserve comme base de reemploi : oui
- suffisant comme frontend final sans refonte structurelle : non

La bonne decision est donc :

- conserver le capital deja produit
- refactorer la structure
- ne pas repartir de zero

