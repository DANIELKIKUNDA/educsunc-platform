# 40 - Zone Map BULL-TPL-01

## Objet

Ce document fixe la zone map documentaire exploitable pour le template :

- `BULL-TPL-01`
- `bulletin-trimestriel-general`

Il ne remplace pas :

- [37-specification-technique-bulletins-pdf.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/37-specification-technique-bulletins-pdf.md)
- [38-specification-overlay-bulletins-officiels.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/38-specification-overlay-bulletins-officiels.md)
- [39-specification-bull-tpl-01.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/39-specification-bull-tpl-01.md)

Il transforme `BULL-TPL-01` en contrat de placement concret entre :

- le fond officiel
- les donnees backend
- le futur renderer overlay

## Decision importante

Le fond maitre de `BULL-TPL-01` ne doit pas etre une page PDF brute reprise telle quelle.

Raison :

- les pages sources portent deja un niveau imprime
- les pages sources portent deja une annee scolaire imprimee
- certaines zones administratives sont deja remplies par des pointilles ou des mentions variables

Donc le bon choix technique n'est pas :

- `background brut page 001`

mais :

- `background officiel neutralise`

Autrement dit :

- on conserve la forme officielle
- on conserve le drapeau
- on conserve le filigrane
- on conserve les cadres
- on conserve les mentions legales
- on neutralise seulement les zones qui doivent rester dynamiques

## Sources de preuve

Pages temoins utilisees :

- [.tmp/bulletins-extraits/page-001.txt](/C:/Users/MON%20PC/Documents/EducSyn/.tmp/bulletins-extraits/page-001.txt)
- [.tmp/bulletins-extraits/page-003.txt](/C:/Users/MON%20PC/Documents/EducSyn/.tmp/bulletins-extraits/page-003.txt)
- [.tmp/bulletins-extraits/page-004.txt](/C:/Users/MON%20PC/Documents/EducSyn/.tmp/bulletins-extraits/page-004.txt)

Sources backend deja en place :

- [BulletinDocumentDataReadModel.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/application/read-models/BulletinDocumentDataReadModel.ts)
- [BulletinDocumentDataBuilderService.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/infrastructure/services/BulletinDocumentDataBuilderService.ts)
- [PdfBulletinService.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/infrastructure/services/PdfBulletinService.ts)

## Systeme de coordonnees

La zone map officielle doit etre stockee dans un repere absolu lie a la page PDF finale.

Convention cible :

- origine en haut a gauche
- axe `x` vers la droite
- axe `y` vers le bas
- unite finale : points PDF

Pour la specification documentaire, on note d'abord les zones par bandes et par ancrages.

La calibration numerique exacte sera faite sur le fond maitre retenu.

## Familles de zones

`BULL-TPL-01` porte 9 familles de zones.

1. `Z-INSTITUTION`
2. `Z-ADMIN`
3. `Z-ELEVE`
4. `Z-TITRE`
5. `Z-TABLE-HEADER`
6. `Z-TABLE-BODY`
7. `Z-SYNTHESE`
8. `Z-DECISION-SIGNATURE`
9. `Z-LEGAL`

## Regle de neutralisation du fond

Les zones suivantes doivent etre vides dans le fond maitre et remplies par overlay :

- niveau du bulletin
- annee scolaire
- province educationnelle
- ville
- commune ou territoire
- ecole
- code ecole
- identite eleve complete
- classe
- numero permanent
- toutes les valeurs du tableau
- pourcentage
- place
- nombre d'eleves
- application
- conduite
- ville de signature
- date de signature
- signatures et cachet si variables

Les zones suivantes restent fixes dans le fond :

- armoiries ou drapeau
- entetes ministeriels
- etiquettes de formulaire
- cadres et filets
- libelles des colonnes
- bloc legal
- textes fixes de decision

## Contrat de zone

Chaque zone doit porter les proprietes suivantes :

