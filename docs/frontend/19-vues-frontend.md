# Phase 19 - Vues Frontend

## Statut

Ce document fixe la doctrine officielle des vues frontend d'EduSync.

Il intervient apres :

- les workflows reels
- la cartographie finale des workflows
- la navigation frontend
- la navigation par acteur
- la navigation par module
- les pages et routes frontend

Il intervient avant :

- les composants UI
- les contrats d'ecran detailles
- les specifications de widgets
- les maquettes d'implementation fine

Ce document ne decrit pas encore chaque vue finale une par une.

Il fixe seulement :

- la definition officielle d'une vue frontend EduSync
- la relation entre page et vue
- les types officiels de vues
- les regles de construction d'une vue
- les etats obligatoires d'une vue
- les liens officiels entre vues, workflows, pages et composants

## Sources De Verite

Cette phase s'appuie exclusivement sur :

- [00-doctrine-frontend.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/00-doctrine-frontend.md)
- [14-cartographie-finale-workflows.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/14-cartographie-finale-workflows.md)
- [15-navigation-frontend.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/15-navigation-frontend.md)
- [16-navigation-par-acteur.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/16-navigation-par-acteur.md)
- [17-navigation-par-module.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/17-navigation-par-module.md)
- [18-pages-et-routes-frontend.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/18-pages-et-routes-frontend.md)
- [06-workflows-academiques.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/06-workflows-academiques.md)
- [07-workflows-pedagogiques.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/07-workflows-pedagogiques.md)
- [08-workflows-scolaires.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/08-workflows-scolaires.md)
- [09-workflows-financiers.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/09-workflows-financiers.md)
- [10-workflows-administration-ecole.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/10-workflows-administration-ecole.md)
- [11-workflows-organisation.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/11-workflows-organisation.md)
- [12-workflows-plateforme.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/12-workflows-plateforme.md)
- [13-workflows-transverses.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/13-workflows-transverses.md)

Le backend reste la source ultime de verite metier.

## Definition Officielle D'une Vue Frontend

Une vue frontend EduSync est la forme de presentation concrète d'une page, adaptee a un objectif metier, a un acteur donne et a un contexte actif donne.

Une vue :

- n'est pas un workflow
- n'est pas une route
- n'est pas une page au sens structurel
- n'est pas un composant isole

Une vue est :

- une projection d'experience
- une organisation visuelle d'informations et d'actions
- un cadre de lecture ou de mutation
- une traduction UX d'une page metier

## Chaine Officielle

La chaine officielle devient :

Workflow reel
-> navigation
-> page
-> vue
-> composants

Cette chaine est obligatoire.

Elle signifie :

- la vue n'invente pas le workflow
- la vue n'invente pas la page
- la vue traduit une page deja legitime
- les composants arrivent seulement apres la vue

## Difference Officielle Entre Page Et Vue

### Page

La page est le point d'entree structurel.

Elle porte :

- l'objectif metier
- la route frontend
- les etats applicatifs
- les dependances de donnees
- les actions globales disponibles

### Vue

La vue est la forme de presentation de cette page.

Elle porte :

- la hierarchie visuelle
- l'organisation des blocs
- le mode de lecture
- la priorite perceptive
- la projection des actions visibles

Une meme page peut, si necessaire, produire plusieurs vues de meme objectif, selon :

- le device
- le niveau de lecture
- le mode contexte

Mais ces variantes ne doivent jamais devenir plusieurs workflows artificiels.

## Regles Fondatrices

### Regle 1

Une vue doit toujours etre rattachee a une page officielle.

### Regle 2

Une vue doit toujours servir un objectif metier clair.

### Regle 3

Une vue ne doit jamais exposer plus d'actions que la page et le workflow reel n'en autorisent.

### Regle 4

Une vue doit rester gouvernee par `permission + perimetre`.

### Regle 5

Une vue ne doit pas masquer les contraintes de contexte actif.

### Regle 6

Une vue doit distinguer explicitement :

- lecture
- mutation
- analyse
- supervision
- parametrage

### Regle 7

Une vue ne doit jamais melanger plusieurs niveaux de gouvernance sans signal clair.

### Regle 8

Une vue doit rester comprehensible meme quand les donnees sont absentes ou partiellement disponibles.

### Regle 9

Une vue ne doit jamais se brancher directement sur une intuition de composant.

### Regle 10

Une vue doit etre lue comme une traduction UX d'une logique metier, pas comme une simple mise en page.

## Les Types Officiels De Vues

EduSync doit reconnaitre au minimum les types de vues suivants.

