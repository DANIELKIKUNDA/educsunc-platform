# 36 - Specification Documents Officiels

## Objet

Ce document fixe la methode officielle pour industrialiser les documents PDF institutionnels d'EduSync sans tomber dans une logique de "un modele par classe".

Il couvre en priorite :

- bulletin scolaire
- proclamation
- synthese pedagogique
- recu officiel

Specifications documentaires detaillees ouvertes :

- [44-specification-proclamation-officielle.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/44-specification-proclamation-officielle.md)
- [45-specification-technique-proclamation-pdf.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/45-specification-technique-proclamation-pdf.md)

Il ne redefinit pas le metier deja fige. Il cadre uniquement la transformation des sorties backend en documents conformes aux modeles reels des ecoles.

## Principe directeur

Un document officiel ne doit pas etre traite comme un export generique.

Il doit etre traite comme la combinaison de 3 couches distinctes :

1. donnees metier
2. gabarit documentaire
3. assets institutionnels

## Les 3 couches

### 1. Donnees metier

Ce sont les informations deja produites par les workflows backend :

- eleve
- classe
- annee scolaire
- notes
- cotes
- totaux
- rang
- application
- conduite
- diagnostics
- operation de paiement
- lignes de paiement
- etc.

Ces donnees ne doivent pas etre recalculees dans le moteur PDF.

### 2. Gabarit documentaire

C'est la structure visuelle officielle :

- format de page
- marges
- en-tete
- pied de page
- tableaux
- alignements
- zones de signatures
- mentions obligatoires
- bloc des observations
- numerotation visuelle des pages

Le gabarit est stable et ne depend pas d'un eleve particulier.

### 3. Assets institutionnels

Ce sont les elements graphiques et identitaires :

- logo
- drapeau
- filigrane
- cachet
- signatures
- polices specifiques
- sigles
- entetes documentaires propres a l'ecole

Ces assets doivent etre parametrables et rattaches a la bonne ecole.

## Ce qu'il ne faut pas faire

Il ne faut pas creer :

- un modele PDF par classe
- un modele PDF par eleve
- un modele PDF par bulletin individuel

La classe n'est pas une famille de template.

## Ce qu'il faut faire

Il faut creer un nombre limite de familles documentaires, puis parametrer chaque famille.

Exemples possibles :

- bulletin-maternelle
- bulletin-primaire
- bulletin-secondaire-general
- bulletin-secondaire-technique
- bulletin-secondaire-professionnel

Le nombre reel de familles doit etre determine apres audit des modeles sources.

## Regle de classification officielle

Deux bulletins appartiennent a la meme famille documentaire si :

- leur structure generale est la meme
- leurs blocs documentaires sont les memes
- leurs colonnes principales sont les memes
- leurs signatures et mentions occupent les memes zones
- leurs differences relevent seulement des donnees, du branding ou d'options mineures

Deux bulletins appartiennent a des familles differentes si :

- la grille des colonnes change reellement
- le nombre ou la nature des blocs change
- la hierarchie visuelle change
- les regles de pagination changent fortement
- les zones de signatures, observations ou recapitulatifs sont structurellement differentes

## Methode d'audit des modeles reels

### Etape 1 - Collecte des sources

Pour chaque document de reference, il faut reunir :

- PDF reel
- image ou scan si necessaire
- ecole source
- section source
- classe source
- annee scolaire
- type de programme si utile
- remarques locales

### Etape 2 - Fiche d'analyse unitaire

Chaque modele collecte doit etre decrit avec la meme grille :

- identifiant source
- ecole
- section
- classe
- nom usuel du document
- orientation portrait ou paysage
- nombre de pages habituel
- presence du drapeau
- presence du filigrane
- presence du logo
- presence du cachet
- presence de signatures
- blocs visibles
- tableau principal
- colonnes principales
- mentions legales
- particularites locales

### Etape 3 - Regroupement en familles

On regroupe ensuite les modeles selon :

- structure identique
- colonnes identiques
- blocs identiques
- zones de signatures identiques
- logique de pagination identique

### Etape 4 - Validation des familles

Chaque famille retenue doit etre validee avec :

- un nom de template
- une description fonctionnelle
- un exemple de source retenue comme reference
- la liste des ecoles et classes qui y appartiennent

## Sortie attendue de l'audit

L'audit doit produire :

