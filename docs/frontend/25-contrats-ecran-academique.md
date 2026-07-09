# Phase 25 - Contrats D'Ecran Academique

## Statut

Ce document ouvre les premiers contrats d'ecran reels du module `Academique`.

Il couvre les ecrans les plus centraux et les mieux figes :

- lecture du referentiel officiel
- publication d'un referentiel
- activation d'une version
- import d'un referentiel
- comparaison de versions
- migration referentielle
- pilotage des annees scolaires locales
- gestion des classes pedagogiques
- gestion des responsables de classe
- gestion du calendrier academique local
- gestion du programme-niveau local

Ce document doit etre lu comme la declinaison concrete des contrats d'ecran sur le domaine `Academique`.

## Sources De Verite

Ce document s'appuie exclusivement sur :

- [DOCTRINE_REFERENTIEL_OFFICIEL.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/architecture/DOCTRINE_REFERENTIEL_OFFICIEL.md)
- [06-workflows-academiques.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/06-workflows-academiques.md)
- [14-cartographie-finale-workflows.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/14-cartographie-finale-workflows.md)
- [16-navigation-par-acteur.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/16-navigation-par-acteur.md)
- [17-navigation-par-module.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/17-navigation-par-module.md)
- [18-pages-et-routes-frontend.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/18-pages-et-routes-frontend.md)
- [19-vues-frontend.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/19-vues-frontend.md)
- [20-composants-ui.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/20-composants-ui.md)
- [21-contrats-ecran.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/21-contrats-ecran.md)

Le backend reste la source ultime de verite.

Les contrats d'ecran academiques doivent aussi etre lus avec la separation officielle suivante :

- `Plateforme` gouverne le referentiel officiel
- `Academique local ecole` exploite ce referentiel sans le muter comme officiel

## Regles De Lecture

1. Le module `Academique` couvre deux blocs reels distincts :
   - le socle plateforme `ACA-08` et `ACA-09`
   - l'exploitation academique locale `ACA-03` a `ACA-07`
2. `MANAGER_SYSTEME` reste l'acteur naturel des mutations academiques plateforme.
3. `OPERATEUR_SYSTEME` ne doit apparaitre en mutation plateforme que sur delegations explicites deja prouvees.
4. `SUPPORT_SYSTEME` ne doit pas etre reintroduit comme acteur positif des mutations academiques plateforme.
5. Pour les workflows locaux `ACA-03` a `ACA-07`, l'acteur cible est `ADMIN_SYSTEME_ECOLE`.
6. `ADMINISTRATEUR_ECOLE` ne doit plus etre projete comme acteur principal naturel des mutations academiques locales.
7. Les ecrans academiques doivent rester lisibles comme ecrans de referentiel et d'exploitation academique, sans glisser vers des ecrans pedagogiques.

## Bloc Local D'Ecrans Academiques

Les ecrans locaux deja figes et deja projetes dans le frontend sont :

- `SCR-ACA-007`
  - page : pilotage des annees scolaires locales
  - workflow : `ACA-03`
  - acteur principal : `ADMIN_SYSTEME_ECOLE`
  - route : `/academique/annees-scolaires`
- `SCR-ACA-008`
  - page : gestion des classes pedagogiques
  - workflow : `ACA-04`
  - acteur principal : `ADMIN_SYSTEME_ECOLE`
  - route : `/academique/classes-pedagogiques`
- `SCR-ACA-009`
  - page : gestion des responsables de classe
  - workflow : `ACA-05`
  - acteur principal : `ADMIN_SYSTEME_ECOLE`
  - route : `/academique/responsabilites-classes`
- `SCR-ACA-010`
  - page : gestion du calendrier academique local
  - workflow : `ACA-06`
  - acteur principal : `ADMIN_SYSTEME_ECOLE`
  - route : `/academique/calendriers`
- `SCR-ACA-011`
  - page : gestion du programme-niveau local
  - workflow : `ACA-07`
  - acteur principal : `ADMIN_SYSTEME_ECOLE`
  - route : `/academique/programmes-locaux`

Ces cinq ecrans restent :

- bornes a l'ecole active
- gouvernes par `permission + perimetre`
- distincts du socle plateforme `ACA-08` et `ACA-09`

## Ecran `SCR-ACA-001`

### Page parente

- lecture du referentiel officiel

### Vue parente

- vue liste / detail

### Module

- `Academique`

### Section

- referentiels

### Objectif metier

Permettre la lecture du referentiel academique officiel exploitable par les workflows aval.

### Acteur principal

- `MANAGER_SYSTEME`

### Acteurs secondaires

- `OPERATEUR_SYSTEME` si delegation explicite active

### Preconditions de visibilite

- module academique actif
- acteur plateforme autorise
- permission effective de lecture du referentiel

### Donnees attendues

- referentiels disponibles
- versions publiees
- metadonnees utiles

### Donnees affichees

- liste des referentiels
- statut des versions
- details d'une version selectionnee

### Actions visibles

- consulter
- filtrer
- ouvrir le detail

### Actions masquees ou interdites

- mutation pour `SUPPORT_SYSTEME`
- lecture ecole locale

### Etats obligatoires

- loading
- aucun referentiel
- non autorise
- erreur technique

### Contraintes de perimetre

- plateforme uniquement

### Composants majeurs attendus

- tableau referentiels
- panneau detail version
- filtres de lecture

### Sources backend

- `ACA-08`

## Ecran `SCR-ACA-002`

### Page parente

- publication d'un referentiel

### Vue parente

- vue action

### Module

- `Academique`

### Section

- publications

### Objectif metier

Permettre la publication officielle d'une version de referentiel academique.

### Acteur principal

- `MANAGER_SYSTEME`

### Acteurs secondaires

