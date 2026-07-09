# Phase 50 - Doctrine Ecran Referentiel Officiel Plateforme

## Statut

Ce document ferme la doctrine ecran complete du centre `Referentiel officiel Plateforme`.

Il doit maintenant etre lu conjointement avec la doctrine d'architecture transverse :

- [DOCTRINE_REFERENTIEL_OFFICIEL.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/architecture/DOCTRINE_REFERENTIEL_OFFICIEL.md)

Il ne cree :

- aucun nouveau workflow
- aucune nouvelle permission
- aucune nouvelle route backend
- aucune nouvelle vue metier
- aucune nouvelle regle academique

Il materialise seulement, au niveau ecran et UX, ce que le depot prouve deja :

- le socle officiel `ACA-08`
- la migration referentielle `ACA-09`
- les routes `PLAT-REF-001` a `PLAT-REF-006`
- les permissions `referentiel.read` et `referentiel.write`
- la separation entre socle officiel transverse et exploitation locale ecole

## Objectif

Definir la forme officielle, complete et premium de l'ecran `Referentiel officiel Plateforme`, afin que son implementation future :

- ne reouvre plus le metier
- ne duplique plus Plateforme et Academique
- ne projette plus les actions critiques comme menus principaux
- ne redescende jamais sur de faux workflows locaux

Ce document doit permettre d'implementer un centre de pilotage unique, dense, prudent et commercialisable.

## Sources De Verite

Cette doctrine s'appuie exclusivement sur :

- [DOCTRINE_REFERENTIEL_OFFICIEL.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/architecture/DOCTRINE_REFERENTIEL_OFFICIEL.md)
- [06-workflows-academiques.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/06-workflows-academiques.md)
- [12-workflows-plateforme.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/12-workflows-plateforme.md)
- [16-navigation-par-acteur.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/16-navigation-par-acteur.md)
- [17-navigation-par-module.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/17-navigation-par-module.md)
- [18-pages-et-routes-frontend.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/18-pages-et-routes-frontend.md)
- [19-vues-frontend.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/19-vues-frontend.md)
- [21-contrats-ecran.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/21-contrats-ecran.md)
- [25-contrats-ecran-academique.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/25-contrats-ecran-academique.md)
- [43-maquettes-academiques.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/43-maquettes-academiques.md)
- [frontend-doctrine.ts](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/shared/doctrine/frontend-doctrine.ts)
- [routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/plateforme/routes.ts)
- [routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/academique/routes.ts)
- [academique.api.ts](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/academique/services/academique.api.ts)
- [referentiels-academiques.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/interfaces/http/routes/referentiels-academiques.routes.ts)
- [migrations-referentiel.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/interfaces/http/routes/migrations-referentiel.routes.ts)
- [socle-academique.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/interfaces/http/routes/socle-academique.routes.ts)

Le backend reste la source ultime de verite.

## Regles De Lecture

1. Le `Referentiel officiel Plateforme` est un centre unique de pilotage transverse.
2. Il appartient visuellement au module `Plateforme`, meme si certaines vues actuelles sont encore hebergees dans `frontend/src/domains/academique`.
3. Les actions `importer`, `publier`, `activer`, `comparer` et `migrer` restent des capacites metier reelles, mais ne doivent plus etre exposees comme menus primaires independants.
4. Les ecrans locaux d'ecole `ACA-03` a `ACA-07` restent hors de ce centre.
5. Le frontend ne doit jamais demander a l'utilisateur de reconstituer la logique metier du referentiel depuis des identifiants bruts si une lecture selectionnable est possible.
6. Le centre doit raisonner en permanence en `permission + perimetre`.
7. Le perimetre de ce centre est `PLATEFORME` uniquement.
8. Une version publiee ou active est immuable.
9. Toute correction officielle doit passer par une nouvelle version de travail non publiee.
10. L'ecole n'edite jamais le referentiel officiel ; elle exploitera plus tard un `ProgrammeNiveau` local distinct.

## Cartographie Officielle Retenue

### Entree visuelle officielle

- `SCR-PLAT-REF-001`
  - route officielle : `/app/plateforme/referentiel`
  - role : centre de pilotage du referentiel officiel

