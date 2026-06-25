# 37 - Specification Technique Bulletins PDF

## Objet

Ce document traduit la nomenclature officielle des templates bulletin en specification technique exploitable pour l'implementation backend PDF.

Il ne redefinit ni le metier, ni les permissions, ni les workflows.

Il fixe :

- les blocs a dessiner
- les colonnes a supporter
- les zones institutionnelles
- les regles de pagination
- les points d'injection de donnees backend
- les regles de resolution des templates

## Sources de verite

Sources documentaires :

- [36-specification-documents-officiels.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/36-specification-documents-officiels.md)
- [07-workflows-pedagogiques.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/07-workflows-pedagogiques.md)
- [23-contrats-ecran-pedagogiques.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/23-contrats-ecran-pedagogiques.md)

Sources backend :

- [GenererBulletinEleveUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/application/use-cases/GenererBulletinEleve/GenererBulletinEleveUseCase.ts)
- [ReferentielAcademiqueAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/infrastructure/adapters/ReferentielAcademiqueAdapter.ts)
- [PdfBulletinService.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/infrastructure/services/PdfBulletinService.ts)
- [BulletinPdfPort.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/application/ports/out/BulletinPdfPort.ts)
- [BulletinPdfAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/infrastructure/adapters/BulletinPdfAdapter.ts)

Sources PDF de reference :

- [docs/assets/bulletins_sources](/C:/Users/MON%20PC/Documents/EducSyn/docs/assets/bulletins_sources)

## Templates cibles

Les templates officiels a supporter sont :

- `BULL-TPL-01` `bulletin-trimestriel-general`
- `BULL-TPL-02` `bulletin-semestriel-branches`
- `BULL-TPL-03` `bulletin-semestriel-domaines`
- `BULL-TPL-04` `bulletin-enseignement-special`
- `BULL-TPL-05`
- `BULL-TPL-06`

Ouverture documentaire confirmee :

- `BULL-TPL-05` `bulletin-finaliste-4e-humanites-branches`
- `BULL-TPL-06` `bulletin-finaliste-4e-humanites-domaines`

## Architecture technique cible

Le moteur PDF doit etre structure en 4 couches.

### 1. `BulletinDocumentDataBuilder`

Responsabilite :

- assembler toutes les donnees documentaires a partir du read model bulletin
- completer avec les metadonnees necessaires issues du referentiel et du branding ecole

Il ne dessine rien.

### 2. `BulletinTemplateResolver`

Responsabilite :

- choisir le template a utiliser

Entrees minimales :

- type structure evaluation
- famille documentaire
- section
- eventuelle nature speciale
- ecole

### 3. `BulletinAssetsResolver`

Responsabilite :

- charger les assets institutionnels de l'ecole

Assets cibles :

- drapeau
- logo
- filigrane
- cachet
- signatures
- sigle
- mentions documentaires

### 4. `BulletinPdfRenderer`

Responsabilite :

- dessiner le document final
- appliquer la geometrie du template
- paginer
- injecter les assets
- injecter les donnees

## Regle absolue

Le renderer ne doit jamais recalculer :

- ordre des cours
- maxima
- ponderations
- pourcentage
- rang
- application
- conduite

Le renderer affiche uniquement ce que le backend metier et les services documentaires lui fournissent.

## Schema de donnees documentaires cible

Le moteur PDF doit viser une structure logique de ce type.

### Bloc identite institutionnelle

- pays
- ministere
- province educationnelle
- ville
- commune ou territoire
- nom ecole
- code ecole
- logo ecole
- drapeau
- filigrane

### Bloc identite eleve

- code eleve
- nom complet
- sexe
- date et lieu de naissance si disponibles
- classe
- numero permanent
- annee scolaire

### Bloc meta bulletin

- type bulletin
- template resolu
- structure evaluation
- nombre de pages
- date generation
- version referentiel programme

### Bloc structure pedagogique

- liste ordonnee des groupes
- liste ordonnee des lignes
- sous-totaux
- maxima generaux
- colonnes visibles

### Bloc synthese eleve

- pourcentage
- rang
- nombre eleves
- application
- conduite
- decision de passage ou doublement
- mention de repechage si applicable

### Bloc signatures

- signature chef etablissement
- signature responsable
- signature eleve si necessaire
- cachet ecole

### Bloc mentions legales

- note de validite
- interdiction de reproduction
- references administratives

## Colonnes par template

### `BULL-TPL-01` - trimestriel general

Colonnes attendues :

- branche
- premier trimestre
- deuxieme trimestre
- troisieme trimestre
- total general

Sous-colonnes attendues :

- `1ereP`
- `2eP`
- `MAX EX`
- `PTS OBT`
- `MAX TRIM`
- repetitions equivalentes pour T2 et T3

### `BULL-TPL-02` - semestriel branches

Colonnes attendues :

- branche
- premier semestre
- second semestre
- total general
- examen de repechage

Sous-colonnes attendues :

- travaux journal
- examen
- total
- `1P`
- `2P`
- `3P`
- `4P`
- `%`
- signature professeur

### `BULL-TPL-03` - semestriel domaines

Colonnes attendues :

- domaine ou branche
- premier semestre
- second semestre
- total general
- examen de repechage

Sous-colonnes attendues :

- travaux journal
- examen
- total
- regroupements par domaine
- sous-domaines
- sous-totaux

