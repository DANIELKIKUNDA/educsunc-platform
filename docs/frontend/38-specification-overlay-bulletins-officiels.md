# 38 - Specification Overlay Bulletins Officiels

## Objet

Ce document fixe la strategie technique a utiliser si l'objectif est d'obtenir des bulletins EduSync visuellement identiques aux bulletins officiels de reference.

Il ne remplace pas :

- [36-specification-documents-officiels.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/36-specification-documents-officiels.md)
- [37-specification-technique-bulletins-pdf.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/37-specification-technique-bulletins-pdf.md)

Il precise la methode d'implementation pour atteindre une fidelite maximale :

- meme fond
- meme forme
- meme geometrie
- memes cadres
- memes blocs
- meme impression visuelle globale

## Decision technique officielle

Si EduSync doit produire des bulletins "100% identiques" aux modeles PDF officiels, la strategie cible n'est pas :

- un rendu libre
- un HTML converti en PDF
- un template integralement redessine a la main

La strategie cible est :

- `background officiel fixe`
- `surimpression dynamique des donnees`
- `coordonnees de placement precises`

## Principe directeur

Chaque template bulletin officiel doit etre construit comme :

1. un fond documentaire maitre
2. un plan de zones
3. un moteur de placement
4. des donnees dynamiques backend

Autrement dit :

- le fond porte la forme
- le backend porte la verite
- le moteur overlay fait le raccord exact

## Pourquoi ce choix

Cette strategie est la seule qui permette simultanement :

- respect exact du drapeau
- respect exact du filigrane
- respect exact des traits et cadres
- respect exact des marges et espacements
- respect exact des blocs administratifs
- respect exact des zones de signatures

Tout rendu "redessine" peut etre tres bon, mais risque toujours :

- des ecarts de proportions
- des differences de police
- des espacements approximatifs
- des cadres legerement differents

## Structure technique cible

### Couche 1 - Master background

Chaque template `BULL-TPL-*` doit disposer d'un fond maitre officiel.

Format cible recommande :

- PDF maitre
ou
- image haute definition si le PDF source n'est pas exploitable proprement

Le fond doit contenir exclusivement :

- drapeau
- filigrane
- lignes
- cadres
- mentions fixes
- blocs statiques
- signatures imprimees fixes si le modele reel les porte deja

Le fond ne doit pas contenir les donnees eleve dynamiques a injecter.

### Couche 2 - Plan de zones

Chaque fond maitre doit etre accompagne d'un plan de zones documentaires.

Chaque zone doit definir :

- identifiant
- page
- x
- y
- largeur
- hauteur
- alignement
- taille police
- graisse
- mode de retour a la ligne
- comportement si texte long

### Couche 3 - Donnees documentaires

Les donnees viennent du backend via le `DocumentData` bulletin.

Elles alimentent ensuite les zones :

- identite ecole
- identite eleve
- classe
- annee scolaire
- branches
- notes
- maxima
- totaux
- pourcentage
- rang
- application
- conduite

### Couche 4 - Renderer overlay

Le renderer doit :

- charger le fond
- charger le plan de zones
- ecrire les donnees aux bonnes coordonnees
- gerer les multi-lignes
- gerer les sauts de page si necessaire
- sortir le PDF final

## Regle absolue

Le fond officiel ne doit jamais devenir la source de verite du metier.

Le fond ne sert qu'a la forme.

Le backend garde la verite sur :

- l'annee scolaire
- la classe
- l'ordre des cours
- les maxima
- les ponderations
- les notes
- le rang
- l'application
- la conduite

## Assets a figer par template

Pour chaque `BULL-TPL-*`, il faut figer :

- `background-master`
- `zone-map`
- `font-map`
- `fallback-rules`

## Plan de zones cible

Chaque template doit au minimum porter les familles de zones suivantes.

### Z-HEAD-INSTITUTION

- pays
- ministere
- sous-titre

### Z-ADMIN