### Capacites secondaires rattachees au centre

- `PLAT-REF-002`
  - route existante : `/app/plateforme/referentiel/publier`
  - role : publication d'une version officielle
- `PLAT-REF-003`
  - route existante : `/app/plateforme/referentiel/activer`
  - role : activation d'une version officielle
- `PLAT-REF-004`
  - route existante : `/app/plateforme/referentiel/importer`
  - role : import des composantes officielles
- `PLAT-REF-005`
  - route existante : `/app/plateforme/referentiel/comparer`
  - role : comparaison de versions
- `PLAT-REF-006`
  - route existante : `/app/plateforme/referentiel/migrations`
  - role : migration referentielle

### Doctrine de projection

La doctrine retenue n'impose pas la suppression de ces routes secondaires.

En revanche, l'entree produit officielle doit etre :

- un seul menu `Referentiel officiel`
- un seul espace de travail
- des onglets internes
- des modales et panneaux d'action

Les routes secondaires peuvent rester :

- des deep-links techniques
- des points d'entree directs de developpement
- des URL de secours ou de reprise d'action

Mais elles ne doivent plus structurer l'architecture visuelle principale du produit.

## Ecran `SCR-PLAT-REF-001`

### Page parente

- referentiel officiel

### Vue parente

- vue centre de pilotage plateforme

### Module

- `Plateforme`

### Section

- referentiel officiel

### Objectif metier

Permettre a la gouvernance plateforme de lire, controler, comparer, publier, activer, importer et migrer le referentiel academique officiel sans quitter un meme centre d'administration.

### Acteur principal

- `MANAGER_SYSTEME`

### Acteurs secondaires

- `OPERATEUR_SYSTEME` seulement si les delegations backend explicites sont actives selon le workflow concerne

### Acteurs explicitement refuses

- `SUPPORT_SYSTEME`
- `ADMIN_SYSTEME_ECOLE`
- `ADMINISTRATEUR_ECOLE`
- tout acteur metier d'ecole

### Preconditions de visibilite

- session AUTH valide
- niveau actif `PLATEFORME`
- module `Plateforme` visible
- organisation active non requise
- ecole active non requise
- permission effective :
  - `referentiel.read` pour ouvrir le centre
  - `referentiel.write` pour les mutations

### Permissions

#### Lecture

- permission backend : `referentiel.read`
- usages :
  - consulter le socle officiel
  - consulter les cours
  - consulter les referentiels programmes
  - consulter les details de version
  - comparer deux versions
  - lister les migrations
  - consulter un rapport de migration

#### Mutation

- permission backend : `referentiel.write`
- usages :
  - creer une section officielle
  - creer une classe academique
  - creer une option d'etude
  - importer une composante officielle
  - creer une version de travail non publiee
  - editer les lignes d'une version non publiee
  - publier une version officielle
  - activer une version officielle
  - analyser une migration
  - appliquer une migration
  - annuler une migration non appliquee
  - relancer un recalcul post-migration

### Contraintes de perimetre

- plateforme uniquement
- aucune descente ecole implicite dans la lecture du centre
- pour les mutations de migration :
  - l'action reste initiee depuis la plateforme
  - mais le backend continue de verifier le tenant reel du `ProgrammeNiveau`

## Structure Officielle De La Page

### Bloc 1 - Bandeau de contexte

Le premier bloc doit toujours afficher :

- niveau actif : `Plateforme`
- acteur courant
- statut d'autorisation :
  - lecture autorisee
  - mutation autorisee ou lecture seule
- rappel doctrinal :
  - `socle officiel transverse`
  - distinct de `l'exploitation academique locale`

Ce bloc ne doit jamais etre un hero decoratif.

Il doit etre compact, dense et utile.

### Bloc 2 - Cartes de synthese

Les cartes de synthese doivent rester petites, comparables et orientees pilotage.

Jeu minimal retenu :

- `Sections officielles`
- `Classes academiques`
- `Options d'etudes`
- `Cours officiels`
- `Referentiels programmes`
- `Versions actives`
- `Migrations recentes`

Regles :