1. le nombre reel de familles documentaires
2. la liste des templates a construire
3. les variantes mineures a parametrer
4. les assets obligatoires par ecole
5. les ecarts bloquants eventuels dans les donnees backend

## Parametrage recommande

Chaque template officiel doit etre parametrable au minimum par :

- ecole
- section
- type de document
- sigle
- logo
- filigrane
- drapeau
- cachet
- signatures actives
- bloc d'observations
- mentions de pied de page

## Resolution automatique du template

Le moteur documentaire devra choisir le template a partir d'une cle de resolution du type :

- type de document
- ecole
- section
- programme ou filiere si necessaire

Exemple de logique :

- document = bulletin
- section = secondaire
- filiere = technique
- ecole = X

=> template `bulletin-secondaire-technique`

Puis application des assets et parametres de l'ecole concernee.

## Doctrine technique cible

Le backend doit separer clairement :

- `document data builder`
- `template resolver`
- `asset resolver`
- `pdf renderer`

Ainsi :

- le workflow metier produit les donnees
- le resolver choisit le bon template
- le resolver charge les bons assets
- le renderer dessine le document final

## Bulletin scolaire - priorite absolue

Le premier chantier documentaire a industrialiser est le bulletin.

Objectif :

- reproduire fidelement les bulletins reels utilises par les ecoles
- eviter un rendu generique
- permettre drapeau, filigrane, cachet, signatures et blocs institutionnels reels
- conserver la verite metier du backend sans recalcul local dans le PDF

## Verdict CTO

La bonne strategie n'est pas de creer plus de 100 modeles.

La bonne strategie est :

1. auditer les bulletins reels
2. identifier les vraies familles documentaires
3. construire un petit nombre de templates robustes
4. parametrer les assets et variantes locales
5. brancher ensuite le moteur PDF sur cette classification

## Suite recommandee

Avant toute refonte PDF massive, ouvrir un audit documentaire dedie :

- inventaire des bulletins reels
- classification en familles
- liste des assets requis
- ecarts backend bloquants

Ce travail permettra ensuite d'ouvrir proprement la conception du template officiel du bulletin.

## Premier lot observe - juin 2026

Le workspace contient deja un premier lot de sources dans :

- [docs/assets/bulletins_sources](/C:/Users/MON%20PC/Documents/EducSyn/docs/assets/bulletins_sources)

Fichiers constates :

- `Bulletins MINEDUC 24-25 toutes sections par ordre alphabétique.pdf`
- `bulletinsCG.pdf`
- `Bulletindetcc.pdf`
- `9.01_BULLETINS MECANIQUE GENERALE.pdf`

Des extractions texte existent aussi dans :

- [.tmp/bulletins-extraits](/C:/Users/MON%20PC/Documents/EducSyn/.tmp/bulletins-extraits)
- [.tmp/bulletins-complementaires-extraits](/C:/Users/MON%20PC/Documents/EducSyn/.tmp/bulletins-complementaires-extraits)

## Constat backend confirme

Le backend `bulletins-evaluations` est deja compatible avec un moteur documentaire dynamique :

- le bulletin est rattache a une `anneeScolaire`
- le bulletin verifie la coherence avec le `ResultatBulletinEleve`
- le bulletin relit un `ProgrammeNiveau` local
- le bulletin controle la `versionReferentielProgramme`
- les cours du programme sont tries par `ordreAffichage`

Cela confirme que :

- l'annee scolaire doit rester dynamique
- l'ordre des cours doit venir du backend
- les changements annuels de cours ou de ponderation peuvent etre portes par le referentiel

En revanche, le renderer PDF actuel reste technique et minimal. La dette ne porte donc pas sur le moteur metier, mais sur la couche documentaire.

## Classification provisoire du lot bulletin

La lecture des sources actuelles montre deja qu'il ne faut pas raisonner "une classe = un template".

Le lot observe laisse plutot apparaitre les familles suivantes :

### Famille B1 - Degre elementaire 1ere et 2e annees

Indices observes :

- `BULLETIN DE L'ELEVE DEGRE ELEMENTAIRE (1ere, 2e ANNEE)`
- structure trimestrielle
- organisation par domaines
- maxima et sous-totaux par domaine

### Famille B2 - Degre elementaire enseignement special

Indices observes :

- `DEGRE ELEMENTAIRE / ENSEIGNEMENT SPECIAL`