- `id`
- `famille`
- `page`
- `ancrage`
- `alignement`
- `mode`
- `source`
- `politiqueOverflow`
- `criticite`

Definitions :

- `ancrage` : position attendue dans la page
- `alignement` : gauche, centre ou droite
- `mode` : texte simple, bloc multiline, case, tableau, image
- `source` : chemin dans le `BulletinDocumentData`
- `politiqueOverflow` : tronquer, reduire, multilignes, interdire
- `criticite` : critique, forte, standard

## Zones par famille

## Z-INSTITUTION

### `z_institution_pays`

- page : `1`
- ancrage : bande haute centrale
- alignement : `center`
- mode : `text`
- source : `identiteInstitutionnelle.pays`
- overflow : `reduce-font`
- criticite : `forte`

### `z_institution_ministere`

- page : `1`
- ancrage : sous la ligne pays
- alignement : `center`
- mode : `text`
- source : `identiteInstitutionnelle.ministere`
- overflow : `reduce-font`
- criticite : `forte`

### `z_institution_sous_titre`

- page : `1`
- ancrage : sous la ligne ministere
- alignement : `center`
- mode : `text`
- source : `identiteInstitutionnelle.sousTitre`
- overflow : `reduce-font`
- criticite : `standard`

## Z-ADMIN

### `z_admin_id_document`

- page : `1`
- ancrage : haut gauche du bloc administratif
- alignement : `left`
- mode : `text`
- source : `meta.idBulletinEleve`
- overflow : `truncate`
- criticite : `standard`

### `z_admin_province`

- page : `1`
- ancrage : ligne province educationnelle
- alignement : `left`
- mode : `text`
- source : `identiteInstitutionnelle.provinceEducationnelle`
- overflow : `truncate`
- criticite : `forte`

### `z_admin_ville`

- page : `1`
- ancrage : ligne ville
- alignement : `left`
- mode : `text`
- source : `identiteInstitutionnelle.ville`
- overflow : `truncate`
- criticite : `forte`

### `z_admin_commune_territoire`

- page : `1`
- ancrage : ligne commune / territoire
- alignement : `left`
- mode : `text`
- source : `identiteInstitutionnelle.communeOuTerritoire`
- overflow : `truncate`
- criticite : `forte`

### `z_admin_ecole`

- page : `1`
- ancrage : ligne ecole
- alignement : `left`
- mode : `text`
- source : `identiteInstitutionnelle.nomEcole`
- overflow : `reduce-font`
- criticite : `critique`

### `z_admin_code_ecole`

- page : `1`
- ancrage : case code
- alignement : `left`
- mode : `text`
- source : `identiteInstitutionnelle.codeEcole`
- overflow : `truncate`
- criticite : `forte`

## Z-ELEVE

### `z_eleve_nom_complet`

- page : `1`
- ancrage : ligne eleve
- alignement : `left`
- mode : `text`
- source : `identiteEleve.nomComplet`
- overflow : `reduce-font`
- criticite : `critique`

### `z_eleve_sexe`

- page : `1`
- ancrage : case sexe
- alignement : `center`
- mode : `text`
- source : `identiteEleve.sexe`
- overflow : `truncate`
- criticite : `forte`

### `z_eleve_lieu_naissance`

- page : `1`
- ancrage : ligne ne(e) a
- alignement : `left`
- mode : `text`
- source : `identiteEleve.lieuNaissance`
- overflow : `truncate`
- criticite : `forte`

### `z_eleve_date_naissance`

- page : `1`
- ancrage : ligne le
- alignement : `center`
- mode : `text`
- source : `identiteEleve.dateNaissance`
- overflow : `truncate`
- criticite : `forte`

### `z_eleve_classe`

- page : `1`
- ancrage : ligne classe
- alignement : `left`
- mode : `text`
- source : `identiteEleve.libelleClasse`
- overflow : `reduce-font`
- criticite : `critique`

### `z_eleve_numero_permanent`

