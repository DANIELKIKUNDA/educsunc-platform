# Phase 51 - Maquette Referentiel Officiel Plateforme

## Statut

Ce document ouvre la maquette operationnelle du centre `Referentiel officiel Plateforme`.

Il ne cree :

- aucun nouveau workflow
- aucun nouvel acteur
- aucune nouvelle permission
- aucune nouvelle route backend
- aucune nouvelle regle de securite

Il traduit uniquement en maquette operatoire :

- la doctrine [50-doctrine-ecran-referentiel-officiel-plateforme.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/50-doctrine-ecran-referentiel-officiel-plateforme.md)
- les workflows plateforme deja figes
- les routes backend reelles
- la separation entre officiel transverse et exploitation locale ecole

## Objectif

Definir la materialisation ecran premium, dense et prudente du centre `Referentiel officiel Plateforme`, afin que le frontend implemente :

- un vrai centre ERP de gouvernance referentielle
- une lecture claire des composantes officielles
- une execution encadree des mutations critiques
- une supervision lisible des versions et migrations

Ce centre ne doit jamais ressembler :

- a un dashboard marketing
- a un simple ecran technique de developpeur
- a un module academique local d'ecole

## Sources De Verite

Cette maquette s'appuie exclusivement sur :

- [12-workflows-plateforme.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/12-workflows-plateforme.md)
- [06-workflows-academiques.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/06-workflows-academiques.md)
- [25-contrats-ecran-academique.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/25-contrats-ecran-academique.md)
- [43-maquettes-academiques.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/43-maquettes-academiques.md)
- [50-doctrine-ecran-referentiel-officiel-plateforme.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/50-doctrine-ecran-referentiel-officiel-plateforme.md)
- [31-synthese-contrats-ecran.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/31-synthese-contrats-ecran.md)
- [32-maquettes-shell-global.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/32-maquettes-shell-global.md)

Le backend reste la source ultime de verite.

## Doctrine De Maquettage

### Regle 1

Le centre doit d'abord afficher son vrai niveau :

- `Plateforme`

et sa vraie nature :

- `Referentiel officiel transverse`

### Regle 2

Le centre doit presenter ensemble :

- le socle structurel
- le catalogue des cours
- les referentiels programmes
- les comparaisons
- les migrations

sans forcer l'utilisateur a changer de module pour comprendre une meme chaine metier.

### Regle 3

Les mutations critiques restent internes au centre.

Elles ne doivent pas devenir :

- des menus primaires
- des cartes d'accueil geantes
- des CTA marketing

### Regle 4

Les tableaux sont prioritaires sur les graphiques.

Le coeur de lecture est :

- liste
- detail
- statut
- impact

### Regle 5

Le frontend n'invente jamais :

- edition fine des lignes officielles
- suppression de version
- mutation globale absente du backend
- compatibilite recalculee localement

### Regle 6

Toute mutation critique doit etre precedee de :

- contexte lisible
- recapitulatif
- confirmation explicite

### Regle 7

Le centre doit rester premium, mais sobre.

Il doit evoquer :

- SAP
- Microsoft Dynamics
- Salesforce administration
- Odoo back-office robuste

et non pas un site vitrine.

## MRP-01

### Identifiant

- `MRP-01`

### Nom

- `Centre Referentiel officiel Plateforme`

### Objectif metier

Permettre au `MANAGER_SYSTEME` et, selon delegation explicite, a `OPERATEUR_SYSTEME`, de piloter tout le cycle du referentiel officiel depuis un espace unique : socle, cours, versions, comparaisons et migrations.

### Version Desktop

La version desktop doit etre un centre de travail dense avec detail contextuel permanent.

Structure officielle retenue :

1. bandeau de contexte plateforme
2. barre de synthese courte
3. barre de pilotage et d'actions
4. onglets principaux
5. zone de travail a deux niveaux :
   - contenu principal
   - panneau detail ou rapport