### Famille B3 - Degre moyen 3eme et 4eme annees

Indices observes :

- `BULLETIN DE L'ELEVE : DEGRE MOYEN (3eme, 4eme ANNEE)`

### Famille B4 - Degre terminal 5e annee

Indices observes :

- `BULLETIN DE L'ELEVE DEGRE TERMINAL (5e ANNEE)`

### Famille B5 - Degre terminal 6e annee

Indices observes :

- `BULLETIN DE L'ELEVE DEGRE TERMINAL (6e ANNEE)`

### Famille B6 - Degre terminal enseignement special

Indices observes :

- `DEGRE TERMINAL / ENSEIGNEMENT SPECIAL (6e ANNEE)`

### Famille B7 - CTEB 7eme annee

Indices observes :

- `BULLETIN DE LA 7eme ANNEE CYCLE TERMINAL DE L'EDUCATION DE BASE`

### Famille B8 - CTEB 8eme annee

Indices observes :

- `BULLETIN DE LA 8eme ANNEE CYCLE TERMINAL DE L'EDUCATION DE BASE`

### Famille B9 - Humanites / options techniques, scientifiques et professionnelles

Indices observes :

- `HUMANITES / AGRICULTURE GENERALE`
- `HUMANITES / COMMERCIALE & GESTION`
- `HUMANITES TECHNIQUES / MECANIQUE GENERALE`
- `HUMANITES SCIENTIFIQUES`
- `COUPE ET COUTURE`
- `ELECTRICITE GENERALE`
- `HYDRO-PNEUMATIQUE`
- `LATIN - PHILOSOPHIE`
- `PEDAGOGIE GENERALE`
- `SOCIALE`
- `SECRETARIAT & ADMINISTRATION`
- etc.

Constat provisoire :

- ces bulletins partagent tres souvent la meme logique visuelle generale
- la difference principale semble porter sur la liste des cours, les regroupements et les maxima
- une sous-segmentation reste probable entre :
  - humanites semestrielles standard
  - humanites scientifiques
  - techniques/professionnelles a fortes lignes pratiques
  - filieres atypiques comme coupe et couture

## Hypothese de travail actuelle

Sur la base de ce premier lot, il est probable que le nombre reel de templates bulletin soit limite, par exemple :

- 8 a 12 familles documentaires maximum

et non plusieurs dizaines ni plus de 100.

Cette hypothese reste a confirmer apres lecture visuelle PDF et comparaison structurelle page par page.

## Suite immediate recommandee

Le prochain audit doit comparer :

1. les familles documentaires visibles dans les PDF
2. les classes reelles du referentiel academique
3. les programmes reels et leurs lignes
4. les structures d'evaluation trimetrielles ou semestrielles

Objectif :

- distinguer ce qui releve du template
- distinguer ce qui releve des donnees backend
- identifier les vraies variantes documentaires a coder

## Matrice provisoire PDF -> backend

Cette matrice ne fixe pas encore les templates finaux. Elle fixe le raccordement logique entre :

- famille documentaire visible
- structure d'evaluation backend
- classes backend concernees
- niveau de variabilite porte par les programmes

### DOC-BUL-B1 - Elementaire 1ere et 2e annees

- structure PDF observee :
  - bulletin par domaines
  - trimestriel
  - sous-totaux par domaine
  - maxima generaux
- structure backend attendue :
  - `TRIMESTRIEL`
- classes backend probables :
  - `1PR`
  - `2PR`
- source temoin :
  - [.tmp/bulletins-extraits/page-001.txt](/C:/Users/MON%20PC/Documents/EducSyn/.tmp/bulletins-extraits/page-001.txt)

### DOC-BUL-B2 - Degre moyen et terminal primaire/base

- structure PDF observee :
  - variantes `DEGRE MOYEN`, `DEGRE TERMINAL`, `CTEB`
  - logique encore distincte des humanites
- structure backend attendue :
  - `TRIMESTRIEL` pour les classes du primaire
  - `SEMESTRIEL` pour `7EB` et `8EB`
- classes backend probables :
  - `3PR`
  - `4PR`
  - `5PR`
  - `6PR`
  - `7EB`
  - `8EB`
