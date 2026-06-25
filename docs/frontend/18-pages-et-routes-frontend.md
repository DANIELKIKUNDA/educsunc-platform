# Phase 18 - Pages Et Routes Frontend

## Statut

Ce document fixe la doctrine officielle de projection des pages et des routes frontend d'EduSync.

Il intervient apres :

- la cartographie finale des workflows
- la navigation frontend
- la navigation par acteur
- la navigation par module

Il intervient avant :

- les vues frontend
- les contrats d'ecran detailles
- les composants UI

Ce document ne dessine encore aucune vue finale.

Il fixe seulement :

- la definition officielle d'une page frontend EduSync
- la definition officielle d'une route frontend EduSync
- les regles de projection workflow -> page -> route
- les types de pages a reconnaitre
- les regles de nommage et de structuration des routes

## Sources De Verite

Cette phase s'appuie exclusivement sur :

- [00-doctrine-frontend.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/00-doctrine-frontend.md)
- [04-workflows.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/04-workflows.md)
- [05-workflows-reels.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/05-workflows-reels.md)
- [14-cartographie-finale-workflows.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/14-cartographie-finale-workflows.md)
- [15-navigation-frontend.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/15-navigation-frontend.md)
- [16-navigation-par-acteur.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/16-navigation-par-acteur.md)
- [17-navigation-par-module.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/17-navigation-par-module.md)
- [06-workflows-academiques.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/06-workflows-academiques.md)
- [07-workflows-pedagogiques.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/07-workflows-pedagogiques.md)
- [08-workflows-scolaires.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/08-workflows-scolaires.md)
- [09-workflows-financiers.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/09-workflows-financiers.md)
- [10-workflows-administration-ecole.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/10-workflows-administration-ecole.md)
- [11-workflows-organisation.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/11-workflows-organisation.md)
- [12-workflows-plateforme.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/12-workflows-plateforme.md)
- [13-workflows-transverses.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/13-workflows-transverses.md)

Le backend reste la source ultime de verite.

## Definition Officielle D'une Page Frontend

Une page frontend EduSync est un point d'entree d'experience qui porte un objectif de lecture, d'action ou de supervision coherent avec un workflow reel.

Une page :

- n'est pas un widget
- n'est pas un composant
- n'est pas une simple route backend
- n'est pas une vue maquette

Une page est :

- un point d'acces d'experience
- un conteneur de contexte utilisateur
- un support de navigation
- un support de chargement et de presentation
- un support d'actions visibles autorisees

## Definition Officielle D'une Route Frontend

Une route frontend EduSync est l'adresse applicative qui ouvre une page dans un contexte donne.

Une route frontend :

- ne prouve pas a elle seule l'autorisation
- ne remplace pas les verifications backend
- ne doit pas etre nommee depuis l'implementation technique backend

Une route frontend doit :

- refleter un objectif metier ou un centre de travail
- rester lisible pour l'equipe produit
- etre stable autant que possible
- rester coherent avec le module, l'acteur et le perimetre

## Chaine Officielle

La chaine officielle devient :

Workflow reel
-> module
-> section
-> page
-> route frontend
-> vue

Cette chaine est obligatoire.

Elle signifie :

- un workflow reel precede la page
- une page precede la vue
- une route frontend doit ouvrir une page justifiee
- la vue viendra seulement apres la phase pages/routes

## Regles Fondatrices

### Regle 1

Une page frontend doit toujours etre rattachee a un workflow reel ou a un centre de travail compose de workflows reels.

### Regle 2

Une route frontend ne doit jamais etre ouverte pour un workflow non fige.

### Regle 3

Une page ne doit jamais melanger plusieurs niveaux de gouvernance sans le declarer explicitement.

### Regle 4

Les routes frontend doivent rester filtrees par :

- activation du module
- permission effective
- perimetre actif
- role ou acteur d'experience

### Regle 5

Une route frontend ne doit pas etre calculee comme simple miroir d'une route HTTP backend.

### Regle 6

Les pages de mutation et les pages de lecture doivent rester distinguees.

### Regle 7

Une route frontend peut porter des parametres de contexte, mais le contexte actif global ne doit pas etre duplique partout inutilement.

### Regle 8

La page doit etre le niveau officiel de projection des etats :

- loading
- vide
- erreur
- interdit
- donnees absentes

### Regle 9

Une page candidate n'est pas encore une vue finale.

### Regle 10

Le nom de la page doit decrire l'intention d'usage, pas un detail technique d'API.

## Les Types Officiels De Pages

EduSync doit reconnaitre les types de pages suivants.

### 1. Page Centre De Travail

Une page qui concentre plusieurs lectures ou actions coherentes.

Exemples :

- centre caissier
- centre titulaire
- centre monitoring

### 2. Page Liste

Une page de consultation d'un ensemble de ressources.

Exemples :

- liste des eleves
- liste des recus
- liste des incidents

### 3. Page Detail

Une page focalisee sur une ressource unique ou un cas cible.

Exemples :

- detail d'un eleve
- detail d'un recu
- situation financiere d'un eleve

### 4. Page Action

Une page orientee vers une mutation ou un traitement.

Exemples :

- enregistrer un paiement
- generer un bulletin
- publier un referentiel

### 5. Page Analyse

Une page orientee lecture analytique et interpretation.

Exemples :

- statistiques de classe
- analyses de resultats
- paiements par type de frais

### 6. Page Parametrage

Une page dediee a la configuration ou a la gouvernance.

Exemples :

- modules ecole
- branding
- runtime plateforme

## Les Trois Niveaux De Routes

Les routes frontend EduSync doivent etre lues en trois niveaux.

### Niveau 1 - Module

Exemples de racines candidates :

