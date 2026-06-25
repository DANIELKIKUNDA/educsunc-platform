# Phase 23 - Contrats D'Ecran Pedagogiques

## Statut

Ce document ouvre les premiers contrats d'ecran reels du module `Pedagogique`.

Il commence par les ecrans les plus centraux et les mieux figes :

- encodage des fiches
- generation du bulletin
- generation de la proclamation
- statistiques de classe
- classement
- conduite
- centre d'analyse des resultats

Ce document doit etre lu comme la premiere declinaison concrete des contrats d'ecran sur le domaine pedagogique.

## Sources De Verite

Ce document s'appuie exclusivement sur :

- [07-workflows-pedagogiques.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/07-workflows-pedagogiques.md)
- [14-cartographie-finale-workflows.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/14-cartographie-finale-workflows.md)
- [16-navigation-par-acteur.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/16-navigation-par-acteur.md)
- [17-navigation-par-module.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/17-navigation-par-module.md)
- [18-pages-et-routes-frontend.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/18-pages-et-routes-frontend.md)
- [19-vues-frontend.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/19-vues-frontend.md)
- [20-composants-ui.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/20-composants-ui.md)
- [21-contrats-ecran.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/21-contrats-ecran.md)

Le backend reste la source ultime de verite.

## Regles De Lecture

1. Le pedagogique est strictement gouverne par `permission + perimetre`.
2. `TITULAIRE` reste un acteur derive d'`ENSEIGNANT`, pas un role brut autonome.
3. Les vues de lecture analytique ne doivent pas etre reduites a de simples tableaux.
4. Les acteurs sectionnels ne doivent jamais etre projetes comme lecteurs globaux d'ecole.
5. `ADMINISTRATEUR_ECOLE` ne doit pas etre reintroduit comme acteur pedagogique implicite contre la doctrine deja figee.

## Ecran `SCR-PED-001`

### Page parente

- encodage des fiches de bulletin

### Vue parente

- vue formulaire / action

### Module

- `Pedagogique`

### Section

- fiches de bulletin

### Objectif metier

Permettre l'encodage d'une fiche de bulletin par l'acteur pedagogiquement concerne, dans le bon perimetre de cours et de classe.

### Acteur principal

- `ENSEIGNANT`

### Acteurs secondaires

- `TITULAIRE` via ses capacites effectives d'`ENSEIGNANT`

### Preconditions de visibilite

- module pedagogique actif
- organisation active
- ecole active
- classe ou cours cible connu
- autorisation d'encodage effective

### Donnees attendues

- contexte classe / cours
- structure de fiche
- eleves concernes
- colonnes de cotation autorisees

### Donnees affichees

- identification classe / cours
- tableau ou grille d'encodage
- etat des valeurs deja renseignees

### Actions visibles

- encoder
- modifier
- enregistrer

### Actions masquees ou interdites

- generation de bulletin
- generation de proclamation
- lecture globale hors perimetre d'enseignement

### Etats obligatoires

- loading
- classe ou cours introuvable
- aucun eleve
- non autorise
- succes d'enregistrement
- erreur technique

### Contraintes de perimetre

- `ENSEIGNANT` : ses cours et classes
- `TITULAIRE` : meme capacite d'encodage, sans droit distinct propre

### Composants majeurs attendus

- bandeau contexte classe / cours
- grille d'encodage
- bloc retour de validation

### Sources backend

- `PED-01`
- `PED-04`

## Ecran `SCR-PED-002`

### Page parente

- generation du bulletin

### Vue parente

- vue action

### Module

- `Pedagogique`

### Section

- bulletins

### Objectif metier

Permettre la generation d'un bulletin sur la bonne classe et la bonne annee scolaire par le `TITULAIRE` effectif.

### Acteur principal

- `TITULAIRE`

### Acteurs secondaires

- aucun retenu comme generateur officiel

### Preconditions de visibilite

- module pedagogique actif
- titulariat effectif actif
- classe cible connue
- annee scolaire cible connue

### Donnees attendues

- classe cible
- annee scolaire
- etat de completude des fiches

### Donnees affichees

- contexte de generation
- precontrole de cohérence
- confirmation de lancement

### Actions visibles

- generer le bulletin

### Actions masquees ou interdites

- generation pour `ENSEIGNANT` simple non titulaire
- generation hors classe titulaire

### Etats obligatoires

- loading
- preconditions non satisfaites
- non autorise
- succes
- erreur technique

### Contraintes de perimetre

- classe titulaire effective
- bonne annee scolaire
- bonne ecole

