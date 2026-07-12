# Phase 55 - Maquette Centre Configuration

## Statut

Ce document ouvre la maquette operationnelle officielle du centre `Configuration`.

Il ne cree :

- aucun nouveau workflow
- aucun nouvel acteur
- aucune nouvelle permission
- aucune nouvelle route backend
- aucune nouvelle regle metier

Il traduit uniquement en maquette operatoire :

- la doctrine [54-doctrine-centre-configuration.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/54-doctrine-centre-configuration.md)
- les workflows `Configuration` deja figes
- les contrats d'ecran [28-contrats-ecran-configuration.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/28-contrats-ecran-configuration.md)
- la logique reelle `Plateforme -> Organisation -> Ecole -> Utilisateur`

## Objectif

Definir la materialisation ecran premium, coherente et directement implementable du centre `Configuration`, afin que le frontend implemente :

- un centre unique de gouvernance des reglages
- une lecture claire du niveau courant
- une separation nette entre autorisation, activation et disponibilite reelle
- une gestion prudente des actions critiques
- une experience homogène avec les autres centres Plateforme d'EduSync

Ce centre ne doit jamais ressembler :

- a un panneau technique de developpeur
- a un fourre-tout transverse
- a un faux module d'administration generale
- a un doublon d'Administration Ecole, de Securite, de Referentiel ou de Provisionnement

## Sources De Verite

Cette maquette s'appuie exclusivement sur :

- [28-contrats-ecran-configuration.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/28-contrats-ecran-configuration.md)
- [31-synthese-contrats-ecran.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/31-synthese-contrats-ecran.md)
- [32-maquettes-shell-global.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/32-maquettes-shell-global.md)
- [54-doctrine-centre-configuration.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/54-doctrine-centre-configuration.md)
- [13-workflows-transverses.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/13-workflows-transverses.md)
- [16-navigation-par-acteur.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/16-navigation-par-acteur.md)
- [17-navigation-par-module.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/17-navigation-par-module.md)
- [18-pages-et-routes-frontend.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/18-pages-et-routes-frontend.md)

Le backend reste la source ultime de verite.

## Doctrine De Maquettage

### Regle 1

Le produit officiel doit etre un seul point d'entree visuel :

- `Centre Configuration`

Le menu ne doit pas disperser l'utilisateur entre plusieurs mini-pages qui donnent l'impression de changer de produit.

### Regle 2

Le centre doit toujours afficher en premier :

- le niveau courant
- le perimetre courant
- les droits reellement disponibles
- la famille de reglages ouverte

### Regle 3

Le centre doit parler un langage metier naturel.

Il ne doit jamais afficher comme libelles principaux :

- `runtime`
- `override`
- `effective configuration`
- `reload`
- `snapshot`
- `lock`
- `unlock`
- `propagation`

Les equivalents visibles sont ceux de la doctrine 54.

### Regle 4

Les tableaux restent prioritaires sur les graphiques.

Le coeur de lecture est :

- liste
- detail
- valeur appliquee
- origine
- statut
- action autorisee

### Regle 5

Les actions critiques restent dans le centre lui-meme.

Elles ne doivent pas etre projetees comme :

- menus independants
- pages mortes
- boutons geants de tableau de bord

### Regle 6

Toute action critique doit toujours etre precedee de :

- rappel du perimetre
- rappel de la famille concernee
- resume de l'impact attendu
- confirmation explicite

### Regle 7

L'interface doit appartenir a la meme famille visuelle que :

- `Referentiel officiel Plateforme`
- `Administration Ecole`
- les futurs centres `Securite`, `Monitoring` et `Notifications`

Les cartes, tableaux, barres d'actions, modales, toasts, etats vides et confirmations doivent donc rester structurellement coherents.

## MCC-01

### Identifiant

- `MCC-01`

### Nom

- `Centre Configuration`

### Objectif metier

Permettre a l'acteur autorise de gouverner les reglages du niveau courant depuis un centre unique, en distinguant clairement :

- les reglages communs
- les reglages locaux
- les modules autorises
- les modules actifs
- la configuration appliquee
- les versions enregistrees
- les verifications et actions critiques

### Acteurs autorises

Selon le niveau courant et les permissions deja prouvees :