### 1. Vue Centre De Travail

Une vue qui organise plusieurs blocs coherents autour d'une mission principale.

Exemples :

- centre caissier
- centre titulaire
- centre monitoring

### 2. Vue Liste

Une vue de consultation d'un ensemble de ressources.

Exemples :

- liste des eleves
- liste des recus
- liste des incidents

### 3. Vue Detail

Une vue centree sur une ressource ou un cas unique.

Exemples :

- detail eleve
- detail recu
- detail organisation

### 4. Vue Formulaire / Action

Une vue de mutation guidee.

Exemples :

- enregistrer un paiement
- publier un referentiel
- configurer un parametre

### 5. Vue Analyse

Une vue de lecture comparative ou diagnostique.

Exemples :

- statistiques de classe
- analyses de resultats
- paiements par type de frais

### 6. Vue Dashboard

Une vue de pilotage de plusieurs signaux aggreges.

Exemples :

- supervision organisationnelle
- monitoring plateforme
- pilotage financier ecole

### 7. Vue Parametrage

Une vue de gouvernance locale ou transverse.

Exemples :

- modules actifs
- branding
- runtime
- preferences utilisateur

## Les Etats Obligatoires D'une Vue

Toute vue frontend EduSync doit prevoir les etats suivants si pertinents :

- chargement
- vide
- erreur technique
- non autorise
- module desactive
- perimetre invalide
- ressource introuvable
- donnees partielles

Ces etats ne sont pas optionnels.

Ils font partie de la definition de la vue.

## Les Blocs Internes D'Une Vue

Une vue peut contenir plusieurs blocs internes.

Les blocs types les plus attendus sont :

- en-tete de contexte
- resume metier
- zone principale de contenu
- actions principales
- actions secondaires
- filtres
- navigation locale
- etats de feedback
- journal ou historique si utile

La phase composants precisera plus tard comment ces blocs se traduisent.

## Vues Et Contexte Actif

Les vues EduSync doivent rendre visible, quand c'est utile :

- l'organisation active
- l'ecole active
- la section concernee
- la classe concernee
- l'annee scolaire concernee
- l'eleve concerne

Une vue ne doit pas forcer l'utilisateur a deviner dans quel perimetre il agit.

## Vues Et Actions Visibles

Une vue ne doit afficher que les actions legitimement ouvrables dans le contexte courant.

Exemples de distinctions obligatoires :

- `ENSEIGNANT` simple voit l'encodage de fiche, pas la generation de proclamation
- `TITULAIRE` voit les actions de bulletin et de proclamation seulement sur sa classe titulaire effective
- `CAISSIER` voit les actions de caisse et perception, pas les actions pedagogiques
- `PARENT` voit les lectures de ses enfants, pas les actions d'administration

## Vues Et Analyse

Les vues analytiques doivent etre traitees comme des vues a part entiere, pas comme un simple tableau secondaire.

Cela concerne notamment :

- `PED-05`
- `PED-08`
- plusieurs workflows `PF-*`
- `MON-*`
- `AUD-*`

Une vue d'analyse doit pouvoir exposer clairement :

- les filtres utiles
- les regroupements
- les indicateurs
- les diagnostics
- les details actionnables

## Vues Et Non-Melange Des Niveaux

Les vues doivent rester separees selon les niveaux suivants :

- plateforme
- organisation
- ecole
- utilisateur

Une vue qui traverse plusieurs niveaux doit l'assumer explicitement comme vue de supervision.

## Modele De Description Des Futures Vues

Les futures vues detaillees devront utiliser au minimum :

1. identifiant de vue
2. page parente
3. type de vue
4. objectif metier
5. acteur principal
6. acteurs secondaires
7. preconditions de visibilite
8. donnees principales affichees
9. actions visibles
10. etats obligatoires
11. blocs internes
12. contraintes de perimetre
13. sources backend

## Ce Que Cette Phase Ne Fait Pas Encore

Cette phase ne fait pas encore :

- les maquettes concretes
- les wireframes
- la granularite des composants
- le design system de chaque bloc
- les contrats d'ecran ligne par ligne

## Verdict

Les vues frontend EduSync doivent maintenant etre lues comme la traduction UX officielle des pages deja justifiees par les workflows, la navigation et les perimetres reels.

La suite officielle la plus propre devient :

- cataloguer les vues par module et par page
- ouvrir ensuite les composants UI
- puis formaliser les contrats d'ecran detailles

Cette phase est maintenant ouverte dans :

- [20-composants-ui.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/20-composants-ui.md)
