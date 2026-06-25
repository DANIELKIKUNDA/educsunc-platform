# Phase 22 - Contrats D'Ecran Finances

## Statut

Ce document ouvre les premiers contrats d'ecran reels du module `Paiements et facturation`.

Il ne couvre pas encore tous les ecrans financiers possibles.

Il commence par les ecrans les plus structurants, les plus centraux et les mieux figes :

- perception de paiement
- caisse
- historique des paiements
- situation financiere
- recus
- analyses financieres principales

Ce document doit etre lu comme la premiere declinaison concrete de [21-contrats-ecran.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/21-contrats-ecran.md).

## Sources De Verite

Ce document s'appuie exclusivement sur :

- [09-workflows-financiers.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/09-workflows-financiers.md)
- [14-cartographie-finale-workflows.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/14-cartographie-finale-workflows.md)
- [16-navigation-par-acteur.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/16-navigation-par-acteur.md)
- [17-navigation-par-module.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/17-navigation-par-module.md)
- [18-pages-et-routes-frontend.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/18-pages-et-routes-frontend.md)
- [19-vues-frontend.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/19-vues-frontend.md)
- [20-composants-ui.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/20-composants-ui.md)
- [21-contrats-ecran.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/21-contrats-ecran.md)

Le backend reste la source ultime de verite.

## Regles De Lecture

1. Ces contrats d'ecran ne valent pas encore maquettes finales.
2. Un ecran ne doit jamais promettre plus que le workflow `PF-*` rattache.
3. Les acteurs secondaires restent soumis a `permission + perimetre + parametrage ecole` si applicable.
4. `CAISSIER` reste l'acteur operationnel principal du module.
5. Les acteurs delegues ne doivent jamais etre projetes comme caissiers universels.

## Ecran `SCR-PF-001`

### Page parente

- perception de paiement

### Vue parente

- vue formulaire / action

### Module

- `Paiements et facturation`

### Section

- perception

### Objectif metier

Permettre l'enregistrement d'un paiement autorise dans le bon perimetre, avec priorite au percepteur reel et respect des delegations locales par type de frais.

### Acteur principal

- `CAISSIER`

### Acteurs secondaires

- `ADMINISTRATEUR_ECOLE`
- `PREFET_ETUDES` selon delegation
- `DIRECTEUR_PRIMAIRE` selon delegation
- `DIRECTEUR_MATERNELLE` selon delegation

### Preconditions de visibilite

- module finance actif
- organisation active
- ecole active
- droit reel de perception
- pour les acteurs delegues : delegation locale explicite sur le type de frais

### Donnees attendues

- eleve cible
- obligations financieres exigibles
- types de frais autorises
- mode de paiement disponible
- contexte ecole et annee scolaire utiles

### Donnees affichees

- identite eleve
- frais exigibles
- type de frais choisi
- montant saisi
- mode de paiement
- recapitulatif de l'operation

### Actions visibles

- enregistrer le paiement
- changer de type de frais
- verifier l'eleve cible

### Actions masquees ou interdites

- perception de `FRAIS_MINERVAL` pour les acteurs delegues non naturels
- perception hors ecole
- perception hors section pour les acteurs sectionnels

### Etats obligatoires

- loading
- eleve introuvable
- aucun frais exigible
- type de frais interdit
- non autorise
- succes d'enregistrement
- erreur technique

### Contraintes de perimetre

- `CAISSIER` : meme ecole
- `ADMINISTRATEUR_ECOLE` : meme ecole
- `PREFET_ETUDES` : section secondaire uniquement si delegation
- `DIRECTEUR_PRIMAIRE` : section primaire uniquement si delegation
- `DIRECTEUR_MATERNELLE` : section maternelle uniquement si delegation

### Composants majeurs attendus

- bandeau de contexte eleve
- bloc frais exigibles
- formulaire de perception
- recapitulatif d'operation
- panneau d'erreur ou d'interdiction

### Sources backend

- `PF-01`
- [09-workflows-financiers.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/09-workflows-financiers.md)

### Notes d'UX

- l'ecran doit rester clairement percu comme un ecran de caisse
- les acteurs delegues doivent voir leur perimetre de validite explicitement

## Ecran `SCR-PF-002`

### Page parente

- ouverture de caisse

### Vue parente

- vue action

### Module

- `Paiements et facturation`

### Section