- `MANAGER_SYSTEME`
- `OPERATEUR_SYSTEME`
- `SUPPORT_SYSTEME` en lecture seule la ou la preuve existe
- `PROMOTEUR_ORGANISATION`
- `ADMIN_SYSTEME_ORGANISATION`
- `GESTIONNAIRE_ORGANISATION` en lecture selon la preuve
- `ADMIN_SYSTEME_ECOLE`
- `ADMINISTRATEUR_ECOLE` selon la famille de reglage et la preuve
- `UTILISATEUR` proprietaire pour ses preferences personnelles

### Acteurs explicitement refuses

Le centre ne doit pas afficher des actions non prouvees pour :

- un acteur hors perimetre courant
- un acteur sans permission backend adequate
- un lecteur simple sur une action de mutation

## Structure Officielle Du Centre

### Entree visuelle officielle

- route produit officielle :
  - `/app/configuration`

Les routes secondaires existantes peuvent rester comme points d'entree techniques ou deep-links, mais l'entree produit doit etre un centre unique.

### Onglets officiels retenus

Le centre doit afficher ses familles sous forme d'onglets internes.

Ordre officiel retenu :

1. `Parametres de la plateforme`
2. `Autres reglages globaux`
3. `Politiques communes`
4. `Modules autorises`
5. `Regles de gouvernance`
6. `Limites de fonctionnement`
7. `Autres reglages de l organisation`
8. `Modules actives`
9. `Identite visuelle`
10. `Notifications`
11. `Autres reglages de l ecole`
12. `Preferences personnelles`
13. `Preferences de notification`

Règle de visibilite :

- un onglet est visible seulement s'il existe dans le perimetre courant et si l'acteur peut au minimum le consulter
- un onglet non autorise ne doit ni apparaitre, ni laisser un trou vide

### Correspondance avec les ecrans reels

- `SCR-CFG-001` -> `Parametres de la plateforme`
- `SCR-CFG-001` -> `Autres reglages globaux`
- `SCR-CFG-002` -> `Politiques communes`
- `SCR-CFG-002` -> `Modules autorises`
- `SCR-CFG-002` -> `Regles de gouvernance`
- `SCR-CFG-002` -> `Limites de fonctionnement`
- `SCR-CFG-002` -> `Autres reglages de l organisation`
- `SCR-CFG-003` -> `Modules actives`
- `SCR-CFG-004` -> `Identite visuelle`
- `SCR-CFG-005` -> `Notifications`
- `SCR-CFG-003` -> `Autres reglages de l ecole`
- `SCR-CFG-006` -> `Preferences personnelles`
- `SCR-CFG-006` -> `Preferences de notification`

## Version Desktop

La version desktop doit etre un centre de travail dense, stable et lisible.

Structure officielle retenue :

1. bandeau de contexte
2. barre de synthese
3. barre d'actions et filtres
4. onglets internes
5. zone de travail principale
6. panneau de detail contextuel
7. modales de mutation critique

### Bloc 1 - Bandeau de contexte

Le bandeau doit toujours afficher :

- niveau actif
- acteur courant
- perimetre courant
- statut d'autorisation :
  - lecture seule
  - modifications autorisees
- phrase de contexte courte

Exemples :

- `Vous pilotez ici les parametres globaux de la plateforme.`
- `Vous configurez actuellement l organisation Groupe scolaire X.`
- `Vous configurez actuellement l ecole College Y.`
- `Vous modifiez vos preferences personnelles.`

### Bloc 2 - Barre de synthese

La barre de synthese doit contenir 4 cartes maximum.

Cartes officielles autorisees :

- `Reglages visibles`
- `Reglages modifies localement`
- `Versions enregistrees`
- `Alertes a verifier`

Règles :

- ne jamais depasser quatre cartes
- ne jamais afficher une carte vide sans utilite
- remplacer une carte non pertinente par une carte de synthese equivalente au perimetre courant

Exemples par onglet :

- `Parametres de la plateforme`
  - reglages visibles
  - reglages verrouilles
  - versions enregistrees
  - points a verifier
- `Politiques communes`
  - reglages visibles
  - reglages personnalises
  - versions enregistrees
  - points a verifier
- `Modules autorises`
  - modules visibles
  - modules autorises
  - versions enregistrees
  - modules a verifier
- `Modules actives`
  - modules autorises
  - modules actives
  - modules disponibles
  - points a verifier
- `Identite visuelle`
  - reglages visibles
  - reglages personnalises
  - versions enregistrees
  - points a verifier
- `Notifications`
  - reglages visibles
  - reglages personnalises
  - versions enregistrees
  - points a verifier
- `Preferences personnelles`
  - preferences visibles
  - preferences personnalisees
  - dernieres modifications
  - points a verifier

