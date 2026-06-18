# Phase 4 - Workflows Frontend EduSync

## Statut

Ce document fixe la doctrine officielle des workflows frontend d'EduSync.

Il ne documente pas encore les workflows reels un par un.

Il fixe uniquement :

- la definition officielle d'un workflow EduSync
- la methodologie retenue
- la relation entre acteurs, permissions, cas d'utilisation, objectifs metier et workflows
- les regles de construction d'un workflow
- les categories officielles de workflows EduSync
- l'ordre recommande pour analyser les workflows

Ce document devient la base officielle des prochaines phases :

- workflows reels
- navigation
- dashboards
- pages
- ecrans

## Sources de Verite

La doctrine des workflows frontend s'appuie exclusivement sur :

- [00-doctrine-frontend.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/00-doctrine-frontend.md)
- [01-acteurs.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/01-acteurs.md)
- [02-permissions-effectives.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/02-permissions-effectives.md)
- [03-cas-utilisation.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/03-cas-utilisation.md)

Et, en source backend ultime :

- les acteurs reels
- les permissions effectives
- les cas d'utilisation attestes
- les contraintes de contexte actif
- les policies metier reelles

Le backend reste la source officielle de verite.

## Regles de Lecture de ce Document

Ce document doit etre lu avec les regles suivantes :

1. Il ne decrit pas encore les workflows reels detailles.

2. Il ne decrit pas encore les ecrans.

3. Il ne decrit pas encore les menus.

4. Il ne decrit pas encore la navigation.

5. Il ne decrit pas encore les dashboards.

6. Il fixe uniquement la doctrine de construction et de lecture des workflows.

7. Les workflows documentes plus tard devront etre construits a partir de cette doctrine, et non a partir d'une intuition UI.

## Definition Officielle d'un Workflow EduSync

Un workflow EduSync est une sequence metier coherente de cas d'utilisation reels, executes par un ou plusieurs acteurs, dans un contexte actif donne, pour atteindre un objectif metier explicite et produire un resultat metier identifiable.

Un workflow :

- n'est pas un ecran
- n'est pas un menu
- n'est pas une route backend
- n'est pas une permission
- n'est pas une simple liste d'actions

Un workflow est :

- une logique de parcours
- fondee sur des cas d'utilisation reels
- bornee par les permissions effectives
- bornee par le contexte actif
- bornee par les contraintes metier du backend
- ordonnee autour d'un objectif metier explicite

## Notion Officielle d'Objectif Metier

Tout workflow doit repondre a un objectif metier explicite.

L'objectif metier est la finalite fonctionnelle que le workflow cherche a atteindre.

Exemples de forme d'objectif metier :

- produire un bulletin valide
- enregistrer un paiement
- consulter la situation financiere d'un eleve autorise
- effectuer un transfert d'eleve
- modifier un referentiel d'ecole

Un workflow ne doit jamais etre decrit comme une simple suite technique d'actions.

Il doit toujours etre formule comme la poursuite d'un objectif metier.

## Methodologie Retenue

La methodologie officielle est strictement descendante et backend-first.

Ordre de lecture et de construction :

1. partir des acteurs officiels et derives reels
2. partir des permissions effectives reelles
3. partir des cas d'utilisation attestes
4. identifier l'objectif metier poursuivi
5. regrouper les cas d'utilisation en sequence metier coherente
6. nommer ensuite le workflow
7. seulement apres, ouvrir plus tard la navigation, les pages et les ecrans

Principe cle :

un workflow n'est jamais invente depuis l'UI.

Il est reconstruit a partir :

- d'un acteur reel
- de permissions effectives reelles
- de cas d'utilisation reels
- d'un objectif metier reel
- de contraintes backend reelles

## Chaine Officielle

La chaine officielle de lecture devient :

Acteur
-> Permissions effectives
-> Cas d'utilisation
-> Objectif metier
-> Workflow

Cette chaine est obligatoire.

Elle signifie :

- l'acteur ne donne pas directement le workflow
- les permissions effectives bornent ce qu'il peut reellement faire
- les cas d'utilisation portent les actions unitaires disponibles
- l'objectif metier donne le sens du parcours
- le workflow organise la sequence complete

## Relation Entre Acteur, Cas d'Utilisation, Objectif Metier et Workflow

### Acteur

L'acteur designe qui agit reellement dans le systeme.

### Permissions Effectives

Les permissions effectives bornent ce que cet acteur peut reellement mobiliser dans le contexte courant.

### Cas d'Utilisation

Les cas d'utilisation decrivent les actions unitaires reelles attestees par le backend.

### Objectif Metier

L'objectif metier donne la finalite fonctionnelle poursuivie.

### Workflow

Le workflow est la sequence coherente de cas d'utilisation permettant d'atteindre cet objectif metier, dans un contexte et sous des contraintes donnes.

## Regles de Construction d'un Workflow

Tout workflow doit etre construit selon les regles suivantes.

### Regle 1

Un workflow doit etre construit uniquement a partir de cas d'utilisation attestes par le backend.

### Regle 2

Un workflow doit toujours definir explicitement son objectif metier.

### Regle 3

Un workflow doit toujours indiquer son ou ses acteurs d'execution.

### Regle 4

Un workflow doit toujours indiquer les permissions effectives necessaires.

### Regle 5