- province educationnelle
- ville
- commune ou territoire
- ecole
- code ecole

### Z-ELEVE

- nom ou eleve
- sexe
- naissance
- classe
- numero permanent

### Z-TITRE

- intitule du bulletin
- option ou cycle
- annee scolaire

### Z-TABLEAU

- entetes
- lignes de branches
- sous-totaux
- maxima generaux

### Z-SYNTHESE

- pourcentage
- place
- nombre d'eleves
- application
- conduite

### Z-DECISION

- passe
- double
- repechage
- observations associees

### Z-SIGNATURES

- chef d'etablissement
- responsable
- eleve
- cachet

### Z-LEGAL

- note importante
- interdiction de reproduction
- reference administrative

## Regles de placement

### Regle 1 - Coordonnees absolues

Pour viser l'identite visuelle maximale, les champs critiques doivent utiliser des coordonnees absolues.

### Regle 2 - Alignement stable

Les valeurs comme :

- classe
- annee scolaire
- pourcentage
- rang
- nombre d'eleves

doivent avoir un alignement stable et reproductible.

### Regle 3 - Colonnes tableau

Le tableau principal doit utiliser :

- une grille de colonnes fixe par template
- des largeurs fixes
- des points d'ancrage fixes

### Regle 4 - Textes longs

Si une valeur depasse :

- soit on tronque selon la doctrine du document
- soit on reduit legerement la police
- soit on autorise un retour a la ligne uniquement dans les zones prevues

Jamais d'expansion libre qui casserait la forme officielle.

### Regle 5 - Multi-pages

Si le bulletin depasse une page :

- le fond officiel de continuation doit etre prevu
ou
- le fond principal doit avoir une variante page 2

## Formats de stockage recommandes

### Option A - PDF fond + JSON zones

Exemple logique :

- `BULL-TPL-01/background.pdf`
- `BULL-TPL-01/zones.json`

### Option B - PNG fond + JSON zones

Option acceptable si le PDF source n'est pas exploitable proprement.

### Option C - SVG maitre

Possible si l'on reconstruit techniquement un maitre vectoriel strict.

Pour l'objectif "identique aux PDF sources", l'option A reste la plus naturelle.

## Ce qu'il faut mesurer

Pour chaque template, il faut mesurer ou calibrer :

- format de page reel
- marges
- position du tableau
- hauteur de ligne
- largeur des colonnes
- zones signature
- zones de texte administratives

## Workflow de calibration recommande

1. Selectionner un PDF maitre propre
2. Extraire ou figer le fond
3. Poser une premiere `zone-map`
4. Injecter un jeu de donnees test
5. Comparer avec le PDF officiel
6. Corriger les coordonnees
7. Recommencer jusqu'a concordance visuelle

## Critere d'acceptation visuelle

Un template est acceptable si :

- les cadres coincident visuellement
- les textes tombent dans les bonnes zones
- les colonnes correspondent
- les blocs signatures sont a la bonne place
- l'effet global est indistinguable a l'impression courante

## Application a `BULL-TPL-01`

Le premier template a industrialiser en mode overlay doit etre :

- `BULL-TPL-01`

Raison :

- structure plus stable
- base trimestrielle claire
- forte valeur de preuve pour le reste du systeme

## Dettes techniques a ouvrir pour l'implementation

### DOV-01

Support technique d'un renderer overlay PDF.

### DOV-02

Format officiel de stockage des `zone-map`.

### DOV-03

Chargement et versionnement des backgrounds officiels.

### DOV-04

Calibration outillee des coordonnees.

## Verdict

Pour obtenir des bulletins EduSync visuellement identiques aux PDF officiels, la strategie retenue doit etre :

- `fond officiel maitre`
- `zones calibre es`
- `donnees backend dynamiques`
- `renderer overlay`

Cette strategie est maintenant la cible officielle a suivre pour les bulletins "100% identiques".

## Statut De Figement

Le statut officiel retenu pour ce document est :

- `PHASE 38 FIGEE`