- sources temoins :
  - [.tmp/bulletins-extraits/page-003.txt](/C:/Users/MON%20PC/Documents/EducSyn/.tmp/bulletins-extraits/page-003.txt)
  - [.tmp/bulletins-extraits/page-004.txt](/C:/Users/MON%20PC/Documents/EducSyn/.tmp/bulletins-extraits/page-004.txt)
  - [.tmp/bulletins-extraits/page-005.txt](/C:/Users/MON%20PC/Documents/EducSyn/.tmp/bulletins-extraits/page-005.txt)
  - [.tmp/bulletins-extraits/page-007.txt](/C:/Users/MON%20PC/Documents/EducSyn/.tmp/bulletins-extraits/page-007.txt)
  - [.tmp/bulletins-extraits/page-008.txt](/C:/Users/MON%20PC/Documents/EducSyn/.tmp/bulletins-extraits/page-008.txt)

### DOC-BUL-B3 - Enseignement special

- structure PDF observee :
  - variantes documentaires explicites `ENSEIGNEMENT SPECIAL`
- structure backend attendue :
  - a raccorder a la cartographie reelle des classes speciales si elles existent dans le referentiel actif de l'ecole
- classes backend :
  - a confirmer par mapping fonctionnel local
- sources temoins :
  - [.tmp/bulletins-extraits/page-002.txt](/C:/Users/MON%20PC/Documents/EducSyn/.tmp/bulletins-extraits/page-002.txt)
  - [.tmp/bulletins-extraits/page-006.txt](/C:/Users/MON%20PC/Documents/EducSyn/.tmp/bulletins-extraits/page-006.txt)

### DOC-BUL-B4 - Humanites semestrielles standard

- structure PDF observee :
  - deux semestres
  - colonnes `travaux journal`, `examen`, `total`
  - bloc `examen de repechage`
  - bloc `pourcentage / place / nombre d'eleves / application / conduite`
- structure backend attendue :
  - `SEMESTRIEL`
- classes backend concernees :
  - toutes les classes `HUMANITE` a structure semestrielle dont la variation porte surtout sur les cours et maxima
- sources temoins :
  - [.tmp/bulletins-extraits/page-009.txt](/C:/Users/MON%20PC/Documents/EducSyn/.tmp/bulletins-extraits/page-009.txt)
  - [.tmp/bulletins-extraits/page-040.txt](/C:/Users/MON%20PC/Documents/EducSyn/.tmp/bulletins-extraits/page-040.txt)
  - [.tmp/bulletins-complementaires-extraits/mecanique-generale/page-001.txt](/C:/Users/MON%20PC/Documents/EducSyn/.tmp/bulletins-complementaires-extraits/mecanique-generale/page-001.txt)
  - [.tmp/bulletins-complementaires-extraits/commerciale-gestion/page-001.txt](/C:/Users/MON%20PC/Documents/EducSyn/.tmp/bulletins-complementaires-extraits/commerciale-gestion/page-001.txt)

### DOC-BUL-B5 - Humanites scientifiques par domaines

- structure PDF observee :
  - organisation en domaines et sous-domaines
  - semestriel
  - sous-totaux explicites par sous-domaine et domaine
- structure backend attendue :
  - `SEMESTRIEL`
- classes backend probables :
  - `1SC`
  - `2SC`
  - `3SC`
  - `4SC`
- sources temoins :
  - [.tmp/bulletins-extraits/page-092.txt](/C:/Users/MON%20PC/Documents/EducSyn/.tmp/bulletins-extraits/page-092.txt)
  - [.tmp/bulletins-complementaires-extraits/sciences-mathematiques-physique/page-001.txt](/C:/Users/MON%20PC/Documents/EducSyn/.tmp/bulletins-complementaires-extraits/sciences-mathematiques-physique/page-001.txt)

### DOC-BUL-B6 - Humanites techniques ou professionnelles atypiques

- structure PDF observee :
  - certaines filieres semblent tres proches de `DOC-BUL-B4`
  - d'autres peuvent meriter un template specifique si les regroupements, maxima ou blocs pratiques changent fortement
- structure backend attendue :
  - `SEMESTRIEL`
- classes backend probables :
  - sous-ensembles des options techniques, professionnelles et cycle court
- source temoin :
  - [.tmp/bulletins-complementaires-extraits/coupe-couture/page-002.txt](/C:/Users/MON%20PC/Documents/EducSyn/.tmp/bulletins-complementaires-extraits/coupe-couture/page-002.txt)

## Regle de raccordement a conserver

Le template PDF ne doit jamais porter :