### Bloc 3 - Barre d'actions et filtres

La barre doit etre horizontale sur desktop, stable et de meme hauteur visuelle que les autres centres Plateforme.

Ordre visuel officiel :

1. recherche
2. filtre par statut
3. filtre par famille ou sous-famille si utile
4. bouton `Effacer les filtres`
5. groupe d'actions principales

Actions principales potentiellement visibles selon l'onglet, la permission et le perimetre :

- `Ajouter un reglage`
- `Modifier`
- `Supprimer`
- `Verifier`
- `Verrouiller les modifications`
- `Autoriser les modifications`
- `Enregistrer une version`
- `Comparer des versions`
- `Appliquer aux niveaux concernes`
- `Actualiser`
- `Personnaliser ici`
- `Voir la configuration appliquee`

Règles :

- les actions non autorisees sont masquees, pas seulement desactivees, sauf si leur presence pedagogique est utile
- si une action est affichee en etat desactive, un texte court doit expliquer pourquoi
- `Supprimer` n'apparait que dans les familles et niveaux ou la capacite est reellement prouvee

### Bloc 4 - Onglets

Les onglets doivent etre centres visuellement dans leur conteneur.

Ils doivent utiliser :

- meme hauteur
- meme rayons
- meme logique active/inactive
- meme comportement responsive que les autres centres premium

En mobile :

- ils deviennent scrollables horizontalement
- l'onglet actif reste toujours visible

### Bloc 5 - Zone de travail principale

La zone de travail doit suivre une structure `liste + detail`.

#### Panneau gauche

Contient :

- le tableau principal de la famille ouverte
- la recherche locale
- les filtres de second niveau si necessaires

#### Panneau droit

Contient :

- le detail du reglage selectionne
- sa valeur appliquee
- son origine
- son statut
- ses actions contextuelles
- l'historique utile

Règle :

- le detail ne doit jamais ressembler a une fiche technique brute
- il doit expliquer la situation de maniere lisible pour un acteur metier

### Bloc 6 - Tiroirs et modales internes

Les sous-actions doivent ouvrir :

- une modale centree pour les confirmations ou editions courtes
- un panneau lateral pour le detail d'une version enregistree, d'une comparaison ou d'une verification
- un plein ecran interne sur mobile pour conserver le confort

## Version Mobile

La version mobile doit conserver toute la logique du centre sans tenter de reproduire la densite desktop a l'identique.

Structure officielle retenue :

1. bandeau de contexte compact
2. cartes de synthese en carrousel horizontal ou grille 2x2
3. barre d'actions secondaire compactee
4. onglets scrollables
5. liste principale
6. detail en plein ecran, drawer ou bottom sheet

Règles :

- les boutons critiques doivent rester suffisamment larges
- les filtres doivent se regrouper dans une feuille modale
- les tableaux larges deviennent cartes resumees ou tableau scrollable propre
- aucune information essentielle ne doit dependre d'un survol

## Detail Par Onglet

## Onglet 1 - Parametres de la plateforme

### Objectif

Piloter les reglages globaux de la plateforme, leur verification, leurs versions enregistrees, leur verrouillage et leur application.

### Tableau principal

Colonnes officielles :

- reglage
- categorie
- valeur actuelle
- configuration appliquee
- statut
- derniere mise a jour
- actions

### Filtres utiles

- recherche
- statut
- categorie
- verrouille / modifiable

### Panneau detail

Le detail doit afficher :

- nom clair du reglage
- description metier courte
- valeur definie
- valeur appliquee
- origine
- statut de modification
- historique recent
- versions enregistrees disponibles
- dernier controle effectue

### Actions visibles

- ajouter un reglage
- modifier
- supprimer si autorise
- verifier
- verrouiller les modifications
- autoriser les modifications
- enregistrer une version
- comparer des versions
- appliquer aux niveaux concernes
- actualiser
- voir la configuration appliquee

## Onglet 2 - Politiques communes

### Objectif

Gerer les regles communes de l'organisation.

### Tableau principal

Colonnes officielles :

- politique
- categorie
- valeur
- configuration appliquee
- impact
- statut
- actions

### Cartes specifiques

- politiques visibles
- reglages personnalises
- points a verifier

### Panneau detail

Le detail doit afficher :

- politique selectionnee
- description
- valeur definie
- valeur appliquee
- ecoles concernees si la donnee existe deja
- statut
- historique recent

### Actions visibles