- caisse

### Objectif metier

Permettre l'ouverture de la caisse du jour par le seul acteur local officiellement retenu.

### Acteur principal

- `CAISSIER`

### Acteurs secondaires

- aucun

### Preconditions de visibilite

- module finance actif
- organisation active
- ecole active
- acteur `CAISSIER` actif dans le bon perimetre

### Donnees attendues

- etat de la caisse du jour
- contexte ecole

### Donnees affichees

- statut de la caisse
- informations de contexte
- confirmation d'ouverture

### Actions visibles

- ouvrir la caisse

### Actions masquees ou interdites

- toute mutation caisse pour `ADMINISTRATEUR_ECOLE`
- toute mutation caisse pour les acteurs pedagogiques

### Etats obligatoires

- loading
- caisse deja ouverte
- non autorise
- succes
- erreur technique

### Contraintes de perimetre

- meme organisation
- meme ecole

### Composants majeurs attendus

- resume caisse
- bloc d'action unique
- confirmation

### Sources backend

- `PF-02`

### Notes d'UX

- l'ecran doit etre minimal, sans ambiguity sur le fait qu'il s'agit d'un workflow strictement `CAISSIER`

## Ecran `SCR-PF-003`

### Page parente

- cloture de caisse

### Vue parente

- vue action

### Module

- `Paiements et facturation`

### Section

- caisse

### Objectif metier

Permettre la cloture de la caisse du jour par le seul acteur local officiellement retenu.

### Acteur principal

- `CAISSIER`

### Acteurs secondaires

- aucun

### Preconditions de visibilite

- module finance actif
- caisse ouverte
- `CAISSIER` actif dans la bonne ecole

### Donnees attendues

- etat caisse du jour
- resume des encaissements du jour

### Donnees affichees

- statut caisse
- synthese du jour
- confirmation de cloture

### Actions visibles

- cloturer la caisse

### Actions masquees ou interdites

- cloture implicite pour `ADMINISTRATEUR_ECOLE`

### Etats obligatoires

- loading
- caisse non ouverte
- non autorise
- succes
- erreur technique

### Contraintes de perimetre

- meme organisation
- meme ecole

### Composants majeurs attendus

- resume encaissements
- bloc confirmation cloture

### Sources backend

- `PF-03`

## Ecran `SCR-PF-004`

### Page parente

- caisse du jour

### Vue parente

- vue centre de travail

### Module

- `Paiements et facturation`

### Section

- caisse

### Objectif metier

Permettre la consultation de la caisse du jour dans le bon perimetre local ou organisationnel.

### Acteur principal

- `CAISSIER`

### Acteurs secondaires

- `ADMINISTRATEUR_ECOLE`
- `GESTIONNAIRE_ORGANISATION`
- `PROMOTEUR_ORGANISATION`

### Preconditions de visibilite

- module finance actif
- contexte organisation ou ecole valide

### Donnees attendues

- resume caisse du jour
- montant total
- operations du jour

### Donnees affichees

- synthese journee
- liste des operations
- indicateurs de caisse

### Actions visibles

- filtrer
- consulter le detail d'une operation

### Actions masquees ou interdites

- mutation locale de caisse pour les lecteurs non caissiers

### Etats obligatoires

- loading
- aucune operation
- non autorise
- erreur technique

### Contraintes de perimetre

- `CAISSIER` et `ADMINISTRATEUR_ECOLE` : meme ecole
- `GESTIONNAIRE_ORGANISATION` et `PROMOTEUR_ORGANISATION` : meme organisation

### Composants majeurs attendus

- KPI de caisse
- tableau operations
- filtres jour / acteur / type

### Sources backend

- `PF-04`

## Ecran `SCR-PF-005`

### Page parente

- historique des paiements d'un eleve

### Vue parente

- vue detail / historique

### Module

- `Paiements et facturation`

### Section

- historique paiements

### Objectif metier

Permettre la consultation de l'historique des paiements d'un eleve dans le bon perimetre et selon les delegations officielles.

### Acteur principal

- `CAISSIER`

### Acteurs secondaires

- `ADMINISTRATEUR_ECOLE`
- `GESTIONNAIRE_ORGANISATION`
- `PROMOTEUR_ORGANISATION`
- `TITULAIRE` selon delegation
- `PARENT`
- `PREFET_ETUDES` selon delegation
- `DIRECTEUR_ETUDES` selon delegation
- `DIRECTEUR_PRIMAIRE` selon delegation
- `DIRECTEUR_MATERNELLE` selon delegation