- l'ordre officiel des cours en dur
- les maxima annuels en dur
- les pondérations en dur
- l'annee scolaire en dur

Ces elements doivent venir du backend via :

- la classe pedagogique
- l'annee scolaire
- le programme niveau local
- la version du referentiel programme
- les lignes de cours triees par `ordreAffichage`

## Lecture CTO actuelle

La matrice provisoire fait apparaitre le scenario le plus probable suivant :

- 1 famille primaire/elementaire inferieure
- 1 famille primaire/base superieure
- 1 famille enseignement special
- 1 famille humanites semestrielles standard
- 1 famille humanites scientifiques par domaines
- 1 ou 2 familles techniques/professionnelles atypiques

Donc, a ce stade, l'ordre de grandeur raisonnable est plutot :

- 6 a 8 templates bulletin officiels

avec ensuite des variations pilotees par les donnees du referentiel et les assets ecole.

## Comparaison fine des structures observees

La lecture detaillee de plusieurs pages temoins permet deja de distinguer ce qui change vraiment et ce qui ne change pas.

### 1. Elementaire 1ere-2e, degre moyen 3e-4e, degre terminal 5e-6e

Comparaison des temoins :

- [.tmp/bulletins-extraits/page-001.txt](/C:/Users/MON%20PC/Documents/EducSyn/.tmp/bulletins-extraits/page-001.txt)
- [.tmp/bulletins-extraits/page-003.txt](/C:/Users/MON%20PC/Documents/EducSyn/.tmp/bulletins-extraits/page-003.txt)
- [.tmp/bulletins-extraits/page-004.txt](/C:/Users/MON%20PC/Documents/EducSyn/.tmp/bulletins-extraits/page-004.txt)

Constats :

- meme logique trimestrielle sur trois trimestres
- meme trame d'identification eleve
- meme bloc bas de page
- meme logique de domaines, sous-totaux, maxima generaux

Variations constatees :

- intitulé du niveau
- contenu des branches
- repartition des maxima
- quelques libelles de zones

Verdict provisoire :

- ces bulletins peuvent probablement etre portes par une meme famille trimestrielle
- avec des variantes de libelles et de regroupements de branches

### 2. CTEB 7e-8e annee et humanites scientifiques

Comparaison des temoins :

- [.tmp/bulletins-extraits/page-007.txt](/C:/Users/MON%20PC/Documents/EducSyn/.tmp/bulletins-extraits/page-007.txt)
- [.tmp/bulletins-extraits/page-092.txt](/C:/Users/MON%20PC/Documents/EducSyn/.tmp/bulletins-extraits/page-092.txt)
- [.tmp/bulletins-complementaires-extraits/sciences-mathematiques-physique/page-001.txt](/C:/Users/MON%20PC/Documents/EducSyn/.tmp/bulletins-complementaires-extraits/sciences-mathematiques-physique/page-001.txt)

Constats :

- meme logique semestrielle
- meme bloc `examen de repechage`
- meme structure generale haute et basse
- meme logique `pourcentage / place / nombre d'eleves / application / conduite`
- meme presentation par domaines et parfois sous-domaines

Variations constatees :

- contenu des domaines
- finesse des sous-domaines
- distribution des maxima

Verdict provisoire :

- humanites scientifiques et CTEB sont tres proches visuellement
- ils pourraient relever d'une meme famille semestrielle "par domaines"
- a confirmer apres comparaison de la 8e annee et d'autres variantes EB

### 3. Humanites options standard, techniques et professionnelles

Comparaison des temoins :

- [.tmp/bulletins-extraits/page-009.txt](/C:/Users/MON%20PC/Documents/EducSyn/.tmp/bulletins-extraits/page-009.txt)
- [.tmp/bulletins-extraits/page-040.txt](/C:/Users/MON%20PC/Documents/EducSyn/.tmp/bulletins-extraits/page-040.txt)
- [.tmp/bulletins-complementaires-extraits/mecanique-generale/page-001.txt](/C:/Users/MON%20PC/Documents/EducSyn/.tmp/bulletins-complementaires-extraits/mecanique-generale/page-001.txt)
- [.tmp/bulletins-complementaires-extraits/commerciale-gestion/page-001.txt](/C:/Users/MON%20PC/Documents/EducSyn/.tmp/bulletins-complementaires-extraits/commerciale-gestion/page-001.txt)
- [.tmp/bulletins-complementaires-extraits/coupe-couture/page-002.txt](/C:/Users/MON%20PC/Documents/EducSyn/.tmp/bulletins-complementaires-extraits/coupe-couture/page-002.txt)

