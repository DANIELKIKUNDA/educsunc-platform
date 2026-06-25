# 39 - Specification BULL-TPL-01

## Objet

Ce document fixe la specification concrete du template :

- `BULL-TPL-01`
- `bulletin-trimestriel-general`

Il s'agit du premier template officiel a industrialiser en mode :

- `background officiel maitre`
- `overlay dynamique`
- `coordonnees calibre es`

## Positionnement

`BULL-TPL-01` couvre la famille trimestrielle generale des bulletins observes dans les sources MINEDUC.

Il sert de base prioritaire pour :

- degre elementaire
- degre moyen
- degre terminal de base primaire observe dans les maquettes
- variantes proches partageant la meme geometrie generale

## Sources de preuve

Pages temoins utilisees :

- [.tmp/bulletins-extraits/page-001.txt](/C:/Users/MON%20PC/Documents/EducSyn/.tmp/bulletins-extraits/page-001.txt)
- [.tmp/bulletins-extraits/page-003.txt](/C:/Users/MON%20PC/Documents/EducSyn/.tmp/bulletins-extraits/page-003.txt)
- [.tmp/bulletins-extraits/page-004.txt](/C:/Users/MON%20PC/Documents/EducSyn/.tmp/bulletins-extraits/page-004.txt)

Documents de doctrine :

- [37-specification-technique-bulletins-pdf.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/37-specification-technique-bulletins-pdf.md)
- [38-specification-overlay-bulletins-officiels.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/38-specification-overlay-bulletins-officiels.md)

## Verdict structurel

Les trois pages temoins montrent une meme ossature visuelle :

- meme en-tete institutionnel
- meme bloc administratif
- meme bloc identite eleve
- meme titre central du bulletin
- meme grand tableau trimestriel
- meme bloc de synthese
- meme bloc de signatures
- meme bloc legal de bas de page

Les differences portent surtout sur :

- le libelle du niveau
- les branches
- les sous-totaux
- les maxima generaux

Donc :

- un seul template overlay est coherent pour cette famille

## Fond maitre

Le template `BULL-TPL-01` doit utiliser un fond maitre officiel dedie.

Ce fond doit conserver :

- drapeau
- mentions ministerielles
- traits
- cadres
- etiquettes fixes
- zones de signatures
- mentions legales

Le fond maitre ne doit pas contenir les valeurs dynamiques :

- eleve
- classe
- annee scolaire
- lignes de branches
- maxima dynamiques
- pourcentage
- place

## Structure visuelle globale

Le bulletin suit une logique verticale en 8 bandes.

### Bande 1 - En-tete institutionnel

Contenu fixe attendu :

- `REPUBLIQUE DEMOCRATIQUE DU CONGO`
- `MINISTERE DE L'EDUCATION NATIONALE`
- `ET NOUVELLE CITOYENNETE`

Elements visuels :

- drapeau ou symbole
- eventuel filigrane central

### Bande 2 - Cadre administratif

Zones etiquetees :

- `N° ID`
- `PROVINCE EDUCATIONNELLE`
- `VILLE`
- `COMMUNE / TER.`
- `ECOLE`
- `CODE`

### Bande 3 - Cadre eleve

Zones etiquetees :

- `ELEVE`
- `SEXE`
- `NE(E) A`
- `LE`
- `CLASSE`
- `N° PERM.`

### Bande 4 - Titre bulletin

Format observe :

- `BULLETIN DE L'ELEVE ... ANNEE SCOLAIRE ...`

Parties dynamiques a injecter :

- libelle niveau
- annee scolaire

### Bande 5 - Tableau principal

Le tableau principal est la zone critique du template.

Il contient :

- colonne `BRANCHES`
- groupe `PREMIER TRIMESTRE`
- groupe `DEUXIEME TRIMESTRE`
- groupe `TROISIEME TRIMESTRE`
- groupe `TOTAL`

### Bande 6 - Synthese

Zones fixes observees :

- `POURCENTAGE`
- `PLACE`
- `NBRE D'ELEVES`
- `APPLICATION`
- `CONDUITE`

### Bande 7 - Signatures et decision

Zones fixes observees :

- `SIGNAT. DE L'INST.`
- `SIGNAT. DU RESP.`
- `Sceau de l'Ecole`
- decision `passe / double`
- ligne `Fait a ... le ...`
- `Chef d'Etablissement`
- `Noms & Signature`
- `Signature de l'eleve`

### Bande 8 - Mentions legales

Contenu fixe observe :

- note importante de validite
- interdiction de reproduction
- reference administrative type `IGE/P.S/...`

## Colonnes officielles

`BULL-TPL-01` doit afficher la grille logique suivante.

### Colonne 1

- `BRANCHES`

### Groupe T1

- `MAX per`
- `1ereP`
- `2eP`
- `MAX EX`
- `PTS OBT`
- `MAX TRIM`
- `PTS OBT`

### Groupe T2

- `3eP`
- `4eP`
- `MAX EX`
- `PTS OBT`
- `MAX TRIM`
- `PTS OBT`

### Groupe T3

- `5eP`
- `6eP`
- `MAX EX`
- `PTS OBT`
- `MAX TRIM`
- `PTS OBT`