### Preconditions de visibilite

- module finance actif
- eleve cible connu
- permission de lecture financiere satisfaite
- delegation active si acteur pedagogique delegue
- rattachement famille si `PARENT`

### Donnees attendues

- identite eleve
- historique des paiements
- details des operations

### Donnees affichees

- timeline ou tableau historique
- montants
- types de frais
- dates et percepteurs

### Actions visibles

- filtrer l'historique
- consulter le detail d'un paiement

### Actions masquees ou interdites

- lecture hors classe pour `TITULAIRE`
- lecture hors enfants autorises pour `PARENT`

### Etats obligatoires

- loading
- historique vide
- eleve introuvable
- non autorise
- erreur technique

### Contraintes de perimetre

- `TITULAIRE` : classe titulaire effective + bonne annee
- `PARENT` : enfants autorises uniquement
- acteurs sectionnels : section + parametrage ecole
- lecteurs organisationnels : meme organisation

### Composants majeurs attendus

- bandeau eleve
- tableau / timeline paiements
- filtres

### Sources backend

- `PF-05`

## Ecran `SCR-PF-006`

### Page parente

- situation financiere d'un eleve

### Vue parente

- vue detail

### Module

- `Paiements et facturation`

### Section

- dette et situation financiere

### Objectif metier

Permettre la lecture synthétique de la situation financiere d'un eleve dans le bon perimetre.

### Acteur principal

- `CAISSIER`

### Acteurs secondaires

- `ADMINISTRATEUR_ECOLE`
- `GESTIONNAIRE_ORGANISATION`
- `PROMOTEUR_ORGANISATION`
- `TITULAIRE` selon delegation
- `PARENT`
- `PREFET_ETUDES` selon delegation
- `DIRECTEUR_ETUDES` selon delegation
- `DIRECTEUR_PRIMAIRE` selon delegation
- `DIRECTEUR_MATERNELLE` selon delegation

### Preconditions de visibilite

- module finance actif
- eleve cible connu
- lecture financiere autorisee dans le bon perimetre

### Donnees attendues

- identite eleve
- dette courante
- frais exigibles
- arrieres

### Donnees affichees

- solde etat courant
- liste des obligations
- frais exigibles
- alertes de dette

### Actions visibles

- consulter le detail
- basculer vers historique

### Actions masquees ou interdites

- ecriture si l'ecran est purement de lecture

### Etats obligatoires

- loading
- aucune dette / aucun frais
- eleve introuvable
- non autorise
- erreur technique

### Contraintes de perimetre

- memes regles que `PF-06`

### Composants majeurs attendus

- carte situation financiere
- liste obligations
- bloc frais exigibles

### Sources backend

- `PF-06`

## Ecran `SCR-PF-007`

### Page parente

- recu de paiement

### Vue parente

- vue detail documentaire

### Module

- `Paiements et facturation`

### Section

- recus

### Objectif metier

Permettre la consultation, la relecture ou la reimpression d'un recu dans le bon perimetre documentaire.

### Acteur principal

- `CAISSIER`

### Acteurs secondaires

- percepteur reel delegue autorise pour la signature portee

### Preconditions de visibilite

- recu existant
- lecture ou reimpression autorisee
- meme ecole

### Donnees attendues

- recu officiel complet
- identite ecole
- identite eleve
- lignes de paiement

### Donnees affichees

- recu officiel
- total
- montant en lettres
- signature / cachet si disponibles

### Actions visibles

- afficher
- imprimer / exporter

### Actions masquees ou interdites

- reimpression implicite pour `ADMINISTRATEUR_ECOLE`

### Etats obligatoires

- loading
- recu introuvable
- non autorise
- erreur de rendu

### Contraintes de perimetre

- perimetre local de l'ecole
- percepteur reel autorise pour la signature documentaire

### Composants majeurs attendus

- viewer document
- bloc identite ecole
- bloc detail paiements

### Sources backend

- `PF-07`
- `PF-09`
- `PF-19`

## Ecran `SCR-PF-008`

### Page parente

- analyse paiements par type de frais

### Vue parente

- vue analyse

### Module

- `Paiements et facturation`

### Section

- rapports et analyses