Constats :

- meme logique semestrielle
- meme bloc identite eleve
- meme bandeau `branches`
- meme bloc `travaux journal / examen / total`
- meme bloc `pourcentage / place / conduite / application`
- meme logique de decision `passe / double / repechage`

Variations constatees :

- groupes de cours
- valeurs de maxima
- presence de quelques cours pratiques ou techniques particuliers
- micro-variantes de ponctuation, de casse ou de formulation

Verdict provisoire :

- agriculture generale, hydro-pneumatique, mecanique generale, commerciale & gestion et coupe-couture sont beaucoup plus proches qu'ils n'en ont l'air
- la plupart semblent relever d'une meme famille semestrielle "humanites standard"
- coupe et couture ne prouve pas encore a elle seule la necessite d'un template separe

## Fusions probables de templates

Sur la base de la comparaison actuelle, les fusions suivantes semblent raisonnables :

### Fusion F1 - Trimestriel general par domaines

Regroupe probablement :

- elementaire inferieur
- degre moyen
- degre terminal primaire/base

Condition :

- accepter un parametrage des libelles de niveau et des regroupements de branches

### Fusion F2 - Semestriel general par branches

Regroupe probablement :

- la majorite des humanites techniques
- la majorite des humanites professionnelles
- la majorite des options de gestion, industrie, agriculture, service et artisanat

Condition :

- laisser les programmes piloter ordre, cours, maxima et ponderations

### Fusion F3 - Semestriel par domaines

Regroupe probablement :

- CTEB
- humanites scientifiques
- eventuellement d'autres filieres si elles suivent la meme logique par domaines

### Fusion F4 - Enseignement special

A garder distinct provisoirement jusqu'a preuve contraire.

## Nouvelle estimation CTO

Apres comparaison fine, l'ordre de grandeur le plus probable baisse encore.

Estimation actuelle :

- 4 a 6 templates bulletin officiels

Repartition probable :

- 1 template trimestriel general
- 1 template semestriel general par branches
- 1 template semestriel par domaines
- 1 template enseignement special
- 0 a 2 variantes supplementaires seulement si une preuve PDF montre une rupture de structure reelle

## Ce qui compte vraiment pour l'implementation

Pour industrialiser correctement, il faudra faire porter par le backend :

- annee scolaire affichee
- classe reelle
- type de structure `TRIMESTRIEL` ou `SEMESTRIEL`
- ordre des cours
- maxima
- ponderations
- regroupements pedagogiques si le bulletin final les affiche

Le template, lui, doit surtout porter :

- geometrie de page
- position des blocs
- grille des colonnes
- zones de signatures
- drapeau, filigrane, cachet et branding institutionnel

## Nomenclature officielle cible des templates bulletin

Cette nomenclature est la cible officielle de travail tant qu'une nouvelle preuve PDF ne montre pas une rupture de structure.

## Liste cible

### `BULL-TPL-01` - `bulletin-trimestriel-general`

Usage :

- bulletins trimestriels a logique par domaines
- structure ecole de base / primaire / variantes proches

Raccordement backend principal :

- classes `TRIMESTRIEL`

Classes backend probablement concernees :

- `1MAT`
- `2MAT`
- `3MAT`
- `1PR`
- `2PR`
- `3PR`
- `4PR`
- `5PR`
- `6PR`

Regle :

- un seul template geometrique
- les branches, maxima et regroupements viennent du referentiel et du programme

### `BULL-TPL-02` - `bulletin-semestriel-branches`

Usage :

- bulletins semestriels d'humanites organises principalement en liste de branches
- techniques, professionnelles, commerciales, artisanales, sociales et autres variantes proches

Raccordement backend principal :

- classes `HUMANITE`
- structure `SEMESTRIEL`

Exemples visibles dans les sources :

- agriculture generale
- commerciale & gestion
- mecanique generale
- hydro-pneumatique
- secreteriat & administration
- sociale
- coupe et couture

Regle :

- le template ne porte pas la liste des cours
- il porte seulement la grille semestrielle standard

### `BULL-TPL-03` - `bulletin-semestriel-domaines`

Usage :