Un workflow doit toujours indiquer le contexte actif minimal necessaire.

Exemples :

- organisation active
- ecole active
- classe concernee
- annee scolaire concernee

### Regle 6

Un workflow peut impliquer un seul acteur ou plusieurs acteurs.

### Regle 7

Un workflow ne doit jamais melanger plusieurs domaines metier sans le dire explicitement.

### Regle 8

Un workflow doit rester independant de l'UI.

L'UI viendra plus tard presenter le workflow, pas le definir.

### Regle 9

Un workflow ne doit pas presupposer un ecran unique.

Un meme workflow peut plus tard se projeter sur plusieurs pages ou plusieurs vues.

### Regle 10

Tout workflow doit definir explicitement :

- objectif metier
- preconditions
- acteurs
- cas d'utilisation utilises
- resultat attendu
- contraintes
- variantes eventuelles

### Regle 11

Aucun workflow frontend ne peut introduire un cas d'utilisation absent du backend.

## Structure Canonique d'un Workflow

Quand les workflows reels seront documentes plus tard, chacun devra au minimum contenir :

1. nom du workflow
2. categorie
3. objectif metier
4. acteurs concernes
5. permissions effectives necessaires
6. preconditions
7. cas d'utilisation utilises
8. resultat attendu
9. contraintes
10. variantes eventuelles

## Categories Officielles de Workflows EduSync

Les categories officielles de workflows a documenter dans EduSync sont :

- Workflows academiques
- Workflows pedagogiques
- Workflows scolaires
- Workflows financiers
- Workflows parent
- Workflows administration ecole
- Workflows organisation
- Workflows plateforme
- Workflows transverses

## Definition des Categories

### Workflows Academiques

Les workflows academiques concernent principalement le Referentiel Academique.

Ils couvrent notamment :

- structure scolaire
- classes academiques
- classes pedagogiques
- sections scolaires
- options d'etude
- regles academiques locales
- responsabilites de classes pedagogiques si elles relevent du referentiel

### Workflows Pedagogiques

Les workflows pedagogiques concernent principalement :

- enseignants
- titulaires
- evaluations
- bulletins
- proclamations

Ils couvrent donc les usages pedagogiques reels de classe, d'evaluation et de resultat.

### Workflows Scolaires

Les workflows scolaires concernent principalement :

- lecture de scolarite
- abandon
- transfert
- suivi de parcours eleve

### Workflows Financiers

Les workflows financiers concernent principalement :

- perception
- caisse
- lecture financiere
- situation de paiement

### Workflows Parent

Les workflows parent concernent principalement :

- consultation enfant autorise
- lecture bulletins
- lecture finances

### Workflows Administration Ecole

Les workflows administration ecole concernent principalement :

- pilotage local d'ecole
- administration fonctionnelle locale
- usages transverses admin ecole

### Workflows Organisation

Les workflows organisation concernent principalement :

- supervision transverse organisationnelle
- synthese organisation
- lecture consolidée organisation

### Workflows Plateforme

Les workflows plateforme concernent principalement :

- usages systeme transverses
- supervision globale
- operations de pilotage plateforme

Ils seront documentes plus tard seulement sur base de cas d'utilisation attestes suffisamment explicites.

### Workflows Transverses

Les workflows transverses concernent principalement :

- authentification
- session utilisateur
- contexte actif
- services mutualises `shared/*`

## Ordre Recommande Pour Analyser les Workflows

L'ordre recommande d'analyse est le suivant :

1. Workflows academiques
2. Workflows pedagogiques
3. Workflows scolaires
4. Workflows financiers
5. Workflows parent
6. Workflows administration ecole
7. Workflows organisation
8. Workflows plateforme
9. Workflows transverses

## Justification de l'Ordre

Cet ordre est recommande pour les raisons suivantes :

- les workflows academiques structurent une partie du socle de verite fonctionnelle
- les workflows pedagogiques portent le coeur visible de l'experience educative
- les workflows scolaires prolongent directement les usages eleves
- les workflows financiers sont centraux mais plus lateraux que le coeur pedagogique
- les workflows parent dependent en partie des workflows pedagogiques, scolaires et financiers
- les workflows administration ecole orchestrent ensuite plusieurs domaines
- les workflows organisation et plateforme viennent plus tard, plus transverses

## Regles Pour les Phases Suivantes

Les futures phases devront respecter les regles suivantes :

1. aucun workflow ne sera detaille sans s'appuyer sur les documents 00 a 03
2. aucune navigation ne sera fixee avant les workflows reels
3. aucun ecran ne sera defini avant le workflow auquel il appartient
4. aucun dashboard ne sera decrit hors des objectifs metier qu'il sert
5. aucun parcours UI ne devra contourner les contraintes backend reelles

## Conclusion

La doctrine 04 - workflows est desormais figee comme suit :

- un workflow EduSync est une sequence metier coherente de cas d'utilisation reels
- tout workflow doit poursuivre un objectif metier explicite
- la chaine officielle est :
  - Acteur
  - Permissions effectives
  - Cas d'utilisation
  - Objectif metier
  - Workflow
- les workflows sont construits depuis le backend et jamais depuis l'UI
- les categories officielles de workflows sont desormais fixees
- l'ordre recommande d'analyse des workflows est desormais fixe

Ce document devient la base officielle pour la future documentation detaillee des workflows reels EduSync.