### Objectif metier

Permettre la lecture analytique des paiements agreges par type de frais dans le bon perimetre.

### Acteur principal

- `CAISSIER`

### Acteurs secondaires

- `ADMINISTRATEUR_ECOLE`
- `GESTIONNAIRE_ORGANISATION`
- `PROMOTEUR_ORGANISATION`
- `TITULAIRE` selon delegation
- `PREFET_ETUDES` selon delegation
- `DIRECTEUR_ETUDES` selon delegation
- `DIRECTEUR_PRIMAIRE` selon delegation
- `DIRECTEUR_MATERNELLE` selon delegation

### Preconditions de visibilite

- module finance actif
- lecteur analytique autorise
- delegation locale si acteur pedagogique

### Donnees attendues

- aggregation par type de frais
- montants
- volumes
- perimetre applique

### Donnees affichees

- regroupement par type de frais
- indicateurs agreges
- filtres de lecture

### Actions visibles

- filtrer
- comparer
- ouvrir un detail

### Actions masquees ou interdites

- analyse globale hors perimetre pedagogique delegue

### Etats obligatoires

- loading
- aucun resultat
- non autorise
- erreur technique

### Contraintes de perimetre

- meme ecole pour les acteurs locaux
- meme organisation pour les acteurs organisationnels
- classe titulaire / section pour les delegues pedagogiques

### Composants majeurs attendus

- KPI
- tableau comparatif
- filtres analytiques

### Sources backend

- `PF-16`

## Ecran `SCR-PF-009`

### Page parente

- exonerations

### Vue parente

- vue mutation / liste

### Module

- `Paiements et facturation`

### Section

- exonerations

### Objectif metier

Permettre d'accorder puis d'annuler une exoneration dans le bon perimetre local, avec delegation locale optionnelle et strictement bornee.

### Acteur principal

- `ADMINISTRATEUR_ECOLE`

### Acteurs secondaires

- `GESTIONNAIRE_ORGANISATION`
- `PROMOTEUR_ORGANISATION`
- `SECRETAIRE` selon delegation locale explicite

### Preconditions de visibilite

- module finance actif
- autorisation d'exoneration reelle
- delegation locale active pour `SECRETAIRE`

### Donnees attendues

- eleve cible
- obligation cible
- etat de l'exoneration

### Donnees affichees

- obligation
- montant exonere
- historique de decision

### Actions visibles

- accorder une exoneration
- annuler une exoneration

### Actions masquees ou interdites

- pouvoir global d'exoneration pour `SECRETAIRE`

### Etats obligatoires

- loading
- obligation introuvable
- deja exonere
- non autorise
- erreur technique

### Contraintes de perimetre

- ecole locale pour `ADMINISTRATEUR_ECOLE`
- organisation pour les acteurs organisationnels
- delegation locale stricte pour `SECRETAIRE`

### Composants majeurs attendus

- detail obligation
- bloc decision exoneration
- journal des mutations

### Sources backend

- `PF-18`

## Ecran `SCR-PF-010`

### Page parente

- consultation des recus emis

### Vue parente

- vue liste

### Module

- `Paiements et facturation`

### Section

- recus

### Objectif metier

Permettre au `CAISSIER` de relire les recus emis dans sa propre ecole avec des filtres simples, sans transformer cette lecture en capacite generique pour les autres acteurs.

### Acteur principal

- `CAISSIER`

### Acteurs secondaires

- aucun

### Preconditions de visibilite

- module finance actif
- acteur `CAISSIER` actif dans l'ecole courante

### Donnees attendues

- liste des recus emis
- filtres de recherche
- informations minimales de paiement

### Donnees affichees

- numero recu
- eleve
- montant
- date
- mode de paiement

### Actions visibles

- rechercher
- filtrer
- ouvrir le detail d'un recu

### Actions masquees ou interdites

- consultation generique pour `ADMINISTRATEUR_ECOLE`
- lecture organisationnelle implicite

### Etats obligatoires

- loading
- aucun recu
- non autorise
- erreur technique

### Contraintes de perimetre

- meme organisation
- meme ecole

### Composants majeurs attendus

- barre de filtres
- tableau des recus
- pagination

### Sources backend

- `PF-19`

## Ecran `SCR-PF-011`

### Page parente

- rapport financier journalier

### Vue parente

- vue analyse / dashboard

### Module