6. modales de mutation critique

Lecture UX retenue :

- un centre de pilotage, pas une homepage
- une densite utile, pas des blocs geants
- une navigation par onglets, pas par pages dispersees

### Version Mobile

La version mobile doit prioriser :

1. le contexte
2. le changement d'onglet
3. la liste du sous-espace courant
4. l'ouverture du detail dans un drawer ou plein ecran
5. les actions critiques via bottom sheet ou modale plein ecran

Le mobile doit rester pleinement exploitable pour :

- lire
- filtrer
- confirmer
- consulter un rapport

Les mutations lourdes peuvent rester plus prudentes, mais elles ne doivent pas etre cassees.

### Filtres globaux

- recherche globale
- famille du centre
- structure d'evaluation
- statut
- classe academique
- version de referentiel
- statut de migration

### Zone de donnees globale

- sections scolaires officielles
- classes academiques officielles
- options d'etudes officielles
- cours officiels
- referentiels programmes
- versions de referentiel
- lignes de programme
- rapports de comparaison
- historique des migrations
- rapports de migration

### Statistiques globales

- nombre total de sections
- nombre total de classes academiques
- nombre total d'options d'etudes
- nombre total de cours officiels
- nombre total de referentiels programmes
- nombre total de versions publiees
- nombre total de versions actives
- nombre total de migrations visibles

### Actions visibles

- consulter
- filtrer
- actualiser
- ouvrir le detail
- importer une composante officielle
- publier une version
- activer une version
- comparer deux versions
- analyser une migration
- appliquer une migration
- annuler une migration
- relancer un recalcul

### Exports

- Excel des listes si branche reelle disponible
- impression de la vue courante
- PDF des rapports seulement si le backend ou la couche frontend le porte reellement plus tard

### Acteurs autorises

- `MANAGER_SYSTEME`
- `OPERATEUR_SYSTEME` seulement selon delegation explicite active sur le workflow concerne

### Contraintes de perimetre

- `PLATEFORME` uniquement
- aucune lecture locale ecole absorbee
- aucune mutation academique locale

### Sources backend

- `PLT-01`
- `PLT-02`
- `PLT-03`
- `PLT-04`
- `PLT-05`
- `ACA-09`
- [50-doctrine-ecran-referentiel-officiel-plateforme.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/50-doctrine-ecran-referentiel-officiel-plateforme.md)

### Relations avec les contrats d'ecran

- [50-doctrine-ecran-referentiel-officiel-plateforme.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/50-doctrine-ecran-referentiel-officiel-plateforme.md)
- [25-contrats-ecran-academique.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/25-contrats-ecran-academique.md)

## Structure Ecran Officielle

### Zone 1 - Bandeau de contexte

Le bandeau doit afficher :

- breadcrumb shell
- badge `Plateforme`
- titre `Referentiel officiel`
- sous-titre :
  - `Socle academique transverse, versions officielles et migrations`
- acteur courant
- statut d'acces :
  - `Lecture autorisee`
  - `Mutations autorisees`
  - ou `Lecture seule`

Actions secondaires du bandeau :

- `Actualiser`
- `Voir les routes secondaires` seulement en mode dev si utile

Le bandeau ne doit pas afficher :

- organisation active comme contexte metier principal
- ecole active comme contexte metier principal

### Zone 2 - Cartes de synthese

Les cartes doivent etre sur une seule ligne en desktop si possible, scrollables horizontalement sur petits ecrans.

Cartes retenues :

1. `Sections`
2. `Classes academiques`
3. `Options`
4. `Cours officiels`
5. `Referentiels programmes`
6. `Versions actives`
7. `Migrations`

Regles UX :

- carte compacte
- chiffre principal fort
- sous-ligne contextuelle
- etat ou tendance textuelle courte

Exemples de sous-lignes :

- `3 inactives`
- `12 finalistes`
- `2 versions actives a verifier`
- `4 migrations analysees`