- ajouter un reglage
- modifier
- supprimer si autorise
- verifier
- verrouiller les modifications
- autoriser les modifications
- enregistrer une version
- comparer des versions
- appliquer aux niveaux concernes
- voir la configuration appliquee

## Onglet 3 - Modules autorises

### Objectif

Permettre a l organisation de choisir les modules qu elle ouvre a ses ecoles, sans exposer la cle technique du backend.

### Tableau principal

Colonnes officielles :

- module
- cadre
- statut
- disponibilite

### Lecture obligatoire

Le tableau doit permettre de comprendre sans ambiguite :

- quels modules sont visibles dans le catalogue
- quels modules sont autorises pour l organisation
- quels modules restent encore fermes

### Actions visibles

- enregistrer les modules autorises
- verifier
- ouvrir un reglage existant si necessaire

## Onglet 4 - Regles de gouvernance

### Objectif

Afficher et gerer les regles de gouvernance commune de l organisation.

## Onglet 5 - Limites de fonctionnement

### Objectif

Afficher et gerer les seuils et limites communs de l organisation.

## Onglet 6 - Autres reglages de l organisation

### Objectif

Afficher les autres reglages propres au fonctionnement general de l organisation.

## Onglet 7 - Modules actives de l'ecole

### Objectif

Permettre de lire et gerer les modules actives de l'ecole dans le cadre autorise par l'organisation, tout en rendant visible la disponibilite reelle.

### Tableau principal

Colonnes officielles :

- module
- autorise par l'organisation
- active dans l'ecole
- disponible pour l'usage
- derniere mise a jour
- actions

### Lecture obligatoire

Le tableau doit permettre de comprendre sans ambiguite :

- ce qui est autorise
- ce qui est active
- ce qui est reellement disponible

Il ne faut jamais fusionner ces trois informations dans un seul badge confus.

### Cartes specifiques

- modules autorises
- modules actives
- modules disponibles
- modules a verifier

### Actions visibles

- activer dans l'ecole
- desactiver dans l'ecole
- voir la configuration appliquee
- actualiser

Actions explicitement interdites dans cet onglet :

- autoriser un module au niveau organisation si le contexte courant est ecole
- modifier une configuration plateforme

## Onglet 8 - Identite visuelle

### Objectif

Gerer les reglages d'identite visuelle de l'ecole dans le cadre autorise.

### Tableau principal

Colonnes officielles :

- element
- valeur actuelle
- configuration appliquee
- origine
- statut
- actions

### Panneau detail

Le detail doit afficher :

- element selectionne
- valeur definie
- valeur appliquee
- origine de la valeur
- possibilite ou non de personnalisation locale
- historique recent

### Actions visibles

- ajouter un reglage
- modifier
- verifier
- verrouiller les modifications
- autoriser les modifications
- enregistrer une version
- comparer des versions
- appliquer aux niveaux concernes
- voir la configuration appliquee
- personnaliser ici

## Onglet 9 - Notifications

### Objectif

Gerer les reglages locaux de notification de l'ecole sans exposer le vocabulaire technique du moteur.

### Tableau principal

Colonnes officielles :

- reglage
- canal ou famille
- valeur actuelle
- configuration appliquee
- statut
- actions

### Cartes specifiques

- reglages visibles
- reglages personnalises
- versions enregistrees
- points a verifier

### Actions visibles

- ajouter un reglage
- modifier
- verifier
- verrouiller les modifications
- autoriser les modifications
- enregistrer une version
- comparer des versions
- appliquer aux niveaux concernes
- actualiser
- voir la configuration appliquee
- personnaliser ici

## Onglet 10 - Autres reglages de l ecole

### Objectif

Afficher les reglages `school.*` deja portes par le backend, sans inventer de champs absents.

## Onglet 11 - Preferences personnelles

### Objectif

Permettre a l'utilisateur de gerer ses preferences personnelles sans lui donner de pouvoir sur les reglages globaux.

### Tableau principal

Colonnes officielles :

- preference
- valeur
- configuration appliquee
- derniere mise a jour
- actions

### Actions visibles

- ajouter une preference
- modifier
- voir la configuration appliquee

Actions explicitement interdites :

- verrouiller les modifications
- appliquer aux niveaux concernes
- actualiser un parametre global
- gerer les modules

## Onglet 12 - Preferences de notification

### Objectif

Permettre a l utilisateur de regler ses preferences personnelles de notification sans agir sur les reglages globaux de l ecole ou de la plateforme.

## Tableaux

Tous les tableaux du centre doivent respecter la meme doctrine visuelle que les autres centres premium :

