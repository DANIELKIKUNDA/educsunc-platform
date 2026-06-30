# MP-01 - Fiche De Cotation Electronique

## Objet

Cette specification fixe la forme officielle de la fiche de cotation electronique EduSync.

Le document source d'inspiration est :

- [fiche_de_cotation_secondaire.pdf](/C:/Users/MON%20PC/Documents/EducSyn/docs/assets/FICHES/fiche_de_cotation_secondaire.pdf)

La fiche electronique ne cherche pas a reproduire un PDF.

Elle doit reproduire :

- la logique scolaire reelle de la fiche papier
- l'ordre de lecture metier
- la discipline d'encodage
- les invariants reels du backend

Le frontend n'invente jamais :

- une colonne
- un total
- un maxima
- une ponderation
- un statut d'encodage
- une regle de calcul
- un droit d'acces

Le frontend orchestre seulement la lecture et la saisie de ce que le backend autorise deja.

## Workflow

- identifiant : `MP-01`
- nom : `Encodage des fiches de bulletin`
- workflow reel : espace de travail pedagogique de `classe + cours + annee`

La fiche electronique n'est pas une fiche par eleve.

L'unite documentaire de travail visible par l'utilisateur est :

- une classe
- un cours
- une annee scolaire

L'unite de verite backend reste :

- une fiche par `eleve + cours + annee`

La vue electronique compose donc plusieurs fiches backend dans une seule grille de travail.

## Source Backend

### Lecture de groupe

- [ConsulterFichesCotationClasseCoursUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/application/use-cases/ConsulterFichesCotationClasseCours/ConsulterFichesCotationClasseCoursUseCase.ts)
- [FichesCotationController.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/interfaces/http/controllers/FichesCotationController.ts)
- [fiches-cotation.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/interfaces/http/routes/fiches-cotation.routes.ts)

### Fiche unitaire

- [FicheCotationEleveCours.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/domain/aggregates/FicheCotationEleveCours.ts)
- [FicheCotationMapper.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/application/mappers/FicheCotationMapper.ts)
- [FicheCotationOutput.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/application/dto/output/FicheCotationOutput.ts)
- [LigneFicheCotationOutput.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/application/dto/output/LigneFicheCotationOutput.ts)

### Mutations

- [EncoderCoteUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/application/use-cases/EncoderCote/EncoderCoteUseCase.ts)
- [ModifierCoteUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/application/use-cases/ModifierCote/ModifierCoteUseCase.ts)
- [ViderCoteUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/application/use-cases/ViderCote/ViderCoteUseCase.ts)

### Invariants

- [CodeColonneBulletin.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/domain/value-objects/CodeColonneBulletin.ts)
- [TypeStructureEvaluation.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/domain/value-objects/TypeStructureEvaluation.ts)
- [CoteColonneBulletin.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/domain/entities/CoteColonneBulletin.ts)
- [MoteurEncodageCotes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/domain/services/MoteurEncodageCotes.ts)
- [PolicyCoursSansExamen.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/domain/policies/PolicyCoursSansExamen.ts)
- [PolicyColonneInterdite.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/domain/policies/PolicyColonneInterdite.ts)
- [PolicyColonneTotalCalculee.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/domain/policies/PolicyColonneTotalCalculee.ts)

### Securite

- [AutorisationEncodageCotesAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationEncodageCotesAdapter.ts)

## Doctrine D'Affichage

La fiche electronique doit ressembler a une fiche scolaire de travail.

Elle ne doit pas ressembler :

- ni a un dashboard
- ni a un tableau analytique marketing
- ni a un simple CRUD

La priorite est :

- lisibilite scolaire
- densite utile
- vitesse d'encodage
- controle des erreurs

## Contexte D'Ecran

Le haut de l'ecran doit afficher en permanence :

- annee scolaire
- classe
- cours
- enseignant
- type de structure d'evaluation
- etat de la fenetre d'encodage

Le bandeau doit aussi rappeler :

- perimetre actif
- colonnes autorisees
- statut d'autorisation

## Structure Desktop

La version desktop est la version de reference.

Ordre officiel des zones :

1. barre de contexte
2. barre d'etat metier
3. grille de cotation
4. barre d'actions
5. bloc de resume bas

### Barre de contexte

Contient :

- annee scolaire
- classe
- cours
- enseignant
- nombre d'eleves attendus

### Barre d'etat metier

Contient :

- fenetre ouverte ou fermee
- cours avec examen ou sans examen
- lecture seule ou encodage actif
- version de travail si necessaire

### Grille de cotation

La grille est le coeur de l'ecran.

Une ligne = un eleve

Une colonne = une colonne officielle backend

Colonnes fixes de gauche recommandees :

- numero
- matricule ou code eleve si disponible
- nom complet
- sexe si la fiche reelle le porte

Colonnes de cotation ensuite.

### Barre d'actions

Actions visibles seulement si autorisees :

- enregistrer les modifications
- actualiser
- vider une cellule
- annuler les changements locaux non envoyes

Pas d'export principal.

### Bloc de resume bas

Le bas de l'ecran affiche :

- nombre d'eleves attendus
- nombre de lignes renseignees
- nombre de cases vides
- nombre d'echecs visibles

## Structure Mobile

Le mobile n'est pas la version optimale pour la saisie lourde.

Le mobile doit donc etre pense en mode assiste :