- page : `1`
- ancrage : case numero permanent
- alignement : `left`
- mode : `text`
- source : `identiteEleve.numeroPermanent`
- overflow : `truncate`
- criticite : `forte`

## Z-TITRE

### `z_titre_niveau`

- page : `1`
- ancrage : ligne centrale de titre
- alignement : `center`
- mode : `text`
- source : `meta.libelleNiveauDocumentaire`
- overflow : `reduce-font`
- criticite : `critique`

### `z_titre_annee_scolaire`

- page : `1`
- ancrage : fin de ligne de titre
- alignement : `center`
- mode : `text`
- source : `meta.libelleAnneeScolaire`
- overflow : `truncate`
- criticite : `critique`

## Z-TABLE-HEADER

### `z_table_header_branches`

- page : `1`
- ancrage : tete colonne 1
- alignement : `center`
- mode : `text`
- source : `structure.entetesColonnes[0]`
- overflow : `truncate`
- criticite : `standard`

### `z_table_header_t1`

- page : `1`
- ancrage : tete groupe trimestre 1
- alignement : `center`
- mode : `text`
- source : `structure.entetesColonnes[1]`
- overflow : `truncate`
- criticite : `standard`

### `z_table_header_t2`

- page : `1`
- ancrage : tete groupe trimestre 2
- alignement : `center`
- mode : `text`
- source : `structure.entetesColonnes[2]`
- overflow : `truncate`
- criticite : `standard`

### `z_table_header_t3`

- page : `1`
- ancrage : tete groupe trimestre 3
- alignement : `center`
- mode : `text`
- source : `structure.entetesColonnes[3]`
- overflow : `truncate`
- criticite : `standard`

### `z_table_header_total`

- page : `1`
- ancrage : tete groupe total
- alignement : `center`
- mode : `text`
- source : `structure.entetesColonnes[4]`
- overflow : `truncate`
- criticite : `standard`

## Z-TABLE-BODY

Le tableau principal suit une grille fixe.

### Colonnes documentaires

L'ordre des colonnes de rendu doit etre :

1. `branche`
2. `t1_max_per`
3. `t1_p1`
4. `t1_p2`
5. `t1_max_ex`
6. `t1_pts_obt_ex`
7. `t1_max_trim`
8. `t1_pts_obt_trim`
9. `t2_p3`
10. `t2_p4`
11. `t2_max_ex`
12. `t2_pts_obt_ex`
13. `t2_max_trim`
14. `t2_pts_obt_trim`
15. `t3_p5`
16. `t3_p6`
17. `t3_max_ex`
18. `t3_pts_obt_ex`
19. `t3_max_trim`
20. `t3_pts_obt_trim`
21. `total_max_pts`
22. `total_pts_obt`

### Types de lignes

Le renderer doit supporter 5 types visuels de lignes :

1. `domaine`
2. `sous_domaine`
3. `branche_normale`
4. `sous_total`
5. `maxima_generaux`

### `z_table_rows_window`

- page : `1`
- ancrage : corps du grand tableau
- alignement : `n/a`
- mode : `table`
- source : `structure.lignes`
- overflow : `interdire`
- criticite : `critique`

Regles :

- la hauteur de ligne est fixe par template
- les lignes numeriques sont alignees a droite
- les libelles de branches sont alignes a gauche
- les lignes `domaine` et `sous_domaine` peuvent fusionner visuellement plusieurs colonnes
- les `sous_total` gardent la grille numerique
- `maxima_generaux` termine obligatoirement le tableau

## Z-SYNTHESE

La zone synthese doit mapper le dernier bloc `application / conduite`.

### `z_synthese_pourcentage`

- page : `1`
- ancrage : case pourcentage
- alignement : `center`
- mode : `text`
- source : `structure.resumeGlobal.pourcentage`
- overflow : `truncate`
- criticite : `critique`

### `z_synthese_place`

- page : `1`
- ancrage : case place
- alignement : `center`
- mode : `text`
- source : `structure.resumeGlobal.place`
- overflow : `truncate`
- criticite : `critique`