- `OPERATEUR_SYSTEME` si delegation explicite active

### Preconditions de visibilite

- module academique actif
- permission effective de publication
- referentiel source valide

### Donnees attendues

- referentiel programme cible
- version a publier
- metadonnees de publication

### Donnees affichees

- contexte du referentiel
- champs de publication utiles
- recapitulatif avant confirmation

### Actions visibles

- publier
- verifier les donnees

### Actions masquees ou interdites

- publication pour `SUPPORT_SYSTEME`
- publication locale ecole

### Etats obligatoires

- loading
- donnees invalides
- non autorise
- succes
- erreur technique

### Contraintes de perimetre

- plateforme uniquement

### Composants majeurs attendus

- fiche referentiel
- formulaire publication
- recapitulatif de confirmation

### Sources backend

- `ACA-03`

## Ecran `SCR-ACA-003`

### Page parente

- activation d'une version

### Vue parente

- vue action

### Module

- `Academique`

### Section

- activation

### Objectif metier

Permettre l'activation officielle d'une version de referentiel academique.

### Acteur principal

- `MANAGER_SYSTEME`

### Acteurs secondaires

- `OPERATEUR_SYSTEME` si delegation explicite active

### Preconditions de visibilite

- module academique actif
- permission effective d'activation
- version cible connue

### Donnees attendues

- version cible
- etat actuel d'activation

### Donnees affichees

- version a activer
- etat actuel
- confirmation d'action

### Actions visibles

- activer

### Actions masquees ou interdites

- activation pour `SUPPORT_SYSTEME`

### Etats obligatoires

- loading
- version introuvable
- non autorise
- succes
- erreur technique

### Contraintes de perimetre

- plateforme uniquement

### Composants majeurs attendus

- resume version
- bloc confirmation activation

### Sources backend

- `ACA-04`

## Ecran `SCR-ACA-004`

### Page parente

- import d'un referentiel

### Vue parente

- vue action / import

### Module

- `Academique`

### Section

- imports

### Objectif metier

Permettre l'import des composantes officielles du referentiel academique dans le backend.

### Acteur principal

- `MANAGER_SYSTEME`

### Acteurs secondaires

- `OPERATEUR_SYSTEME` si delegation explicite active

### Preconditions de visibilite

- module academique actif
- permission effective d'import
- source d'import preparee

### Donnees attendues

- jeu de donnees d'import
- type de composantes importees
- rapports de validation

### Donnees affichees

- source choisie
- etat de validation
- resume d'import

### Actions visibles

- charger / preparer
- valider
- importer

### Actions masquees ou interdites

- import pour `SUPPORT_SYSTEME`

### Etats obligatoires

- loading
- source invalide
- validation echouee
- non autorise
- succes
- erreur technique

### Contraintes de perimetre

- plateforme uniquement

### Composants majeurs attendus

- bloc source import
- panneau validation
- recapitulatif resultat

### Sources backend

- `ACA-05`

## Ecran `SCR-ACA-005`

### Page parente

- comparaison de versions

### Vue parente

- vue analyse

### Module

- `Academique`

### Section

- comparaisons

### Objectif metier

Permettre la comparaison de deux versions de referentiel dans une logique d'analyse plateforme.

### Acteur principal

- `MANAGER_SYSTEME`

### Acteurs secondaires

- `OPERATEUR_SYSTEME` si delegation explicite active

### Preconditions de visibilite

- module academique actif
- permission effective de comparaison
- deux versions cibles connues

### Donnees attendues

- version source
- version cible
- differences calculees

### Donnees affichees

- resume comparatif
- blocs de differences
- indicateurs de variation

### Actions visibles

- choisir les versions
- comparer
- filtrer les differences

### Actions masquees ou interdites

- comparaison pour `SUPPORT_SYSTEME`

### Etats obligatoires

- loading
- aucune difference
- version introuvable
- non autorise
- erreur technique

### Contraintes de perimetre

- plateforme uniquement

### Composants majeurs attendus

- selecteurs de versions
- tableau comparatif
- resume des ecarts

### Sources backend

- `ACA-06`

## Ecran `SCR-ACA-006`

### Page parente

- migration referentielle

### Vue parente

- vue action / supervision

### Module

- `Academique`

### Section

- migrations

### Objectif metier

Permettre l'execution et la supervision de la migration referentielle officielle.

### Acteur principal

- `MANAGER_SYSTEME`

### Acteurs secondaires

- `OPERATEUR_SYSTEME` si delegation explicite active

### Preconditions de visibilite

- module academique actif
- permission effective de migration
- contexte plateforme valide

### Donnees attendues

- etat de la migration
- informations prealables
- resultats ou journal de migration

### Donnees affichees

- etat courant
- etapes de migration
- resultat final ou erreurs

### Actions visibles

- lancer la migration
- consulter le resultat

### Actions masquees ou interdites

- mutation pour `SUPPORT_SYSTEME`

### Etats obligatoires

- loading
- migration non disponible
- non autorise
- succes
- erreur technique

### Contraintes de perimetre

- plateforme uniquement

### Composants majeurs attendus

- resume de migration
- journal / timeline
- bloc de lancement

### Sources backend

- `ACA-09`

## Verdict

Le module `Academique` dispose maintenant d'un premier noyau de contrats d'ecran reels couvrant ses usages principaux de lecture, publication, activation, import, comparaison et migration.

La suite la plus propre devient :

- ouvrir le lot suivant sur `Plateforme`, `Organisation` ou `Transverse`
- ou revenir completer les contrats academiques secondaires si un besoin prioritaire apparait

Le premier lot transverse suivant est maintenant ouvert dans :

- [26-contrats-ecran-monitoring.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/26-contrats-ecran-monitoring.md)