- `Paiements et facturation`

### Section

- rapports et analyses

### Objectif metier

Permettre la lecture synthétique des encaissements journaliers dans le bon perimetre local ou organisationnel.

### Acteur principal

- `CAISSIER`

### Acteurs secondaires

- `ADMINISTRATEUR_ECOLE`
- `GESTIONNAIRE_ORGANISATION`
- `PROMOTEUR_ORGANISATION`

### Preconditions de visibilite

- module finance actif
- lecteur autorise
- date ou plage de lecture definie si necessaire

### Donnees attendues

- synthese journaliere
- montants par regroupement utile
- nombre d'operations

### Donnees affichees

- total du jour
- repartitions
- resume par type ou canal si expose

### Actions visibles

- changer la date
- filtrer
- ouvrir un detail

### Actions masquees ou interdites

- mutation de caisse depuis un ecran de rapport

### Etats obligatoires

- loading
- aucune operation sur la date choisie
- non autorise
- erreur technique

### Contraintes de perimetre

- `CAISSIER` et `ADMINISTRATEUR_ECOLE` : meme ecole
- `GESTIONNAIRE_ORGANISATION` et `PROMOTEUR_ORGANISATION` : meme organisation

### Composants majeurs attendus

- KPI journaliers
- repartitions
- tableau resume

### Sources backend

- `PF-17`

## Ecran `SCR-PF-012`

### Page parente

- paiements par caissier

### Vue parente

- vue analyse

### Module

- `Paiements et facturation`

### Section

- rapports et analyses

### Objectif metier

Permettre la lecture analytique des paiements regroupes par percepteur reel dans le bon perimetre.

### Acteur principal

- `CAISSIER`

### Acteurs secondaires

- `ADMINISTRATEUR_ECOLE`
- `GESTIONNAIRE_ORGANISATION`
- `PROMOTEUR_ORGANISATION`

### Preconditions de visibilite

- module finance actif
- lecteur analytique autorise

### Donnees attendues

- regroupements par percepteur
- montants
- volumes d'operations

### Donnees affichees

- liste / tableau des percepteurs
- montants cumules
- nombre d'operations

### Actions visibles

- filtrer par periode
- ouvrir un detail de percepteur

### Actions masquees ou interdites

- exposition d'acteurs non percepteurs comme signataires reels

### Etats obligatoires

- loading
- aucun resultat
- non autorise
- erreur technique

### Contraintes de perimetre

- ecole pour les lecteurs locaux
- organisation pour les lecteurs organisationnels

### Composants majeurs attendus

- tableau comparatif
- filtres de periode
- KPI resumes

### Sources backend

- `PF-14`

## Ecran `SCR-PF-013`

### Page parente

- fonds anticipes

### Vue parente

- vue analyse / detail

### Module

- `Paiements et facturation`

### Section

- rapports et analyses

### Objectif metier

Permettre la lecture des fonds anticipes dans le bon perimetre local, organisationnel ou pedagogiquement delegue.

### Acteur principal

- `CAISSIER`

### Acteurs secondaires

- `ADMINISTRATEUR_ECOLE`
- `GESTIONNAIRE_ORGANISATION`
- `PROMOTEUR_ORGANISATION`
- `TITULAIRE` selon delegation
- `PREFET_ETUDES` selon delegation
- `DIRECTEUR_ETUDES` selon delegation
- `DIRECTEUR_PRIMAIRE` selon delegation
- `DIRECTEUR_MATERNELLE` selon delegation

### Preconditions de visibilite

- module finance actif
- lecture des fonds anticipes autorisee dans le bon perimetre

### Donnees attendues

- liste des eleves avec fonds anticipes
- montants disponibles
- rattachements utiles

### Donnees affichees

- eleve
- montant anticipe
- contexte utile

### Actions visibles

- filtrer
- ouvrir un detail eleve

### Actions masquees ou interdites

- lecture hors classe ou hors section pour les delegues pedagogiques

### Etats obligatoires

- loading
- aucun fonds anticipe
- non autorise
- erreur technique

### Contraintes de perimetre

- identiques a la lecture analytique deleguee du workflow

### Composants majeurs attendus

- tableau des eleves
- indicateurs de total
- filtres pedagogiques / financiers

### Sources backend

- `PF-13`

## Ecran `SCR-PF-014`

### Page parente

- arrieres d'un eleve