- une carte = un chiffre principal + un sous-libelle explicite
- pas de grande carte marketing
- pas de graphique obligatoire dans les cartes
- cliquer une carte peut ouvrir l'onglet associe, mais n'est pas obligatoire

### Bloc 3 - Barre de pilotage

Cette barre reste fixe en haut du contenu du centre.

Elle doit porter :

- recherche globale du centre
- filtres de famille
- filtre de structure :
  - `TRIMESTRIEL`
  - `SEMESTRIEL`
- filtre de statut :
  - actif
  - publie
  - brouillon si visible selon les donnees
- bouton `Actualiser`
- groupe d'actions rapides

Actions rapides retenues :

- `Importer`
- `Publier`
- `Activer`
- `Comparer`
- `Nouvelle migration`

Regle :

- les actions non autorisees sont masquees ou rendues disabled avec raison explicite
- le frontend ne doit pas simuler un droit absent

### Bloc 4 - Zone d'onglets

Le centre officiel est organise en cinq onglets principaux.

#### Onglet 1 - `Socle officiel`

Objectif :

- piloter les structures amont du referentiel

Sous-familles visibles dans l'onglet :

- sections scolaires
- classes academiques
- options d'etudes

Composants attendus :

- segment interne `Sections / Classes / Options`
- tableau principal de la famille selectionnee
- panneau detail lateral
- actions de creation minimales si `referentiel.write`

Cartes locales :

- total de la famille selectionnee
- actifs
- inactifs si exposes
- derniere mutation si disponible

Tableaux attendus :

`Sections`
- code
- libelle
- ordre d'affichage
- actif
- version
- cree le
- modifie le

`Classes academiques`
- code
- libelle
- section
- option si applicable
- cycle
- structure d'evaluation
- finaliste
- EXETAT
- TENASOSP
- actif

`Options d'etudes`
- code
- abreviation
- libelle
- technique
- categorie technique
- ordre d'affichage
- active

Actions visibles :

- consulter le detail
- filtrer
- creer la famille courante

Actions interdites :

- suppression destructive implicite
- mutation locale d'ecole

#### Onglet 2 - `Cours officiels`

Objectif :

- relire le catalogue transverse des cours officiels

Cartes locales :

- total des cours
- avec domaine
- avec sous-domaine
- actifs

Tableau principal :

- code cours
- libelle
- abreviation
- domaine
- sous-domaine
- actif
- version
- cree le
- modifie le

Filtres :

- recherche textuelle
- domaine
- sous-domaine
- statut actif

Actions visibles :

- consulter
- filtrer
- importer les cours

Actions interdites :

- edition inline non prouvee par le backend

#### Onglet 3 - `Referentiels programmes`

Objectif :

- lire les referentiels programmes officiels et leurs versions

Cartes locales :

- total referentiels programmes
- total versions publiees
- total versions actives
- referentiels sans version active

Structure recommandee :

- table des referentiels programmes a gauche ou en haut
- panneau detail du referentiel selectionne
- sous-table des versions officielles
- sous-table ou liste des lignes de version selectionnee

Doctrine de verrouillage :

- une version `publiee` ne peut pas etre modifiee
- une version `active` ne peut pas etre modifiee
- une version deja engagee dans une migration ne peut pas etre modifiee
- seule une version non publiee peut ouvrir des actions d'edition de lignes
- toute correction officielle doit creer ou reutiliser une version de travail distincte

Tableau `Referentiels programmes`

- identifiant referentiel
- classe academique
- structure d'evaluation
- actif
- version active actuelle
- nombre total de versions

Tableau `Versions`

- code version
- annee reference
- date publication
- source import
- publiee
- active
- editable ou verrouillee selon statut
- nombre de lignes
- motif publication si disponible

Tableau `Lignes de version`

- ordre d'affichage
- cours
- obligatoire
- a examen
- calculable
- domaine
- sous-domaine
- resume ponderation

Actions visibles :

- ouvrir un referentiel
- ouvrir une version
- creer une version de travail
- ouvrir les lignes du programme
- publier une version
- activer une version

Actions conditionnelles visibles seulement si la version est non publiee et si `referentiel.write` est effectif :