### Zone 3 - Barre de pilotage

Cette barre doit rester visible en haut de la zone de contenu.

Elle contient :

- champ de recherche globale
- select `Famille`
- select `Structure`
- select `Statut`
- bouton `Effacer les filtres`
- bouton `Actualiser`

Groupe d'actions rapides a droite :

- `Importer`
- `Publier`
- `Activer`
- `Comparer`
- `Nouvelle migration`

Ordre UX :

- lecture d'abord
- actions ensuite

### Zone 4 - Onglets principaux

Le centre est structure en cinq onglets officiels :

1. `Socle officiel`
2. `Cours officiels`
3. `Referentiels programmes`
4. `Comparaisons`
5. `Migrations`

Chaque onglet porte :

- sa table principale
- ses cartes locales si utiles
- son detail
- ses actions internes

## MRP-01-A

### Identifiant

- `MRP-01-A`

### Nom

- `Onglet Socle officiel`

### Objectif metier

Relire et administrer minimalement les structures officielles amont : sections scolaires, classes academiques et options d'etudes.

### Version Desktop

Structure recommandee :

1. segment interne :
   - `Sections`
   - `Classes academiques`
   - `Options d'etudes`
2. mini-cartes de famille
3. tableau principal
4. panneau detail droit
5. bouton de creation minimal

### Version Mobile

Structure recommandee :

1. select ou tabs compacts de famille
2. liste ou cartes de la famille
3. feuille detail
4. action `Creer` si autorisee

### Filtres

- recherche textuelle
- type de famille
- actif / inactif
- structure d'evaluation pour les classes
- section pour les classes

### Zone de donnees

- sections
- classes academiques
- options d'etudes

### Statistiques

- total de la famille courante
- actifs
- inactifs si exposes
- dernier element modifie si la projection le permet plus tard

### Tableaux

#### Tableau `Sections`

Colonnes :

- code
- libelle
- ordre
- actif
- version
- cree le
- modifie le

#### Tableau `Classes academiques`

Colonnes :

- code
- libelle
- section
- option
- cycle
- structure
- finaliste
- EXETAT
- TENASOSP
- actif

#### Tableau `Options d'etudes`

Colonnes :

- code
- abreviation
- libelle
- technique
- categorie technique
- ordre
- active

### Actions visibles

- consulter le detail
- creer une section
- creer une classe academique
- creer une option d'etude

### Modales

- `Creation section`
- `Creation classe academique`
- `Creation option d'etude`

### Confirmations

- succes de creation sobre
- pas de confirmation destructive ici

### Etats vides

- aucune section
- aucune classe academique
- aucune option

### Erreurs

- lecture impossible
- mutation refusee
- donnees invalides

### Chargements

- skeleton de tableau
- skeleton de panneau detail

## MRP-01-B

### Identifiant

- `MRP-01-B`

### Nom

- `Onglet Cours officiels`

### Objectif metier

Relire le catalogue officiel des cours et preparer les operations de mise a jour du corpus officiel.

### Version Desktop

Structure recommandee :

1. cartes locales
2. barre de filtres
3. tableau principal
4. panneau detail cours

### Version Mobile

Structure recommandee :

1. cartes compactes
2. filtres repliables
3. liste des cours
4. detail plein ecran

### Filtres

- recherche
- domaine
- sous-domaine
- actif

### Zone de donnees

- cours officiels

### Statistiques

- total cours
- total avec domaine
- total avec sous-domaine
- total actifs

### Tableau principal

Colonnes :

- code
- libelle
- abreviation
- domaine
- sous-domaine
- actif
- version

### Actions visibles

- consulter
- filtrer
- importer cours

### Modales

- `Importer composante > Cours`

### Confirmations

- import reussi

### Etats vides

- aucun cours charge

### Erreurs

- catalogue indisponible
- import invalide

### Chargements

- skeleton cartes
- skeleton table

## MRP-01-C

### Identifiant