### `z_synthese_nombre_eleves`

- page : `1`
- ancrage : case nombre d'eleves
- alignement : `center`
- mode : `text`
- source : `structure.resumeGlobal.nombreEleves`
- overflow : `truncate`
- criticite : `forte`

### `z_synthese_application`

- page : `1`
- ancrage : case application
- alignement : `center`
- mode : `text`
- source : `structure.resumeGlobal.application`
- overflow : `truncate`
- criticite : `forte`

### `z_synthese_conduite`

- page : `1`
- ancrage : case conduite
- alignement : `center`
- mode : `text`
- source : `structure.resumeGlobal.conduite`
- overflow : `truncate`
- criticite : `forte`

## Z-DECISION-SIGNATURE

### `z_decision_passe`

- page : `1`
- ancrage : ligne decision passe
- alignement : `left`
- mode : `checkbox-or-marker`
- source : `structure.resumeGlobal.decisionPasse`
- overflow : `interdire`
- criticite : `forte`

### `z_decision_double`

- page : `1`
- ancrage : ligne decision double
- alignement : `left`
- mode : `checkbox-or-marker`
- source : `structure.resumeGlobal.decisionDouble`
- overflow : `interdire`
- criticite : `forte`

### `z_signature_ville`

- page : `1`
- ancrage : ligne fait a
- alignement : `left`
- mode : `text`
- source : `identiteInstitutionnelle.villeSignature`
- overflow : `truncate`
- criticite : `forte`

### `z_signature_date`

- page : `1`
- ancrage : ligne date signature
- alignement : `center`
- mode : `text`
- source : `meta.dateEditionDocument`
- overflow : `truncate`
- criticite : `forte`

### `z_signature_chef`

- page : `1`
- ancrage : zone chef d'etablissement
- alignement : `center`
- mode : `image-or-text`
- source : `assets.signatureChefEtablissement`
- overflow : `n/a`
- criticite : `forte`

### `z_signature_responsable`

- page : `1`
- ancrage : zone responsable
- alignement : `center`
- mode : `text-or-image`
- source : `signatures.responsableLegal`
- overflow : `reduce-font`
- criticite : `standard`

### `z_signature_eleve`

- page : `1`
- ancrage : zone signature eleve
- alignement : `center`
- mode : `text-or-image`
- source : `signatures.eleve`
- overflow : `reduce-font`
- criticite : `standard`

### `z_cachet_ecole`

- page : `1`
- ancrage : zone sceau ecole
- alignement : `center`
- mode : `image`
- source : `assets.cachet`
- overflow : `n/a`
- criticite : `forte`

## Z-LEGAL

Le bloc legal reste majoritairement fixe dans le fond.

Une seule zone dynamique y est acceptable si la reference officielle varie selon la famille :

### `z_legal_reference`

- page : `1`
- ancrage : fin de ligne note importante
- alignement : `left`
- mode : `text`
- source : `meta.referenceDocumentaire`
- overflow : `truncate`
- criticite : `standard`

## Mapping backend reel vs cible documentaire

## Deja disponible

Les champs suivants existent deja ou sont amorces dans le socle backend :

- `meta.idBulletinEleve`
- `meta.idEcole`
- `meta.idEleve`
- `meta.idClassePedagogique`
- `meta.idAnneeScolaire`
- `meta.idProgrammeNiveau`
- `meta.versionReferentielProgramme`
- `meta.typeStructureEvaluation`
- `meta.templateDocumentaire`
- `identiteInstitutionnelle.nomEcole`
- `identiteInstitutionnelle.codeEcole`
- `structure.entetesColonnes`
- `structure.lignes`
- `structure.blocsApplicationConduite`

## Cible documentaire encore necessaire

Pour remplir toutes les zones officielles sans approximation, le `BulletinDocumentData` devra encore porter explicitement :

