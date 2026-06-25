# Phase 24 - Contrats D'Ecran Scolarite

## Statut

Ce document ouvre les premiers contrats d'ecran reels du module `Scolarite`.

Il commence par les ecrans les plus centraux et les mieux figes :

- inscription scolaire complete
- gestion eleves
- gestion familles
- affectations
- parcours / cycle de vie eleve
- suspension et actions de statut

Ce document doit etre lu comme la declinaison concrete des contrats d'ecran sur le domaine `Scolarite`.

## Sources De Verite

Ce document s'appuie exclusivement sur :

- [08-workflows-scolaires.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/08-workflows-scolaires.md)
- [14-cartographie-finale-workflows.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/14-cartographie-finale-workflows.md)
- [16-navigation-par-acteur.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/16-navigation-par-acteur.md)
- [17-navigation-par-module.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/17-navigation-par-module.md)
- [18-pages-et-routes-frontend.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/18-pages-et-routes-frontend.md)
- [19-vues-frontend.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/19-vues-frontend.md)
- [20-composants-ui.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/20-composants-ui.md)
- [21-contrats-ecran.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/21-contrats-ecran.md)

Le backend reste la source ultime de verite.

## Regles De Lecture

1. La scolarite ne doit pas etre confondue avec un simple sous-module financier.
2. `CAISSIER` reste l'acteur principal du noyau inscription / eleves / familles deja prouve.
3. Les actions de cycle de vie eleve doivent rester strictement bornees par acteur et par perimetre.
4. `DIRECTEUR_DISCIPLINE` ne doit jamais etre projete au-dela de la suspension.
5. `ADMINISTRATEUR_ECOLE` ne doit pas etre reintroduit comme acteur local positif si le workflow fige ne le retient pas.

## Ecran `SCR-SCO-001`

### Page parente

- inscription scolaire complete

### Vue parente

- vue centre de travail / action

### Module

- `Scolarite`

### Section

- inscriptions

### Objectif metier

Permettre l'inscription scolaire complete d'un eleve dans le bon perimetre d'ecole, avec la chaine eleve -> famille -> inscription -> affectation.

### Acteur principal

- `CAISSIER`

### Acteurs secondaires

- aucun retenu comme acteur principal du workflow complet

### Preconditions de visibilite

- module scolarite actif
- organisation active
- ecole active
- `CAISSIER` actif dans la bonne ecole

### Donnees attendues

- donnees eleve
- donnees famille
- annee scolaire
- classes / affectations disponibles

### Donnees affichees

- resume contexte ecole / annee
- formulaire eleve
- formulaire famille
- bloc inscription
- bloc affectation

### Actions visibles

- creer / renseigner l'eleve
- creer / lier la famille
- enregistrer l'inscription
- affecter l'eleve

### Actions masquees ou interdites

- mutation inscription pour acteur non `CAISSIER`

### Etats obligatoires

- loading
- donnees de reference absentes
- eleve deja existant
- famille deja existante / ambiguite famille
- non autorise
- succes
- erreur technique

### Contraintes de perimetre

- meme organisation
- meme ecole

### Composants majeurs attendus

- bandeau contexte scolaire
- assistant d'inscription
- formulaires eleve / famille
- recapitulatif final

### Sources backend

- `SCO-01`

## Ecran `SCR-SCO-002`

### Page parente

- gestion des eleves

### Vue parente

- vue liste / detail

### Module

- `Scolarite`

### Section

- eleves

### Objectif metier

Permettre la consultation et la gestion des eleves dans le bon perimetre local ou sectionnel selon le workflow reel.

### Acteur principal

- `CAISSIER`

### Acteurs secondaires

- `PREFET_ETUDES`
- `DIRECTEUR_ETUDES`
- `DIRECTEUR_PRIMAIRE`
- `DIRECTEUR_MATERNELLE`

### Preconditions de visibilite

- module scolarite actif
- contexte valide
- acteur autorise dans le bon perimetre

### Donnees attendues

- liste des eleves
- filtres utiles
- contexte de classe / section si applique

### Donnees affichees

- liste eleves
- identites minimales
- statuts utiles

### Actions visibles

- consulter
- filtrer
- ouvrir le detail d'un eleve

### Actions masquees ou interdites

- ouverture globale hors perimetre
- gestion locale par `ADMINISTRATEUR_ECOLE` si non prouve

### Etats obligatoires

- loading
- aucun eleve
- non autorise
- erreur technique

### Contraintes de perimetre

- `CAISSIER` : toute l'ecole
- acteurs sectionnels : leur section uniquement

### Composants majeurs attendus

- barre de filtres
- tableau eleves
- panneau detail rapide

### Sources backend

- `SCO-02`

## Ecran `SCR-SCO-003`

### Page parente

- gestion des familles

### Vue parente

- vue liste / detail

### Module

- `Scolarite`

### Section

- familles

### Objectif metier

Permettre la consultation et la gestion des familles dans le flux reel d'inscription.

### Acteur principal

- `CAISSIER`

### Acteurs secondaires

- aucun retenu comme acteur principal

### Preconditions de visibilite

- module scolarite actif
- `CAISSIER` actif dans la bonne ecole

### Donnees attendues

- liste familles
- responsables
- rattachements eleves / familles

### Donnees affichees

- familles
- responsables
- resume des enfants lies

### Actions visibles

- consulter
- creer
- lier
- mettre a jour

### Actions masquees ou interdites

- gestion familles pour acteur non `CAISSIER`