- `MRP-01-C`

### Nom

- `Onglet Referentiels programmes`

### Objectif metier

Lire les referentiels programmes officiels, leurs versions, leurs lignes et leurs statuts, puis declencher publication ou activation si autorise.

### Version Desktop

Structure recommandee :

1. table des referentiels programmes
2. panneau detail referentiel
3. sous-table des versions
4. detail d'une version
5. sous-table des lignes

### Version Mobile

Structure recommandee :

1. liste des referentiels
2. detail du referentiel
3. accordions `Versions` puis `Lignes`
4. actions dans un bandeau fixe ou menu contextuel

### Filtres

- classe academique
- structure
- actif
- version publiee
- version active

### Zone de donnees

- referentiels programmes
- versions
- lignes de version

### Statistiques

- total referentiels
- sans version active
- total versions publiees
- total versions actives

### Tableau `Referentiels`

Colonnes :

- identifiant court ou code lisible
- classe academique
- structure
- actif
- version active
- nombre de versions

### Tableau `Versions`

Colonnes :

- code version
- annee reference
- date publication
- source import
- publiee
- active
- lignes

### Tableau `Lignes de version`

Colonnes :

- ordre
- cours
- obligatoire
- a examen
- calculable
- domaine
- sous-domaine
- ponderation resumee

### Actions visibles

- ouvrir un referentiel
- ouvrir une version
- publier une version
- activer une version
- importer programmes
- importer lignes

### Modales

- `Publier une version`
- `Activer une version`
- `Importer composante > Programmes`
- `Importer composante > Lignes`

### Confirmations

- confirmation publication
- confirmation activation

### Etats vides

- aucun referentiel programme
- aucune version pour le referentiel selectionne
- aucune ligne pour la version selectionnee

### Erreurs

- detail introuvable
- version non publiee
- activation impossible
- publication impossible

### Chargements

- skeleton de table referentiels
- skeleton detail
- skeleton sous-table versions

## MRP-01-D

### Identifiant

- `MRP-01-D`

### Nom

- `Onglet Comparaisons`

### Objectif metier

Comparer deux versions officielles et lire proprement leurs differences sans mutation directe.

### Version Desktop

Structure recommandee :

1. zone de selection
2. cartes de resultat
3. table des differences
4. panneau detail difference

### Version Mobile

Structure recommandee :

1. formulaire compact
2. cartes de resultat
3. liste des differences
4. detail plein ecran

### Filtres

- classe academique
- version source
- version cible
- type de difference

### Zone de donnees

- rapport de comparaison
- differences detectees

### Statistiques

- total differences
- ajouts
- suppressions
- ordres modifies
- ponderations modifiees
- non calculables

### Tableau principal

Colonnes :

- type diff
- cours
- ancienne valeur
- nouvelle valeur
- impact

### Actions visibles

- lancer une comparaison
- relancer
- ouvrir detail diff

### Modales

- `Comparer deux versions`

### Confirmations

- aucune confirmation destructive
- simple succes de calcul

### Etats vides

- aucune comparaison lancee
- aucune difference detectee

### Erreurs

- comparaison indisponible
- versions invalides
- classe academique absente

### Chargements

- skeleton cartes
- skeleton differences

## MRP-01-E

### Identifiant

- `MRP-01-E`

### Nom

- `Onglet Migrations`

### Objectif metier

Superviser l'analyse, l'application, l'annulation et la relance de recalcul des migrations referentielles officielles.

### Version Desktop

Structure recommandee :

1. barre de filtres de migration
2. table d'historique
3. panneau rapport
4. bloc actions critiques

### Version Mobile

Structure recommandee :

1. filtres compactes
2. cartes de migration
3. rapport en plein ecran
4. actions via bottom sheet

### Filtres

- programme niveau
- statut migration
- version source
- version cible

### Zone de donnees

- migrations
- rapport de migration
- transformations de notes

### Statistiques

