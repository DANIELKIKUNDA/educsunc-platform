# Specification Technique Synthese PDF

Ce document fige la premiere industrialisation documentaire de la synthese PDF.

## Etat actuel

Le backend produit maintenant un vrai PDF structure de synthese via :

- [PdfSyntheseService.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/infrastructure/services/PdfSyntheseService.ts)

Ce rendu :

- recharge le contexte reel de l'ecole et de l'annee
- regroupe les lignes par section
- produit un tableau par section
- calcule et affiche :
  - total section
  - total ecole
- s'appuie maintenant sur le fond maitre officiel `SYN-TPL-01`

## Package documentaire versionne

Le modele source officiel est maintenant versionne dans :

- [background.manifest.json](/C:/Users/MON%20PC/Documents/EducSyn/docs/assets/syntheses_templates/SYN-TPL-01/background.manifest.json)
- [layout.manifest.json](/C:/Users/MON%20PC/Documents/EducSyn/docs/assets/syntheses_templates/SYN-TPL-01/layout.manifest.json)
- [zones.calibration.json](/C:/Users/MON%20PC/Documents/EducSyn/docs/assets/syntheses_templates/SYN-TPL-01/zones.calibration.json)
- [background.master.pdf](/C:/Users/MON%20PC/Documents/EducSyn/docs/assets/syntheses_templates/SYN-TPL-01/background.master.pdf)

Source de verite :

- [resultat_synthese.pdf](/C:/Users/MON%20PC/Documents/EducSyn/docs/assets/bulletins_sources/resultat_synthese.pdf)

## Lecture CTO

La synthese PDF est maintenant industrialisee a trois niveaux :

1. rendu backend reel et exploitable
2. package template officiel versionne
3. renderer template-first deja branche sur ce package

La calibration a maintenant ete montee d'un cran :

- zones fines versionnees pour le nom ecole, coordonnees, titre, badge section, meta, resume et footer
- rendu backend aligne sur ces zones declaratives plutot que sur des positions implicites
- test de non-regression sur l'etat de calibration du package
- positions des blocs statistiques du resume desormais portees par le template
- ratios de colonnes du tableau desormais portees par le template
- metrics de finition visuelle portees par le template : accents, interlignes, padding et offsets

Ce qui peut encore etre pousse a moyen terme pour une conformite documentaire absolue :

- micro-ajustements pixel par pixel apres validation visuelle imprimee
- eventuelle variante template si une autre maquette officielle de synthese apparait

## Statut

`SYN-TPL-01 VERSIONNE, BRANCHE ET CALIBRE STRUCTURELLEMENT`

`FINITION VISUELLE FINE RESTANTE UNIQUEMENT`