- ajouter une ligne au programme
- modifier une ligne
- retirer une ligne
- reordonner les lignes
- modifier les ponderations
- modifier obligatoire / a l examen / calculable si le workflow backend le permet
- modifier domaine / sous-domaine si le workflow backend le permet

Actions interdites :

- activer une version non publiee
- publier sans contexte referentiel cible
- edition manuelle d'une version publiee
- edition manuelle d'une version active
- edition d'une version deja engagee en migration
- edition manuelle des lignes si aucune route backend dediee n'existe

#### Mode detail des lignes

Quand une version est ouverte en detail :

- le tableau de gauche des referentiels reste la porte d'entree
- le panneau resume affiche la version selectionnee
- le bouton `Ouvrir les lignes du programme` ouvre un mode detail large interne au centre

Dans ce mode detail :

- les lignes utilisent toute la largeur disponible
- les ponderations doivent etre lisibles
- les actions d'edition sont masquees ou disabled si la version est publiee ou active
- un message metier doit expliquer le verrouillage :
  - `Cette version est publiee et ne peut plus etre modifiee.`
  - `Creez une nouvelle version de travail pour apporter des corrections.`

#### Onglet 4 - `Comparaisons`

Objectif :

- comparer deux versions officielles sans recalcul parallele frontend

Structure recommandee :

- zone de selection :
  - classe academique
  - version source
  - version cible
- resume d'impact
- tableau des differences
- panneau detail d'une difference

Cartes locales :

- total differences
- cours ajoutes
- cours retires
- ordres modifies
- ponderations modifiees
- lignes devenues non calculables

Tableau principal :

- type de difference
- cours concerne
- ancienne valeur
- nouvelle valeur
- impact metier

Actions visibles :

- comparer
- relancer une comparaison
- ouvrir le detail d'une difference

Actions interdites :

- appliquer directement une comparaison

La comparaison reste analytique.

#### Onglet 5 - `Migrations referentielles`

Objectif :

- superviser le cycle complet d'une migration officielle vers un programme local

Structure recommandee :

- filtre programme niveau / statut
- table d'historique des migrations
- panneau rapport
- bloc d'actions critiques

Cartes locales :

- migrations visibles
- brouillons
- analysees
- appliquees
- annulees

Tableau principal :

- identifiant migration
- programme niveau
- ancienne version
- nouvelle version
- date migration
- declenche par
- statut
- resume

Panneau rapport :

- total differences
- total transformations de notes
- liste des diff
- liste des transformations si disponibles

Actions visibles :

- analyser une migration
- consulter un rapport
- appliquer
- annuler
- relancer recalcul

Actions interdites :

- annuler une migration deja appliquee
- appliquer une migration non analysee

## Actions Officielles

### Actions globales de page

- actualiser les donnees
- changer d'onglet
- rechercher
- filtrer
- exporter la table courante si exposee
- imprimer la vue courante si exposee

### Actions critiques

- importer une composante officielle
- publier une version
- activer une version
- analyser une migration
- appliquer une migration
- annuler une migration
- relancer un recalcul

Regle UX :

- toute action critique doit etre contextualisee
- aucune action critique ne doit partir d'un bouton nu sans recapitulatif

## Modales Officielles

### MOD-PLAT-REF-001 - `Importer une composante`

Usage :

- depuis `Socle officiel`
- depuis `Cours officiels`
- depuis `Referentiels programmes`

Champs :

- composante cible
- zone JSON source
- rappel du format attendu
- resume de validation locale si possible

Regles :

- la modale reste compatible avec le backend actuel qui attend un corps JSON
- le frontend peut aider, mais ne doit pas inventer un protocole d'upload absent

### MOD-PLAT-REF-002 - `Publier une version`

Champs :

- referentiel programme
- code version
- annee reference
- date publication
- source import
- motif publication

Le contexte du referentiel cible doit etre visible sans ambiguite.

### MOD-PLAT-REF-002B - `Creer une version de travail`

Champs :

- referentiel programme parent
- version source de reference
- nouveau code version
- annee de reference
- motif de preparation si expose

Regles :