- visibles
- brouillons
- analysees
- appliquees
- annulees

### Tableau principal

Colonnes :

- id migration
- programme niveau
- ancienne version
- nouvelle version
- date
- declenche par
- statut
- resume

### Panneau rapport

Blocs attendus :

- en-tete de migration
- statistiques d'impact
- differences
- transformations de notes
- bloc d'actions

### Actions visibles

- analyser une migration
- consulter un rapport
- appliquer
- annuler
- relancer un recalcul

### Modales

- `Analyser une migration`
- `Confirmer application`
- `Confirmer annulation`

### Confirmations

- confirmation application
- confirmation annulation
- relance recalcul avec message de prudence

### Etats vides

- aucune migration visible
- aucun rapport selectionne

### Erreurs

- migration introuvable
- action interdite selon statut
- recalcul indisponible

### Chargements

- skeleton table historique
- skeleton rapport

## Etats D'Interface Premium

### Loading

Le centre doit preferer :

- skeleton de cartes
- skeleton de table
- skeleton de panneau detail

Le spinner seul n'est acceptable que pour une action ponctuelle tres courte.

### Vide

Chaque etat vide doit :

- expliquer l'absence de donnees
- rappeler le perimetre courant
- proposer la bonne action si elle est autorisee

Exemples :

- `Aucun cours officiel charge`
- `Aucune version publiee pour ce referentiel`
- `Aucune migration trouvee pour ce programme niveau`

### Erreur

L'erreur doit rester metier et comprehensible.

Forme attendue :

- titre court
- message humain
- bouton `Reessayer`
- details techniques masques hors mode developpement

### Acces refuse

Si `referentiel.read` manque :

- l'ecran complet est remplace par un etat `Acces refuse`

Si `referentiel.write` manque :

- la lecture reste possible
- les actions critiques sont masquees ou disabled
- la raison doit etre visible

## Experience Mobile

### Principes

- un onglet a la fois
- detail dans un drawer ou plein ecran
- actions critiques en bottom sheet
- tableaux transformes en listes denses

### Hierarchie mobile

1. contexte
2. cartes globales
3. onglets scrollables
4. liste de l'onglet courant
5. detail
6. action

### Regles

- ne jamais forcer un tableau horizontal complet sur petit ecran
- ne pas perdre les statuts
- conserver les confirmations critiques

## Regles UX Premium

### Regle 1

Le centre doit donner une impression immediate de gouvernance maitrisee.

### Regle 2

La lecture d'une table doit etre plus rapide que la lecture d'une carte geante.

### Regle 3

Les couleurs doivent servir les statuts :

- actif
- publie
- non publie
- analysee
- appliquee
- annulee
- erreur

### Regle 4

Les actions critiques doivent etre visuellement distinguees des actions de lecture.

### Regle 5

Le detail doit toujours rendre le contexte plus clair que la ligne d'origine.

### Regle 6

Le frontend ne doit jamais faire croire qu'une mutation est triviale.

### Regle 7

Les routes secondaires existent, mais l'utilisateur doit sentir qu'il travaille dans un seul centre coherent.

## Ce Qu'Il Ne Faut Surtout Pas Faire

- refaire six pages sans centre unifie
- laisser des UUID comme parcours principal de lecture
- afficher les comparaisons et migrations comme JSON brut final
- projeter l'ecole locale dans ce centre
- transformer les cartes de synthese en faux dashboard
- surcharger l'ecran d'animations

## Verdict

La maquette operationnelle du `Referentiel officiel Plateforme` est maintenant posee.

La lecture officielle retenue est :

- un centre unique
- cinq onglets stables
- des tableaux denses
- des cartes de synthese compactes
- des actions critiques internes et prudentes
- une experience mobile pensee
- une UX premium de type ERP

La suite legitime est l'implementation UI de ce centre dans le module `Plateforme`, en reemployant si utile les vues actuelles du domaine `Academique` sans reouvrir le metier.
