# 45 - Specification Technique Proclamation PDF

## Objet

Ce document fige la traduction technique de `PROCL-TPL-01` cote backend.

Il complete :

- [44-specification-proclamation-officielle.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/44-specification-proclamation-officielle.md)
- [36-specification-documents-officiels.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/36-specification-documents-officiels.md)

Il ne redefine ni le metier, ni les permissions, ni les workflows.

## Template cible

Le template officiel actuellement supporte est :

- `PROCL-TPL-01` `liste-proclamation-classe`

Son package documentaire versionne est stocke dans :

- [layout.manifest.json](/C:/Users/MON%20PC/Documents/EducSyn/docs/assets/proclamations_templates/PROCL-TPL-01/layout.manifest.json)
- [background.manifest.json](/C:/Users/MON%20PC/Documents/EducSyn/docs/assets/proclamations_templates/PROCL-TPL-01/background.manifest.json)
- [zones.calibration.json](/C:/Users/MON%20PC/Documents/EducSyn/docs/assets/proclamations_templates/PROCL-TPL-01/zones.calibration.json)
- [background.master.pdf](/C:/Users/MON%20PC/Documents/EducSyn/docs/assets/proclamations_templates/PROCL-TPL-01/background.master.pdf)

## Sources backend branchees

- [ProclamationDocumentDataReadModel.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/application/read-models/ProclamationDocumentDataReadModel.ts)
- [ProclamationTemplateLayoutReadModel.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/application/read-models/ProclamationTemplateLayoutReadModel.ts)
- [ProclamationMasterBackgroundManifestReadModel.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/application/read-models/ProclamationMasterBackgroundManifestReadModel.ts)
- [ProclamationZoneCalibrationReadModel.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/application/read-models/ProclamationZoneCalibrationReadModel.ts)
- [ProclamationTemplatePackageReadModel.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/application/read-models/ProclamationTemplatePackageReadModel.ts)
- [ProclamationDocumentContextLoaderService.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/infrastructure/services/ProclamationDocumentContextLoaderService.ts)
- [ProclamationDocumentDataBuilderService.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/infrastructure/services/ProclamationDocumentDataBuilderService.ts)
- [ProclamationTemplateLayoutRegistryService.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/infrastructure/services/ProclamationTemplateLayoutRegistryService.ts)
- [ProclamationTemplatePackageInspectorService.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/infrastructure/services/ProclamationTemplatePackageInspectorService.ts)
- [PdfProclamationService.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/infrastructure/services/PdfProclamationService.ts)
- [DocumentAssetsEcoleAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/infrastructure/adapters/DocumentAssetsEcoleAdapter.ts)

## Architecture technique retenue

Le pipeline officiel de proclamation PDF est maintenant :

1. `ProclamationClasseOutput`
2. `ProclamationDocumentDataBuilderService`
3. `ProclamationTemplateLayoutRegistryService`
4. `ProclamationTemplatePackageInspectorService`
5. `PdfProclamationService`

## Comportement reel du renderer

Le renderer suit maintenant deux modes.

### 1. Mode template industriel

Si le package `PROCL-TPL-01` est present et complet :

- le fond maitre `background.master.pdf` est charge
- le layout est resolu
- la calibration est chargee
- le contenu est injecte dans les zones et tables calibrees
- le logo ecole est recharge depuis le stockage documentaire officiel si disponible

### 2. Mode fallback robuste

Si le package documentaire est absent ou incomplet :

- le service retombe sur un rendu PDF generique structure
- sans casser l'export backend

## Blocs reels actuellement rendus

Le renderer proclamation gere deja :

- identite ecole
- logo ecole dynamique si disponible
- contacts institutionnels
- titre du document
- libelle de periode
- classe
- section
- titulaire
- tableau principal des classes
- pagination du classement
- statistiques
- bloc `NON CLASSES`

Le bloc `NON CLASSES` est rendu avec les colonnes :

- `N°`
- `Noms, post-noms et prenoms`
- `Sexe`
- `Motifs`

## Regles de pagination branchees

### Page 1

- en-tete complet
- premiere partie du classement
- statistiques

### Page 2

- suite du classement
- bloc `NON CLASSES`

### Pages supplementaires

- repetent la page 2 documentaire si la charge l'exige
- conservent un libelle de periode totalement dynamique selon la sortie backend

## Etat du package

Le package `PROCL-TPL-01` est actuellement :

- layout present
- background manifest present
- background master present
- calibration presente
- inspectable par le backend
- utilisable par le renderer

Niveau de preparation atteint :

- `PRET_POUR_RENDERER_GRAPHIQUE`

## Verification backend

Les preuves automatisees sont dans :

- [PdfProclamationService.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/tests/infrastructure/services/PdfProclamationService.spec.ts)

Les verifications couvertes sont :

- resolution du template
- construction du document data
- degradation de periode annuelle
- generation d'un vrai PDF
- inspection du package `PROCL-TPL-01`
- pagination sur liste longue
- branchement de l'adaptateur officiel des assets documentaires ecole

## Limites restantes

Les limites restantes ne sont plus structurelles.

Elles sont uniquement de precision documentaire :

- affinage de calibration au millimetre
- ajustements de densite visuelle
- eventuelle neutralisation graphique plus stricte du fond

## Verdict

`PROCL-TPL-01` est maintenant :

- documente
- package
- inspectable
- branche
- teste

Le renderer proclamation est donc industrialise au meme esprit que le lot bulletin, meme si la finition visuelle peut encore etre poussee.

## Etat

- `45` est maintenant pose comme specification technique de proclamation PDF
- `PHASE 45 FIGEE`