- bulletins semestriels organises par domaines et sous-domaines

Raccordement backend principal :

- `7EB`
- `8EB`
- humanites scientifiques
- autres classes semestrielles reellement alignees sur cette presentation

Regle :

- le template doit supporter :
  - domaines
  - sous-domaines
  - sous-totaux
  - maxima generaux

### `BULL-TPL-04` - `bulletin-enseignement-special`

Usage :

- bulletins explicitement identifies comme `enseignement special`

Raccordement backend principal :

- a confirmer par la cartographie locale des classes et programmes effectifs

Regle :

- template provisoirement garde a part
- il ne doit fusionner avec un autre que sur preuve documentaire claire

## Variantes conditionnelles non ouvertes par defaut

Les templates suivants ne doivent etre crees que si une preuve PDF future montre une rupture structurelle reelle :

### `BULL-TPL-05` - `bulletin-technique-atypique`

A ouvrir seulement si une filiere technique impose :

- une geometrie differente
- des zones pratiques irreductibles
- une pagination specifique

### `BULL-TPL-06` - `bulletin-scientifique-atypique`

A ouvrir seulement si une variante scientifique sort de la logique actuelle `semestriel-domaines`.

## Decision CTO actuelle

La cible officielle de travail est donc :

- 4 templates bulletin actifs
- 2 templates conditionnels au maximum

Soit :

- socle reel a implementer : `BULL-TPL-01` a `BULL-TPL-04`
- variantes maintenant ouvertes sur preuve documentaire locale : `BULL-TPL-05` et `BULL-TPL-06`

La traduction technique de cette nomenclature est maintenant cadree dans :

- [37-specification-technique-bulletins-pdf.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/37-specification-technique-bulletins-pdf.md)

## Doctrine de mapping

Le moteur PDF devra resoudre un template a partir de :

1. type de document = `bulletin`
2. structure evaluation = `TRIMESTRIEL` ou `SEMESTRIEL`
3. famille documentaire = `general`, `branches`, `domaines`, `special`
4. ecole et branding local

Pseudo-logique cible :

- si `enseignement special` => `BULL-TPL-04`
- sinon si `TRIMESTRIEL` => `BULL-TPL-01`
- sinon si `4e humanites` + presentation `domaines` => `BULL-TPL-06`
- sinon si `4e humanites` => `BULL-TPL-05`
- sinon si `SEMESTRIEL` + presentation `domaines` => `BULL-TPL-03`
- sinon => `BULL-TPL-02`

## Ce qui doit rester hors template

Ne doivent pas etre hardcodes dans les templates :

- annee scolaire
- libelle exact de la classe
- liste des cours
- ordre des cours
- maxima
- ponderations
- resultats eleve
- rang
- application
- conduite

## Verdict de figement provisoire

Sauf preuve PDF contraire, la nomenclature officielle bulletin EduSync est maintenant :

- `BULL-TPL-01` `bulletin-trimestriel-general`
- `BULL-TPL-02` `bulletin-semestriel-branches`
- `BULL-TPL-03` `bulletin-semestriel-domaines`
- `BULL-TPL-04` `bulletin-enseignement-special`

avec ouverture conditionnelle seulement pour :

- `BULL-TPL-05`
- `BULL-TPL-06`

## Verdict Final Du Lot Bulletin

La lecture finale du lot courant remplace maintenant le provisoire historique de ce document.

Le lot bulletin officiellement retenu pour EduSync est :

- `BULL-TPL-01` `bulletin-trimestriel-general`
- `BULL-TPL-02` `bulletin-semestriel-branches`
- `BULL-TPL-03` `bulletin-semestriel-domaines`
- `BULL-TPL-04` `bulletin-enseignement-special`
- `BULL-TPL-05` `bulletin-finaliste-4e-humanites-branches`
- `BULL-TPL-06` `bulletin-finaliste-4e-humanites-domaines`

Lecture CTO definitive du lot courant :

- la doctrine "pas un template par classe" est figee
- la logique `template + assets + donnees backend` est figee
- les finalistes `4e humanites` font maintenant partie du lot reel, ils ne sont plus de simples variantes conditionnelles
- `DOC-EXETAT-01` reste un chantier documentaire specialise de moyen terme, non bloquant pour le lot bulletin courant

## Statut De Figement

Le statut officiel retenu pour ce document est :

- `PHASE 36 FIGEE`