- en-tete sobre et lisible
- colonnes bien alignees
- hauteur de ligne stable
- badges de statut sobres
- actions compactes a droite
- sticky header si la densite le justifie
- aucun style brut de bibliotheque

### Pagination

Le centre doit utiliser la pagination moderne deja retenue dans le projet :

- chargement progressif
- bouton `Afficher plus` ou infinite scroll maitrise selon la table
- jamais de pagination numerotee traditionnelle

## Modales Et Assistants

### Modale d'ajout ou de modification

Doit contenir :

- titre clair
- rappel du niveau et du perimetre
- champs compréhensibles
- resume de l'impact si disponible
- boutons :
  - `Annuler`
  - `Enregistrer`

### Modale de verification

Doit afficher :

- resultat global
- points valides
- points a corriger
- message final compréhensible

### Modale de comparaison

Doit afficher en deux colonnes ou en liste differee :

- version de reference
- version comparee
- changements constates
- differences importantes

### Modale de personnalisation locale

Doit rappeler :

- la valeur commune actuelle
- la valeur locale proposee
- l'origine du reglage
- si la personnalisation locale est autorisee

## Confirmations Critiques

Les confirmations critiques doivent etre modernes, centrees et explicites.

### Confirmations obligatoires

- suppression
- verrouillage des modifications
- reouverture des modifications
- application aux niveaux concernes
- actualisation d'un parametre sensible

### Forme attendue

Chaque confirmation doit afficher :

- l'action
- le reglage concerne
- le perimetre concerne
- une consequence courte et compréhensible

Exemples :

- `Vous etes sur le point de supprimer ce reglage. Cette action retirera sa valeur definie pour ce niveau. Voulez-vous continuer ?`
- `Vous etes sur le point de verrouiller les modifications de ce reglage. Les niveaux inferieurs ne pourront plus le personnaliser selon les regles en vigueur. Voulez-vous continuer ?`
- `Vous etes sur le point d'appliquer cette modification aux niveaux concernes. Verifiez son impact avant de confirmer.`

## Etats Officiels

### Chargement

Le chargement doit utiliser :

- skeleton loaders ressemblant a la vraie page
- des cartes placeholder
- un tableau placeholder
- un detail placeholder

### Etat vide

L'etat vide doit contenir :

- une icone
- un titre
- une phrase courte
- une action principale si elle existe

Exemples :

- `Aucun reglage n'est encore enregistre pour ce niveau.`
- `Aucune preference personnelle n'a encore ete definie.`

### Erreur

L'etat d'erreur doit rester metier et rassurant.

Exemples :

- `Le centre n'a pas pu charger ces reglages pour le moment.`
- `Une action demandee n'a pas pu etre finalisee.`

Il ne faut jamais afficher :

- stack trace
- nom d'exception
- DTO
- payload
- message technique brut

### Acces refuse

Le message doit expliquer simplement :

- que l'action n'est pas autorisee
- ou que le perimetre courant ne permet pas cette action

Exemples :

- `Vous n'etes pas autorise a modifier ces reglages.`
- `Le niveau actuellement selectionne ne permet pas cette action.`

## Règles UX Officielles

### Regle UX 1

Le regard doit toujours comprendre rapidement :

- ou suis-je
- que puis-je faire
- que se passe-t-il si j'agis

### Regle UX 2

Les informations importantes doivent suivre cet ordre visuel :

1. contexte
2. indicateurs
3. actions
4. tableau
5. detail

### Regle UX 3

La densite doit etre maitrisee :

- pas d'ecran vide
- pas de surcharge de cartes
- pas de blocs geants inutiles

### Regle UX 4

Les actions importantes doivent etre visibles sans etre agressives.

Le centre doit donner confiance, pas provoquer du stress.

### Regle UX 5

Un utilisateur qui a appris un centre Plateforme doit retrouver les memes reflexes ici :

- meme bandeau de contexte
- meme grammaire de cartes
- meme logique de tableau
- meme systeme de filtres
- meme comportement des modales
- meme qualite de messages

## Verdict De Maquette

Cette maquette constitue la reference officielle du `Centre Configuration`.

Elle permet d'ouvrir l'implementation UI sans redecider :

- la structure du centre
- les onglets
- la disposition desktop et mobile
- les cartes utiles
- les tableaux
- les filtres
- les actions visibles
- les actions critiques
- les modales
- les confirmations
- les etats
- les regles UX

## Statut De Figement

`MAQUETTE CENTRE CONFIGURATION FIGEE`