- la nouvelle version creee reste non publiee
- elle sert d'espace exclusif de correction avant publication
- elle ne doit jamais ecraser une version publiee existante

### MOD-PLAT-REF-003 - `Activer une version`

Contenu :

- referentiel parent
- code version
- annee reference
- date publication
- etat actuel
- confirmation explicite

### MOD-PLAT-REF-004 - `Comparer deux versions`

Contenu :

- classe academique
- version source
- version cible
- bouton lancer comparaison

### MOD-PLAT-REF-005 - `Analyser une migration`

Contenu :

- programme niveau
- ancienne version
- nouvelle version
- avertissement de perimetre

### MOD-PLAT-REF-006 - `Rapport de migration`

Contenu :

- en-tete de migration
- stats
- differences
- transformations
- actions disponibles selon statut

## Confirmations Officielles

### CONF-PLAT-REF-001

- confirmation de publication
- message :
  - version
  - referentiel
  - annee de reference

### CONF-PLAT-REF-002

- confirmation d'activation
- message :
  - version cible
  - consequence :
    - nouvelle version active
    - ancienne version desactivee

### CONF-PLAT-REF-003

- confirmation d'application de migration
- message :
  - programme niveau cible
  - version source
  - version cible
  - impact irreversible cote etat de migration

### CONF-PLAT-REF-004

- confirmation d'annulation
- message :
  - annulation reservee aux migrations non appliquees

Regles premium communes :

- le message doit etre court, humain et explicite
- le bouton principal doit nommer l'action reelle
- le bouton secondaire doit etre un vrai refus
- jamais de jargon technique seul

## Tableaux Officiels

### Regles communes

- en desktop :
  - colonnes denses
  - en-tetes visibles
  - tri visuel si disponible
  - ligne cliquable ou action explicite, mais pas les deux en conflit
- en mobile :
  - transformation en cartes ou lignes compactes
  - regroupement des metadonnees secondaires sous la ligne principale

### Regles de lisibilite

- une colonne = une information metier stable
- ne pas afficher d'UUID comme information principale si un libelle metier existe
- l'UUID peut rester accessible dans le detail
- les booleens doivent etre rendus en badges lisibles :
  - `Actif`
  - `Publie`
  - `A examen`
  - `Calculable`

## Etats Obligatoires

### Chargement

Le centre doit supporter :

- loading initial de la page
- loading lors d'un changement d'onglet
- loading de table
- loading de panneau detail
- loading d'action critique

Regle UX :

- preferer les skeletons de cartes et tables aux spinners seuls

### Vide

Etats vides minimaux :

- aucune section
- aucune classe academique
- aucune option
- aucun cours
- aucun referentiel programme
- aucune version publiee
- aucune migration
- aucune comparaison lancee

Chaque etat vide doit :

- expliquer ce qui manque
- proposer l'action legitime si l'acteur peut la faire
- ne jamais afficher un vide technique froid

### Erreur

Types d'erreurs a couvrir :

- non autorise
- permission insuffisante
- perimetre invalide
- ressource introuvable
- payload invalide
- version introuvable
- version verrouillee car publiee
- version verrouillee car active
- version verrouillee car deja engagee dans une migration
- version non publiable
- version non activable
- migration non applicable
- erreur technique serveur

Regle :

- le texte d'erreur doit traduire l'effet metier
- l'erreur technique brute reste masquee sauf en developpement

### Acces refuse

Le centre complet doit afficher un ecran d'acces refuse si `referentiel.read` manque.

Une action interne doit afficher un refus local si :

- la lecture est autorisee
- mais `referentiel.write` manque pour la mutation demandee

## Experience Mobile

### Principes

- le centre reste utilisable depuis mobile
- mais la priorite va a la lecture, au controle et a la confirmation
- les grandes operations de saisie JSON restent possibles, mais compactees proprement

### Structure mobile

Ordre retenu :

1. bandeau contexte compact
2. cartes de synthese scrollables horizontalement
3. barre d'actions rapides secondaire
4. onglets scrollables horizontalement
5. liste ou cartes de l'onglet courant
6. drawer ou bottom sheet pour le detail

### Regles mobiles