### Composants majeurs attendus

- carte contexte classe
- bloc precontrole
- action principale de generation

### Sources backend

- `PED-02`

## Ecran `SCR-PED-003`

### Page parente

- generation de la proclamation

### Vue parente

- vue action

### Module

- `Pedagogique`

### Section

- proclamations

### Objectif metier

Permettre la generation de la proclamation de la classe au `TITULAIRE` effectif dans le bon perimetre.

### Acteur principal

- `TITULAIRE`

### Acteurs secondaires

- aucun retenu comme generateur officiel

### Preconditions de visibilite

- module pedagogique actif
- titulariat effectif
- classe cible
- annee scolaire cible

### Donnees attendues

- contexte classe
- etat des resultats consolides
- cohérence prealable minimale

### Donnees affichees

- contexte de proclamation
- indicateurs de prevalidation
- confirmation de lancement

### Actions visibles

- generer la proclamation

### Actions masquees ou interdites

- generation pour `ENSEIGNANT` simple
- generation hors classe ou hors annee

### Etats obligatoires

- loading
- donnees insuffisantes
- non autorise
- succes
- erreur technique

### Contraintes de perimetre

- classe titulaire effective
- bonne annee scolaire

### Composants majeurs attendus

- resume classe
- bloc prevalidation
- action principale

### Sources backend

- `PED-03`

## Ecran `SCR-PED-004`

### Page parente

- statistiques de classe

### Vue parente

- vue analyse

### Module

- `Pedagogique`

### Section

- statistiques

### Objectif metier

Permettre la lecture analytique des statistiques de classe dans le bon perimetre pedagogique.

### Acteur principal

- `TITULAIRE`

### Acteurs secondaires

- `PREFET_ETUDES`
- `DIRECTEUR_ETUDES`
- `DIRECTEUR_DISCIPLINE` pour la lecture statistique explicitement prouvee

### Preconditions de visibilite

- module pedagogique actif
- classe cible connue
- annee scolaire connue
- lecture statistique autorisee

### Donnees attendues

- indicateurs de classe
- effectifs
- moyennes
- regroupements utiles

### Donnees affichees

- KPI
- tableaux ou comparaisons
- repartitions utiles

### Actions visibles

- filtrer
- changer la colonne d'analyse
- ouvrir un detail analytique

### Actions masquees ou interdites

- lecture globale ecole par simple `bulletins.read`

### Etats obligatoires

- loading
- aucune statistique
- non autorise
- erreur technique

### Contraintes de perimetre

- `TITULAIRE` : sa classe titulaire + bonne annee
- `PREFET_ETUDES` / `DIRECTEUR_ETUDES` : classe de leur section
- `DIRECTEUR_DISCIPLINE` : lecture disciplinaire/statistique prouvee dans sa section

### Composants majeurs attendus

- KPI de classe
- tableau analytique
- filtres d'analyse

### Sources backend

- `PED-05`

## Ecran `SCR-PED-005`

### Page parente

- classement de classe

### Vue parente

- vue analyse

### Module

- `Pedagogique`

### Section

- classement

### Objectif metier

Permettre la lecture du classement de la classe dans le bon perimetre pedagogique.

### Acteur principal

- `TITULAIRE`

### Acteurs secondaires

- `PREFET_ETUDES`
- `DIRECTEUR_ETUDES`

### Preconditions de visibilite

- module pedagogique actif
- classe cible connue
- annee scolaire connue
- calcul du classement disponible

### Donnees attendues

- classement de classe
- rangs
- pourcentages
- statuts de classabilite

### Donnees affichees

- tableau de classement
- rang
- eleve
- pourcentage
- statut non classe si applicable

### Actions visibles

- filtrer
- ouvrir un detail eleve

### Actions masquees ou interdites

- lecture hors classe ou hors section

### Etats obligatoires

- loading
- aucun classement disponible
- non autorise
- erreur technique

### Contraintes de perimetre

- `TITULAIRE` : classe titulaire + bonne annee
- `PREFET_ETUDES` / `DIRECTEUR_ETUDES` : section secondaire de leur ecole

### Composants majeurs attendus

- tableau classement
- indicateurs de synthese

### Sources backend

- `PED-06`

## Ecran `SCR-PED-006`

### Page parente

- conduite

### Vue parente

- vue action / liste

### Module

- `Pedagogique`

### Section

- conduite

### Objectif metier

Permettre l'encodage et la modification de la conduite dans le bon perimetre autorise.

### Acteur principal

- `TITULAIRE`