### Etats obligatoires

- loading
- aucune famille
- non autorise
- erreur technique

### Contraintes de perimetre

- meme ecole

### Composants majeurs attendus

- tableau familles
- detail famille
- bloc responsables / enfants

### Sources backend

- `SCO-03`

## Ecran `SCR-SCO-004`

### Page parente

- affectations de classe

### Vue parente

- vue action / liste

### Module

- `Scolarite`

### Section

- affectations

### Objectif metier

Permettre la consultation et la mutation des affectations dans le bon perimetre reel.

### Acteur principal

- `CAISSIER`

### Acteurs secondaires

- `PREFET_ETUDES`
- `DIRECTEUR_ETUDES`
- `DIRECTEUR_PRIMAIRE`
- `DIRECTEUR_MATERNELLE`

### Preconditions de visibilite

- module scolarite actif
- eleve / inscription cible connu
- acteur autorise dans le bon perimetre

### Donnees attendues

- affectation courante
- classes disponibles
- contexte annee scolaire

### Donnees affichees

- affectation actuelle
- choix de nouvelle classe si mutation autorisee

### Actions visibles

- consulter affectation
- affecter / reaffecter si autorise

### Actions masquees ou interdites

- mutation hors ecole pour `CAISSIER`
- mutation hors section pour acteurs sectionnels

### Etats obligatoires

- loading
- aucune affectation
- aucune classe disponible
- non autorise
- succes
- erreur technique

### Contraintes de perimetre

- `CAISSIER` : ecole
- acteurs sectionnels : section pertinente

### Composants majeurs attendus

- bloc affectation actuelle
- selecteur de classe
- resume de mutation

### Sources backend

- `SCO-04`

## Ecran `SCR-SCO-005`

### Page parente

- cycle de vie eleve

### Vue parente

- vue action / detail

### Module

- `Scolarite`

### Section

- cycle de vie eleve

### Objectif metier

Permettre les actions reelles de cycle de vie eleve dans le bon perimetre et selon la bonne repartition d'acteurs.

### Acteur principal

- `PREFET_ETUDES`

### Acteurs secondaires

- `DIRECTEUR_ETUDES`
- `DIRECTEUR_PRIMAIRE`
- `DIRECTEUR_MATERNELLE`
- `CAISSIER`
- `DIRECTEUR_DISCIPLINE` seulement pour la suspension

### Preconditions de visibilite

- module scolarite actif
- eleve cible connu
- action de cycle de vie connue
- acteur autorise pour cette action

### Donnees attendues

- identite eleve
- statut actuel
- historique utile
- action demandee

### Donnees affichees

- resume eleve
- statut actuel
- historique ou justification utile
- bloc d'action contextuelle

### Actions visibles

- suspendre
- abandonner
- transferer
- reactiver
- declarer deces

### Actions masquees ou interdites

- actions hors bloc autorise de l'acteur courant
- autre chose que suspension pour `DIRECTEUR_DISCIPLINE`
- suspension hors section pour acteurs sectionnels

### Etats obligatoires

- loading
- eleve introuvable
- transition interdite
- non autorise
- succes
- erreur technique

### Contraintes de perimetre

- `PREFET_ETUDES`, `DIRECTEUR_ETUDES` : section secondaire
- `DIRECTEUR_PRIMAIRE` : section primaire
- `DIRECTEUR_MATERNELLE` : section maternelle
- `DIRECTEUR_DISCIPLINE` : suspension uniquement dans sa section
- `CAISSIER` : abandon, transfert, reactivation, deces sur toute l'ecole

### Composants majeurs attendus

- fiche eleve
- bloc statut
- timeline de parcours
- panneau d'action contextuelle

### Sources backend

- `SCO-05`

## Ecran `SCR-SCO-006`

### Page parente

- suspension eleve

### Vue parente

- vue action ciblee

### Module

- `Scolarite`

### Section

- cycle de vie eleve

### Objectif metier

Permettre l'encodage d'une suspension dans le bon perimetre disciplinaire ou pedagogique local.

### Acteur principal

- `DIRECTEUR_DISCIPLINE`

### Acteurs secondaires

- `PREFET_ETUDES`
- `DIRECTEUR_ETUDES`
- `DIRECTEUR_PRIMAIRE`
- `DIRECTEUR_MATERNELLE`

### Preconditions de visibilite

- module scolarite actif
- eleve cible connu
- action suspension autorisee

### Donnees attendues

- eleve cible
- statut courant
- justification ou motif de suspension

### Donnees affichees

- resume eleve
- motif
- confirmation d'action

### Actions visibles

- suspendre

### Actions masquees ou interdites

- autre action de cycle de vie pour `DIRECTEUR_DISCIPLINE`
- suspension hors section

### Etats obligatoires

- loading
- eleve introuvable
- non autorise
- succes
- erreur technique

### Contraintes de perimetre

- section de l'acteur
- meme ecole

### Composants majeurs attendus

- resume eleve
- formulaire motif
- confirmation

### Sources backend

- `SCO-06`

## Verdict

Le module `Scolarite` dispose maintenant d'un premier noyau de contrats d'ecran reels couvrant son flux principal : inscription, eleves, familles, affectations et cycle de vie.

La suite la plus propre devient :

- ouvrir le lot suivant sur `Academique`
- ou revenir completer des ecrans secondaires ciblés si un besoin prioritaire apparait

Ce lot est maintenant ouvert dans :

- [25-contrats-ecran-academique.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/25-contrats-ecran-academique.md)