### `BULL-TPL-04` - enseignement special

Colonnes attendues :

- a confirmer strictement sur les PDF speciaux retenus

Regle :

- ne pas supposer sa grille a partir des autres templates

## Blocs visuels obligatoires

Chaque template doit reserver les zones suivantes.

### Bloc A - En-tete officiel

- drapeau ou emblème selon modele retenu
- mention `Republique Democratique du Congo`
- ministere
- eventuels sous-intitules officiels

### Bloc B - Cadre administratif

- province educationnelle
- ville
- commune ou territoire
- ecole
- code

### Bloc C - Cadre identite eleve

- eleve
- sexe
- date de naissance
- classe
- numero permanent
- annee scolaire

### Bloc D - Titre bulletin

- libelle du niveau ou option
- annee scolaire

### Bloc E - Tableau principal

- colonnes selon template
- lignes ordonnees par programme
- groupes, sous-groupes ou domaines si necessaire

### Bloc F - Synthese

- maxima generaux
- totaux
- pourcentage
- place
- nombre d'eleves
- application
- conduite

### Bloc G - Decision

- passe
- double
- repechage
- texte complementaire selon modele

### Bloc H - Signatures et cachet

- chef d'etablissement
- responsable
- eleve si requis
- cachet ecole

### Bloc I - Mentions legales

- validite du bulletin
- interdiction de reproduction
- reference administrative

## Regles de pagination

### Regle 1

Le template doit accepter un nombre variable de lignes de cours.

### Regle 2

La pagination ne doit jamais casser :

- une ligne de cours
- un sous-total
- une ligne `maxima generaux`
- un bloc de signatures

### Regle 3

Si le tableau depasse une page :

- repeter l'en-tete du tableau
- repeter les colonnes
- conserver l'identite minimale du bulletin en haut de page

### Regle 4

Le bloc signatures doit de preference rester sur la derniere page.

### Regle 5

Les domaines et sous-domaines doivent rester lisibles apres saut de page.

## Regles assets et branding

### Assets obligatoires si disponibles

- logo
- filigrane
- cachet
- signature chef

### Regle de fallback

Le PDF doit rester generable meme si certains assets sont absents.

Exemple :

- pas de logo => en-tete texte seul
- pas de filigrane => rendu sans filigrane
- pas de cachet => zone reservee vide ou supprimee selon template
- pas de signature numerisee => zone nom et fonction uniquement

### Regle de resolution des assets

Les assets doivent etre resolus par ecole, jamais globalement par defaut sans controle.

## Regles de mapping backend

Le moteur PDF doit consommer :

- `idAnneeScolaire`
- `idClassePedagogique`
- `idProgrammeNiveau`
- `versionReferentielProgramme`
- lignes bulletin triees par `ordreAffichage`
- type structure evaluation

Le moteur PDF doit pouvoir demander en plus :

- libelle humain de la classe
- branding ecole
- signataires configurables
- libelles institutionnels eventuels

## Regles de decision template

Ordre de resolution conseille :

1. si `enseignement special` => `BULL-TPL-04`
2. sinon si `TRIMESTRIEL` => `BULL-TPL-01`
3. sinon si `4e humanites` + presentation par domaines => `BULL-TPL-06`
4. sinon si `4e humanites` => `BULL-TPL-05`
5. sinon si `SEMESTRIEL` + presentation par domaines => `BULL-TPL-03`
6. sinon => `BULL-TPL-02`

## Dettes techniques identifiees avant implementation

### Dette T1

Le service PDF actuel est minimal et ne porte pas de vraie geometrie documentaire.

Preuve :

- [PdfBulletinService.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/infrastructure/services/PdfBulletinService.ts)

### Dette T2

Le backend PDF actuel ne montre pas encore un resolver officiel de template bulletin.

### Dette T3

Le backend PDF actuel ne montre pas encore un resolver officiel des assets institutionnels bulletin.

### Dette T4

Les regroupements documentaires visibles dans les bulletins par domaines devront etre exposes explicitement si le renderer ne peut pas les inferer de maniere fiable depuis les lignes courantes.

## Ordre recommande d'implementation

1. Introduire la structure `DocumentData` bulletin
2. Introduire le resolver `BULL-TPL-*`
3. Introduire le resolver d'assets ecole
4. `BULL-TPL-01` industrialise
5. `BULL-TPL-02` industrialise
6. Implementer `BULL-TPL-03`
7. Traiter `BULL-TPL-04`
8. Ajouter les tests de rendu et de non-regression

## Verdict

Le backend actuel supporte deja la dynamique metier necessaire au bulletin officiel.
Les packages `BULL-TPL-01` et `BULL-TPL-02` sont maintenant poses avec fond maitre neutralise, calibration lue depuis le repo et rendu PDF teste.

Ce qu'il manque n'est pas la verite pedagogique, mais la couche documentaire industrielle.

Le present document fixe maintenant la cible technique pour la construire proprement.

Pour le cas specifique ou l'objectif est une identite visuelle maximale avec les PDF officiels existants, la strategie de reference est detaillee dans :

- [38-specification-overlay-bulletins-officiels.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/38-specification-overlay-bulletins-officiels.md)

## Statut De Figement

Le statut officiel retenu pour ce document est :

- `PHASE 37 FIGEE`