### Groupe Total

- `MAX PTS`
- `OBT`

## Regles documentaires

### Regle 1 - Ordre des lignes

L'ordre des lignes vient du backend, jamais du template.

### Regle 2 - Groupes et sous-totaux

Le template doit supporter visuellement :

- titres de domaine
- titres de sous-groupe
- lignes de branche normales
- lignes `Sous-total`
- ligne `Maxima generaux`

### Regle 3 - Variabilite des branches

Le nombre de branches varie selon :

- degre elementaire
- degre moyen
- degre terminal

Le template ne doit donc pas coder la liste des branches.

### Regle 4 - Variabilite des maxima

Les maxima doivent etre affiches comme donnees dynamiques, pas comme contenu fixe du fond.

### Regle 5 - Alignement numerique

Toutes les valeurs numeriques doivent etre alignees de facon stable pour garder l'effet de grille officielle.

## Zones dynamiques a surimprimer

Chaque zone devra etre calibree dans un futur `zone-map`.

## Identifiants de zones

### Bloc administratif

- `z_admin_id`
- `z_admin_province`
- `z_admin_ville`
- `z_admin_commune`
- `z_admin_ecole`
- `z_admin_code_ecole`

### Bloc eleve

- `z_eleve_nom`
- `z_eleve_sexe`
- `z_eleve_lieu_naissance`
- `z_eleve_date_naissance`
- `z_eleve_classe`
- `z_eleve_numero_permanent`

### Titre

- `z_titre_niveau`
- `z_titre_annee_scolaire`

### Tableau

- `z_table_header`
- `z_table_rows_start`
- `z_table_rows_end`
- `z_table_total_generaux`

### Synthese

- `z_synthese_pourcentage`
- `z_synthese_place`
- `z_synthese_nombre_eleves`
- `z_synthese_application`
- `z_synthese_conduite`

### Signatures et decision

- `z_decision_passe`
- `z_decision_double`
- `z_fait_a`
- `z_date_signature`
- `z_signature_instituteur`
- `z_signature_responsable`
- `z_signature_eleve`
- `z_cachet_ecole`

## Donnees backend minimales requises

Pour un `BULL-TPL-01` correct, le backend doit fournir au renderer :

- id ecole
- identite ecole exploitable
- annee scolaire lisible
- classe lisible
- structure `TRIMESTRIEL`
- lignes triees
- groupes et sous-totaux exploitables si affiches
- maxima par ligne
- total general
- pourcentage
- rang
- nombre eleves
- application
- conduite

## Ce qui est deja disponible

Le socle backend apporte deja :

- `idEcole`
- `idClassePedagogique`
- `idAnneeScolaire`
- `idProgrammeNiveau`
- `versionReferentielProgramme`
- `typeStructureEvaluation`
- `templateDocumentaireSuggere`

## Ce qui restera a enrichir pour la fidelite finale

- libelles ecole humains complets
- identite eleve riche
- groupes documentaires explicites si necessaire
- maxima documentaires deja prets pour rendu
- assets institutionnels reels
- map precise des coordonnees

## Regles overlay

### Overlay 1

Les etiquettes fixes restent dans le fond.

### Overlay 2

Les valeurs dynamiques sont ecrites exactement dans les cadres laisses vides.

### Overlay 3

Le tableau doit etre injecte sur une grille de placement fixe.

### Overlay 4

Les sous-totaux et maxima generaux doivent tomber exactement sur les lignes prevues du modele.

### Overlay 5

Les zones de signatures doivent rester visuellement intactes meme si un asset manque.

## Critere d'acceptation pour `BULL-TPL-01`

`BULL-TPL-01` sera considere pret si :

- le fond officiel est identique au modele retenu
- la geometrie globale est conservee
- les donnees tombent dans les bons cadres
- le tableau garde la lecture officielle
- les maxima et sous-totaux restent alignes
- la synthese bas de page tombe dans les bonnes zones
- l'impression visuelle est conforme a l'original

## Suite immediate recommandee

Apres ce document, il faudra produire :

1. le background maitre retenu pour `BULL-TPL-01`
2. la `zone-map` exacte
3. la strategie de police
4. un jeu de donnees test de calibration

## Verdict

`BULL-TPL-01` est maintenant suffisamment defini pour ouvrir la phase suivante :

- calibration des coordonnees
- puis implementation du renderer overlay reel

Etat backend reel deja ferme :

- fond maitre neutralise disponible
- renderer PDF reel branche sur le fond officiel
- premiere fenetre de tableau rendue a partir des lignes bulletin et des colonnes reelles
- geometrie de colonnes specifique `BULL-TPL-01` posee pour approcher la grille officielle
- lignes bulletin maintenant capables de porter aussi les maxima documentaires par colonne quand la generation les alimente depuis les fiches de cotation

Limites structurelles restantes sur ce point :

- aucune sur les zones administratives `province`, `ville`, `commune / territoire`
- la seule suite operationnelle concerne des donnees d'ecole a renseigner dans l'environnement cible quand des ecoles reelles existent deja

## Statut De Figement

Le statut officiel retenu pour ce document est :

- `PHASE 39 FIGEE`