- une modale complexe peut devenir un plein ecran mobile
- les tableaux denses deviennent des cartes
- les actions critiques restent en bas d'ecran dans une zone stable si necessaire
- les confirmations ne doivent pas sortir de l'ecran visible

## Regles UX Premium

### Regle 1 - ERP, pas site web marketing

Le centre doit evoquer un poste de pilotage professionnel.

On privilegie :

- densite utile
- clarte des statuts
- rythme visuel sobre
- hierarchie nette

On evite :

- cartes geantes
- graphiques decoratifs
- animations non fonctionnelles
- grands vides inutiles

### Regle 2 - Une action critique doit toujours etre precedee d'un contexte

Avant publication, activation ou migration, l'utilisateur doit toujours voir :

- ce qu'il manipule
- sur quoi l'action porte
- quelle est la consequence

### Regle 3 - Le detail doit etre plus riche que la ligne

La ligne de tableau donne le signal.

Le panneau detail donne :

- metadonnees
- lignes
- statuts
- historique utile

### Regle 4 - Le frontend ne reinterprete pas le backend

Le frontend :

- structure
- resume
- met en forme

Mais il ne recalcule pas :

- la compatibilite des versions
- l'eligibilite d'une activation
- l'effet d'une migration

### Regle 5 - Les identifiants techniques ne doivent pas gouverner la lecture

Si un code de version, un code de classe ou un libelle existe, il devient la cle de lecture visible.

L'identifiant technique reste secondaire.

### Regle 6 - Les mutations doivent etre prudentes

Pas d'auto-submit.

Pas de mutation silencieuse.

Pas de succes ambigu.

Chaque mutation doit produire :

- un loading clair
- un succes clair
- un echec clair

## Etats De Succes

Les succes doivent etre rendus sous forme de toasts ou bannieres modernes et temporaires.

Messages attendus :

- import termine
- version de travail creee
- version publiee
- version activee
- comparaison terminee
- migration analysee
- migration appliquee
- migration annulee
- recalcul relance

Les succes ne doivent pas remplacer la relecture des donnees.

Apres succes, la vue doit rester coherente avec les donnees rechargees.

## Sources Backend Par Onglet

### Socle officiel

- `GET /api/sections-scolaires`
- `POST /api/sections-scolaires`
- `GET /api/classes-academiques`
- `POST /api/classes-academiques`
- `GET /api/options-etudes`
- `POST /api/options-etudes`

### Cours officiels

- `GET /api/referentiels/cours`
- `POST /api/referentiels/import-cours`

### Referentiels programmes

- `GET /api/referentiels/programmes`
- `GET /api/referentiels/programmes/:id`
- `POST /api/referentiels/versions`
- `POST /api/referentiels/versions/:id/activer`
- `POST /api/referentiels/import-programmes`
- `POST /api/referentiels/import-lignes`

### Comparaisons

- `POST /api/referentiels/comparer`

### Migrations

- `GET /api/migrations-referentiel`
- `GET /api/migrations-referentiel/:id`
- `POST /api/migrations-referentiel/analyser`
- `POST /api/migrations-referentiel/appliquer`
- `POST /api/migrations-referentiel/:id/annuler`
- `POST /api/migrations-referentiel/:id/relancer-recalcul`

## Ce Qu'Il Ne Faut Surtout Pas Faire

- remettre `Publication`, `Activation`, `Import`, `Comparaison` et `Migration` comme menus primaires separes
- remelanger le centre plateforme avec les pages locales d'ecole
- exposer des mutations non prouvees par le backend
- afficher le JSON brut comme experience cible finale
- imposer des UUID comme parcours principal de lecture
- dupliquer les regles de versions dans le frontend
- laisser un acteur lecture seule croire qu'il peut muter

## Verdict

La doctrine ecran complete du `Referentiel officiel Plateforme` est maintenant posee.

Le centre officiel doit etre lu ainsi :

- un seul point d'entree visuel
- cinq onglets stables
- des actions internes prudentes
- des modales de mutation
- des confirmations explicites
- un rendu dense et premium
- une lecture stricte en `permission + perimetre`

La suite legitime n'est plus un audit metier, mais l'implementation UI fidele de ce centre.