- `/academique`
- `/pedagogique`
- `/scolarite`
- `/finances`
- `/administration-ecole`
- `/organisation`
- `/plateforme`
- `/audit`
- `/monitoring`
- `/configuration`
- `/notifications`
- `/security`
- `/moi`

### Niveau 2 - Section

Exemples :

- `/pedagogique/bulletins`
- `/pedagogique/resultats`
- `/scolarite/eleves`
- `/finances/recus`
- `/monitoring/incidents`

### Niveau 3 - Page Metier

Exemples :

- `/pedagogique/bulletins/generer`
- `/scolarite/eleves/:idEleve`
- `/finances/recus/:idRecu`
- `/configuration/ecole/modules`

## Regles De Nommage Des Routes

Les routes frontend doivent :

- utiliser des segments stables
- privilegier les noms metier
- eviter les noms internes d'implementations backend
- eviter les prefixes techniques inutiles

Bonnes pratiques retenues :

- noms au pluriel pour les ressources listables
- verbes seulement pour les pages d'action claires
- segments metier courts et explicites

## Regles De Projection Par Module

### Module `Academique`

Pages candidates typiques :

- publication referentiel
- activation version
- import referentiel
- comparaison versions
- lecture referentiel
- migration referentielle

Routes candidates :

- `/academique/referentiels`
- `/academique/referentiels/publier`
- `/academique/referentiels/activer`
- `/academique/referentiels/importer`
- `/academique/referentiels/comparer`
- `/academique/referentiels/migration`

### Module `Pedagogique`

Pages candidates typiques :

- encodage fiches
- generation bulletins
- generation proclamations
- centre analyses resultats
- classements
- conduite

Routes candidates :

- `/pedagogique/fiches`
- `/pedagogique/bulletins/generer`
- `/pedagogique/proclamations/generer`
- `/pedagogique/resultats`
- `/pedagogique/resultats/analyses`
- `/pedagogique/classements`
- `/pedagogique/conduite`

### Module `Scolarite`

Pages candidates typiques :

- inscription complete
- liste eleves
- detail eleve
- familles
- affectations
- cycle de vie eleve

Routes candidates :

- `/scolarite/inscriptions`
- `/scolarite/eleves`
- `/scolarite/eleves/:idEleve`
- `/scolarite/familles`
- `/scolarite/affectations`
- `/scolarite/parcours`

### Module `Paiements et facturation`

Pages candidates typiques :

- perception
- ouverture / cloture caisse
- caisse du jour
- historique paiements
- situation financiere
- recus
- rapports
- exonerations
- tarification
- parametres de paiement

Routes candidates :

- `/finances/paiements/enregistrer`
- `/finances/caisse`
- `/finances/caisse/ouverture`
- `/finances/caisse/cloture`
- `/finances/historiques`
- `/finances/dettes`
- `/finances/recus`
- `/finances/recus/:idRecu`
- `/finances/rapports`
- `/finances/exonerations`
- `/finances/tarification`
- `/finances/parametres`

### Module `Administration ecole`

Pages candidates typiques :

- lecture administration ecole
- mutation administration ecole

Routes candidates :

- `/administration-ecole`
- `/administration-ecole/ecoles`
- `/administration-ecole/ecoles/:idEcole`

### Module `Organisation`

Pages candidates typiques :

- supervision organisation
- detail organisation
- ecoles de l'organisation

Routes candidates :

- `/organisation`
- `/organisation/ecoles`
- `/organisation/ecoles/:idEcole`
- `/organisation/configuration`

### Module `Plateforme`

Pages candidates typiques :

- referentiel officiel
- publication
- activation
- import
- comparaison

Routes candidates :

- `/plateforme/referentiel`
- `/plateforme/referentiel/publier`
- `/plateforme/referentiel/activer`
- `/plateforme/referentiel/importer`
- `/plateforme/referentiel/comparer`

### Modules Transverses

Routes candidates :

- `/audit/...`
- `/monitoring/...`
- `/configuration/...`
- `/notifications/...`
- `/security/...`
- `/moi/preferences`

Le detail fin sera ouvert par module et par page dans la suite.

## Regles Sur Les Parametres De Route

Les parametres de route frontend doivent etre reserves aux identifiants utiles a la page.

Exemples acceptables :

- `:idEleve`
- `:idRecu`
- `:idEcole`
- `:idOrganisation`

Le contexte actif de haut niveau doit etre porte en priorite par le shell applicatif plutot que repete dans chaque URL.

## Regles Sur Les Pages Interdites

Le frontend devra savoir produire des pages ou etats explicites pour :

- non autorise
- module desactive
- ressource introuvable
- contexte incomplet
- perimetre invalide

Ces etats font partie de la responsabilite de la page, pas encore de la vue finale.

## Modele De Cartographie A Utiliser Ensuite

La phase suivante devra decrire chaque page avec au minimum :

1. identifiant de page
2. module
3. section
4. objectif metier
5. acteur principal
6. acteurs secondaires
7. preconditions de visibilite
8. route frontend candidate
9. workflows rattaches
10. donnees attendues
11. actions visibles
12. etats de page a gerer
13. sources backend

## Ce Que Cette Phase Ne Fait Pas Encore

Cette phase ne fait pas encore :

- la composition exacte des vues
- la maquette des ecrans
- la structure des composants
- le contenu detaille de chaque page
- les filtres visuels et composants de tableau

## Verdict

Les pages et routes frontend EduSync doivent maintenant etre lues comme le niveau intermediaire officiel entre la navigation et les futures vues.

La suite la plus propre devient :

- cataloguer les pages par module
- ouvrir ensuite les vues frontend
- puis descendre vers les composants et contrats d'ecran

Cette phase est maintenant ouverte dans :

- [19-vues-frontend.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/19-vues-frontend.md)