1. contexte compact
2. choix du cours
3. choix de la colonne ou du groupe
4. liste d'eleves
5. panneau de saisie

Le mobile doit privilegier :

- saisie eleve par eleve
- saisie colonne par colonne
- retours rapides

## Colonnes Officielles

Le frontend ne doit jamais construire ses propres colonnes.

Il doit afficher uniquement les colonnes livrees et autorisees par le backend.

### Cas secondaire semestriel

Ordre officiel de lecture recommande :

- `P1`
- `P2`
- `EX1`
- `TOTAL_S1`
- `P3`
- `P4`
- `EX2`
- `TOTAL_S2`
- `TOTAL_GENERAL`

### Cas trimestriel

Ordre officiel de lecture recommande :

- `P1`
- `P2`
- `EX1`
- `TOTAL_T1`
- `P3`
- `P4`
- `EX2`
- `TOTAL_T2`
- `P5`
- `P6`
- `EX3`
- `TOTAL_T3`
- `TOTAL_GENERAL`

## Ligne Maxima

Le document papier emploie `MAXIMA`.

Dans EduSync :

- `MAXIMA = ponderation`
- la valeur source est `maximumColonne`

La grille doit donc comporter une ligne ou un bandeau `MAXIMA` visible clairement.

Cette ligne :

- est en lecture seule
- vient uniquement du backend
- s'aligne exactement sur les colonnes de cotation

Le frontend ne recalcule jamais ces maxima.

## Regles D'Encodage

### Colonnes saisissables

Peuvent etre editables seulement si toutes les conditions sont vraies :

- colonne presente dans la fiche
- colonne non totale
- colonne ouverte par calendrier
- utilisateur autorise
- fiche encore au bon perimetre

### Colonnes non saisissables

Restent toujours en lecture seule :

- `TOTAL_S1`
- `TOTAL_S2`
- `TOTAL_T1`
- `TOTAL_T2`
- `TOTAL_T3`
- `TOTAL_GENERAL`

### Examen

Si `aExamen = false` :

- la colonne examen n'est pas editable
- idealement elle n'est pas affichee si absente de la structure

### Vide

Une case vide ne doit pas etre interpretee librement.

Elle represente seulement :

- absence de cote
- ou valeur non applicable selon le backend

## Comportement De Saisie

Le modele cible est une saisie de grille premium.

### Navigation

Le desktop doit privilegier :

- tabulation horizontale
- entree pour descendre
- fleches clavier pour circuler

### Validation

La validation doit etre stricte :

- entier naturel seulement
- pas de valeur negative
- pas de valeur superieure au maxima

### Enregistrement

Le mode recommande est :

- edition locale cellule
- sauvegarde explicite ou semi-immediate

Minimum obligatoire :

- retour de succes
- retour d'erreur
- retour de conflit de version

### Recalcul

Apres mutation acceptee :

- les totaux doivent etre relus depuis la reponse backend
- le frontend ne recalcule pas localement les totaux officiels

## Etats Visuels

Chaque cellule peut etre dans un etat clair :

- vide
- renseignee
- en erreur
- verrouillee
- calculee
- echec

Les styles doivent rester sobres et scolaires.

Pas d'effets graphiques inutiles.

## Conflits Et Version

Chaque ligne exploitable doit porter la version de sa fiche backend.

Le frontend doit transmettre la version attendue a chaque mutation.

Si le backend refuse pour conflit :

- afficher un message clair
- recharger la ligne concernee
- ne jamais ecraser silencieusement une valeur distante

## Securite Et Perimetre

La fiche electronique ne s'ouvre que si le backend a deja valide :

- `ENSEIGNANT`
- meme ecole
- meme classe
- meme cours
- meme annee

`TITULAIRE` n'est pas un droit frontend distinct.

Il agit seulement s'il a les capacites effectives d'enseignant dans le bon perimetre.

Le frontend n'invente aucun contournement de role.

## Etats D'Ecran

Etats obligatoires :

- chargement initial
- non autorise
- aucune fiche disponible
- classe ou cours introuvable
- fenetre fermee
- grille prete
- conflit de version
- erreur technique

## Donnees Attendues Cote Frontend

La vue finale doit pouvoir porter au minimum :

- contexte ecole
- contexte annee
- contexte classe
- contexte cours
- identite enseignant
- identite reelle eleve si remontee par le backend
- typeStructureEvaluation
- aExamen
- liste des eleves
- colonnes officielles
- maxima par colonne
- valeur par cellule
- estEchec
- styleAffichage
- version par fiche eleve

## Regles D'Implementation Frontend

Le frontend doit respecter :

- doctrine modulaire
- MVVM
- services
- models
- stores
- views
- routes separees

La vue `MP-01` ne doit pas vivre comme un composant monolithique.

Decoupage recommande :

- `pedagogique/models/fiche-cotation.model.ts`
- `pedagogique/services/fiches-cotation.api.ts`
- `pedagogique/stores/fiches-cotation.store.ts`
- `pedagogique/views/FicheCotationElectroniqueView.vue`
- composants de grille dedies si necessaire

## Verdict De Figement

La fiche electronique officielle EduSync pour `MP-01` est :

- une fiche de travail `classe + cours + annee`
- inspiree du modele papier officiel
- alignee sur les invariants backend
- sans moteur de calcul parallele dans le frontend

Le frontend affiche.

Le backend decide.