### Vue parente

- vue detail

### Module

- `Paiements et facturation`

### Section

- dette et situation financiere

### Objectif metier

Permettre la consultation des arrieres d'un eleve dans le bon perimetre local, organisationnel ou pedagogiquement delegue.

### Acteur principal

- `CAISSIER`

### Acteurs secondaires

- `ADMINISTRATEUR_ECOLE`
- `GESTIONNAIRE_ORGANISATION`
- `PROMOTEUR_ORGANISATION`
- `TITULAIRE` selon delegation
- `PREFET_ETUDES` selon delegation
- `DIRECTEUR_ETUDES` selon delegation
- `DIRECTEUR_PRIMAIRE` selon delegation
- `DIRECTEUR_MATERNELLE` selon delegation

### Preconditions de visibilite

- module finance actif
- eleve cible connu
- lecture des arrieres autorisee

### Donnees attendues

- arrieres de l'eleve
- detail des obligations restees impayees

### Donnees affichees

- liste des arrieres
- montants cumules
- periodes ou references utiles si exposees

### Actions visibles

- basculer vers historique ou situation financiere

### Actions masquees ou interdites

- lecture hors perimetre delegue

### Etats obligatoires

- loading
- aucun arriere
- eleve introuvable
- non autorise
- erreur technique

### Contraintes de perimetre

- identiques a `PF-15`

### Composants majeurs attendus

- tableau des arrieres
- resume montant
- liens de navigation locale

### Sources backend

- `PF-15`

## Ecran `SCR-PF-015`

### Page parente

- parametres de paiement

### Vue parente

- vue parametrage

### Module

- `Paiements et facturation`

### Section

- parametres paiement

### Objectif metier

Permettre la consultation puis la mutation des parametres de paiement d'une ecole par les acteurs reellement autorises.

### Acteur principal

- `ADMIN_SYSTEME_ECOLE`

### Acteurs secondaires

- aucun officiellement retenu comme acteur principal de mutation dans ce lot

### Preconditions de visibilite

- module finance actif
- ecole active
- autorisation locale de parametrage

### Donnees attendues

- parametres de paiement actuels
- regles locales d'autorisation

### Donnees affichees

- parametres actifs
- sections de configuration
- historique de modification si expose

### Actions visibles

- consulter
- modifier

### Actions masquees ou interdites

- mutation implicite pour `ADMINISTRATEUR_ECOLE`

### Etats obligatoires

- loading
- aucun parametre
- non autorise
- erreur technique

### Contraintes de perimetre

- meme ecole

### Composants majeurs attendus

- formulaire de parametres
- resume de configuration
- confirmation de sauvegarde

### Sources backend

- `PF-10`

## Ecran `SCR-PF-016`

### Page parente

- grilles de tarification

### Vue parente

- vue liste / mutation

### Module

- `Paiements et facturation`

### Section

- tarification

### Objectif metier

Permettre la lecture et la gestion des grilles de tarification par l'acteur local reellement retenu.

### Acteur principal

- `ADMIN_SYSTEME_ECOLE`

### Acteurs secondaires

- aucun officiellement retenu comme acteur mutationnel principal dans ce lot

### Preconditions de visibilite

- module finance actif
- ecole active
- autorisation de gestion de tarification

### Donnees attendues

- grilles actives
- types de frais
- montants / regles de tarification

### Donnees affichees

- liste des grilles
- statut actif / inactif
- details de tarification

### Actions visibles

- creer
- modifier
- desactiver
- consulter

### Actions masquees ou interdites

- mutation implicite pour `ADMINISTRATEUR_ECOLE`

### Etats obligatoires

- loading
- aucune grille
- non autorise
- erreur technique

### Contraintes de perimetre

- meme ecole

### Composants majeurs attendus

- tableau des grilles
- formulaire de mutation
- panneau detail

### Sources backend

- `PF-11`

## Verdict

Le module `Paiements et facturation` dispose maintenant d'un premier noyau de contrats d'ecran reels, suffisamment solide pour lancer ensuite une phase d'ecrans concrets sans reinventer les usages.

La suite la plus propre devient :

- ouvrir le lot suivant de contrats d'ecran sur `Pedagogique`

Ce lot est maintenant ouvert dans :

- [23-contrats-ecran-pedagogiques.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/23-contrats-ecran-pedagogiques.md)