- `identiteInstitutionnelle.provinceEducationnelle`
- `identiteInstitutionnelle.ville`
- `identiteInstitutionnelle.communeOuTerritoire`
- `identiteInstitutionnelle.villeSignature`

Etat backend actuel :
- ces quatre sources sont maintenant alimentees par le modele institutionnel de l'ecole, avec `villeSignature` derivee de `ville`
- `identiteEleve.nomComplet`
- `identiteEleve.sexe`
- `identiteEleve.lieuNaissance`
- `identiteEleve.dateNaissance`
- `identiteEleve.libelleClasse`
- `identiteEleve.numeroPermanent`
- `meta.libelleNiveauDocumentaire`
- `meta.libelleAnneeScolaire`
- `meta.dateEditionDocument`
- `meta.referenceDocumentaire`
- `structure.resumeGlobal.pourcentage`
- `structure.resumeGlobal.place`
- `structure.resumeGlobal.nombreEleves`
- `structure.resumeGlobal.application`
- `structure.resumeGlobal.conduite`
- `structure.resumeGlobal.decisionPasse`
- `structure.resumeGlobal.decisionDouble`

## Regles de rendu critiques

### Regle 1

Le tableau ne doit jamais recalculer l'ordre des branches.

### Regle 2

Les maxima et sous-totaux viennent du backend ou d'une projection documentaire explicite, jamais d'un calcul implicite du PDF.

### Regle 3

Le titre central doit rester dynamique pour permettre :

- changement d'annee scolaire
- changement de niveau
- changement de variante proche

### Regle 4

Une zone critique ne doit jamais pousser un cadre voisin.

### Regle 5

Si une signature ou un cachet manque, le renderer doit conserver la structure vide, sans casser la mise en page.

## Strategie de calibration

La calibration exacte de `BULL-TPL-01` doit suivre cet ordre :

1. choisir la page maitre officielle de reference
2. produire un fond neutralise haute fidelite
3. mesurer le format exact de page
4. poser la grille du tableau
5. calibrer les blocs admin et eleve
6. calibrer la synthese
7. calibrer signatures et cachet
8. tester avec un jeu de donnees extremes

## Jeu de test minimal

La calibration doit etre verifiee avec au moins :

1. un eleve au nom court
2. un eleve au nom long
3. une classe au libelle long
4. un bulletin avec beaucoup de sous-totaux
5. un bulletin avec signature et cachet
6. un bulletin sans signature ni cachet

## Verdict

`BULL-TPL-01` dispose maintenant d'une vraie zone map documentaire :

- suffisamment precise pour guider le renderer
- suffisamment stricte pour eviter les derives
- suffisamment honnete pour ne pas pretendre a une calibration numerique deja faite

Etat actuellement fige dans le repo :

- fond maitre neutralise disponible
- calibration partielle versionnee pour les blocs admin, eleve, titre, synthese, signatures et fenetre du tableau
- zones institutionnelles hautes et reference legale encore a ajuster finement
- renderer capable d'utiliser directement les zones deja calibrees
- premiere grille de tableau rendue avec des largeurs de colonnes dediees a `BULL-TPL-01`
- zones deja effectivement alimentees par le backend : `id document`, `titre niveau`, `eleve`, `sexe`, `lieu/date de naissance`, `classe`, `numero permanent`, `annee scolaire`, `application`, `conduite`, `date de signature`, `reference legale`
- maxima documentaires maintenant imprimables lorsque la generation du bulletin est alimentee par les fiches de cotation reelles

Dernier affinage ferme :

- `date de naissance` affichee au format documentaire
- `reference legale` maintenant calibree et imprimable dans le fond maitre

La prochaine fermeture indispensable n'est plus une discussion de forme, mais :

1. enrichir le `BulletinDocumentData` avec les champs documentaires manquants
2. affiner numeriquement la calibration des zones sur le fond neutralise versionne
3. implementer le renderer overlay reel

## Statut De Figement

Le statut officiel retenu pour ce document est :

- `PHASE 40 FIGEE`