### Acteurs secondaires

- `DIRECTEUR_DISCIPLINE`

### Preconditions de visibilite

- module pedagogique actif
- classe ou section cible connue
- acteur autorise

### Donnees attendues

- liste des eleves
- etat courant de conduite
- periode ou colonne utile si exposee

### Donnees affichees

- eleves cibles
- conduite existante
- zones de saisie ou de modification

### Actions visibles

- encoder
- modifier
- enregistrer

### Actions masquees ou interdites

- acces pour `ENSEIGNANT` simple non titulaire
- acces pour `ADMINISTRATEUR_ECOLE`
- acces hors section pour `DIRECTEUR_DISCIPLINE`

### Etats obligatoires

- loading
- aucune classe / aucun eleve
- non autorise
- succes
- erreur technique

### Contraintes de perimetre

- `TITULAIRE` : sa classe et sa bonne annee
- `DIRECTEUR_DISCIPLINE` : meme ecole + meme section secondaire

### Composants majeurs attendus

- tableau eleves / conduite
- bloc d'edition
- retour de sauvegarde

### Sources backend

- `PED-07`

## Ecran `SCR-PED-007`

### Page parente

- centre d'analyse des resultats

### Vue parente

- vue centre de travail analytique

### Module

- `Pedagogique`

### Section

- resultats et analyses

### Objectif metier

Permettre la consultation consolidée des resultats et des analyses pedagogiques derivees de `ResultatBulletinEleve`.

### Acteur principal

- `TITULAIRE`

### Acteurs secondaires

- `PREFET_ETUDES`
- `DIRECTEUR_ETUDES`

### Preconditions de visibilite

- module pedagogique actif
- classe cible ou eleve cible connu
- annee scolaire connue
- lecture analytique autorisee

### Donnees attendues

- resultats consolides
- diagnostics
- echecs
- echecs profonds
- non classes
- comparatifs
- evolution

### Donnees affichees

- synthese de resultat
- diagnostics d'echec
- details analytiques
- listes comparatives

### Actions visibles

- filtrer
- comparer
- ouvrir un detail eleve
- basculer entre sous-analyses

### Actions masquees ou interdites

- lecture hors classe pour `TITULAIRE`
- lecture hors section pour `PREFET_ETUDES` et `DIRECTEUR_ETUDES`

### Etats obligatoires

- loading
- aucun resultat disponible
- non autorise
- erreur technique

### Contraintes de perimetre

- `TITULAIRE` : classe titulaire + bonne annee
- `PREFET_ETUDES` / `DIRECTEUR_ETUDES` : section secondaire + bonne ecole

### Composants majeurs attendus

- resume resultat
- panneau diagnostics
- tableau echecs
- bloc comparatif
- navigation locale d'analyse

### Sources backend

- `PED-08`

## Ecran `SCR-PED-008`

### Page parente

- consultation resultat eleve

### Vue parente

- vue detail analytique

### Module

- `Pedagogique`

### Section

- resultats et analyses

### Objectif metier

Permettre la lecture detaillee du resultat consolide d'un eleve dans le bon perimetre pedagogique.

### Acteur principal

- `TITULAIRE`

### Acteurs secondaires

- `PREFET_ETUDES`
- `DIRECTEUR_ETUDES`

### Preconditions de visibilite

- eleve cible connu
- annee scolaire connue
- lecture autorisee

### Donnees attendues

- resultat consolide eleve
- colonnes de resultat
- rangs
- pourcentages
- diagnostics associes

### Donnees affichees

- identite eleve
- details de resultat
- diagnostics et marqueurs

### Actions visibles

- ouvrir les analyses associees
- basculer vers comparatif ou evolution si exposes

### Actions masquees ou interdites

- lecture hors perimetre autorise

### Etats obligatoires

- loading
- resultat introuvable
- non autorise
- erreur technique

### Contraintes de perimetre

- identiques a `PED-08`

### Composants majeurs attendus

- fiche resultat eleve
- tableau colonnes
- bloc diagnostics

### Sources backend

- `PED-08`

## Verdict

Le module `Pedagogique` dispose maintenant d'un premier noyau de contrats d'ecran reels couvrant ses usages centraux : encodage, generation, supervision, conduite et analyse.

La suite la plus propre devient :

- completer les contrats d'ecran pedagogiques secondaires si necessaire
- ou ouvrir le lot suivant sur `Scolarite`

Ce lot est maintenant ouvert dans :

- [24-contrats-ecran-scolarite.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/24-contrats-ecran-scolarite.md)
