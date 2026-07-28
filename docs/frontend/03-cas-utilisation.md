# Phase 3 - Cas d'Utilisation Frontend EduSync

## Statut

Ce document fixe la reference officielle des cas d'utilisation frontend a partir du backend EduSync.

Il ne propose aucun nouveau cas d'utilisation.

Il ne deduit rien depuis :

- des ecrans
- des menus
- des dashboards
- de la navigation

Il decrit uniquement :

- les cas d'utilisation reels attestes par le backend
- leur acteur d'exercice
- leur BC de rattachement
- leur origine de preuve
- leurs contraintes importantes

## Sources Backend Utilisees

Les cas d'utilisation sont etablis a partir des sources suivantes :

- composition des routes de test et routes protegees : [GlobalTestBootstrap.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/setup/GlobalTestBootstrap.ts)
- workflows e2e :
  - [enseignant-workflow.e2e.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/e2e/enseignant-workflow.e2e.spec.ts)
  - [titulaire-workflow.e2e.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/e2e/titulaire-workflow.e2e.spec.ts)
  - [prefet-workflow.e2e.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/e2e/prefet-workflow.e2e.spec.ts)
  - [directeur-etudes-workflow.e2e.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/e2e/directeur-etudes-workflow.e2e.spec.ts)
  - [directeur-discipline-workflow.e2e.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/e2e/directeur-discipline-workflow.e2e.spec.ts)
  - [caissier-workflow.e2e.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/e2e/caissier-workflow.e2e.spec.ts)
  - [admin-ecole-workflow.e2e.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/e2e/admin-ecole-workflow.e2e.spec.ts)
  - [promoteur-organisation-workflow.e2e.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/e2e/promoteur-organisation-workflow.e2e.spec.ts)
  - [parent-workflow.e2e.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/e2e/parent-workflow.e2e.spec.ts)
- tests d'integration securite :
  - [security-bulletins.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-bulletins.integration.spec.ts)
  - [security-paiements.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-paiements.integration.spec.ts)
  - [security-referentiel.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-referentiel.integration.spec.ts)
  - [security-scolarite.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-scolarite.integration.spec.ts)
- workflows metier :
  - [bulletin.workflow.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/workflows/bulletin.workflow.spec.ts)
  - [abandon-transfert-parent.workflow.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/workflows/abandon-transfert-parent.workflow.spec.ts)
  - [perception.workflow.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/workflows/perception.workflow.spec.ts)
  - [inscription.workflow.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/workflows/inscription.workflow.spec.ts)
  - [rentree-scolaire.workflow.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/workflows/rentree-scolaire.workflow.spec.ts)
- policies et calcul d'autorisation :
  - [SecurityFacade.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/security/application/services/SecurityFacade.ts)
  - [SecurityCapacitesEffectivesService.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/security/application/services/SecurityCapacitesEffectivesService.ts)
  - [PolicyTitulariatEffectifParSection.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/security/domain/policies/PolicyTitulariatEffectifParSection.ts)
  - [PolicyEncodageCotes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/security/domain/policies/PolicyEncodageCotes.ts)

## Definition Officielle

Un cas d'utilisation frontend officiel est un usage reel du systeme :

- expose ou protege par le backend
- attribuable a un acteur reel
- confirme par une route, un use case de test, une integration ou un workflow backend

Le frontend devra donc construire ses workflows et ses futurs ecrans a partir de ces cas d'utilisation, et non a partir d'une intuition UI.

## Regles de Lecture de ce Document

Ce document doit etre lu avec les regles suivantes :

1. Ce document ne decrit pas encore les workflows.

2. Ce document ne decrit pas encore les ecrans.

3. Ce document ne decrit pas encore les menus.

4. Plusieurs cas d'utilisation peuvent appartenir a un meme workflow.

5. Un workflow peut impliquer plusieurs acteurs.

6. Les cas d'utilisation documentes ici sont volontairement independants de l'UI.

7. Les futurs ecrans seront construits a partir :
   - des acteurs
   - des permissions effectives
   - des cas d'utilisation
   - des workflows

8. Le backend reste la source officielle de verite.

9. Le frontend ne doit jamais inventer un cas d'utilisation absent du backend.

10. Les futures phases
    - workflows
    - navigation
    - dashboards
    - pages
    devront s'appuyer sur ce document.

## Regle Officielle Sur `TITULAIRE`

`TITULAIRE` reste un acteur derive.

Il n'est pas un role brut de base.

Pour la phase cas d'utilisation, cela signifie :

- les cas d'utilisation `TITULAIRE` existent bien comme usages d'experience
- mais leur activation depend de la doctrine metier officielle du titulariat

### Activation du Titulariat

#### Maternelle

- `ENSEIGNANT responsable de classe`
- = `TITULAIRE` effectif

#### Primaire

- `ENSEIGNANT responsable de classe`
- = `TITULAIRE` effectif

#### Secondaire

- `ENSEIGNANT responsable de classe`
- + `AffectationTitulariat` active et scoped
- = `TITULAIRE` effectif

### Consequence de Lecture

Le frontend peut donc documenter des cas d'utilisation sous l'acteur `TITULAIRE`.

Mais l'implique UX devra se brancher sur la verite backend :

- permissions effectives
- titulariat effectif
- source du titulariat effectif si exposee

## Cas d'Utilisation Officiels Par Acteur

## `ENSEIGNANT`

### 1. Encoder une fiche de bulletin

- BC : `bulletins-evaluations`
- origine de preuve :
  - route `POST /bc/bulletins/fiches/encoder`
  - [security-bulletins.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-bulletins.integration.spec.ts)
  - [enseignant-workflow.e2e.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/e2e/enseignant-workflow.e2e.spec.ts)
- contraintes importantes :
  - permission `cotes.write`
  - policy d'encodage des cotes
  - scope organisation / ecole valide
  - acteur pedagogiquement concerne

### 2. Lire la scolarite

- BC : `scolarite-eleves`
- origine de preuve :
  - route `GET /bc/scolarite/lire`
  - [security-scolarite.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-scolarite.integration.spec.ts)
- contraintes importantes :
  - permission `eleves.read`
  - scope valide

### 3. Lire le referentiel

- BC : `referentiel-academique`
- origine de preuve :
  - route `GET /bc/referentiel/lire`
  - [security-referentiel.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-referentiel.integration.spec.ts)
- contraintes importantes :
  - permission `referentiel.read`
  - scope valide

### 4. Lire les finances

- BC : `paiements-facturation`
- origine de preuve :
  - route `GET /bc/finances/lire`
  - [enseignant-workflow.e2e.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/e2e/enseignant-workflow.e2e.spec.ts)
- contraintes importantes :
  - permission `paiements.read`
  - scope valide

### 5. Consulter les statistiques de sa classe

- BC : `bulletins-evaluations`
- origine de preuve :
  - lecture `PED-05`
  - [security-statistiques.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-statistiques.integration.spec.ts)
  - [StatistiquesUseCases.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/tests/application/use-cases/StatistiquesUseCases.spec.ts)
- contraintes importantes :
  - permission `bulletins.read`
  - bonne classe
  - bonne annee scolaire
  - titulariat effectif actif
  - pas de lecture globale d'ecole via ce cas

## `TITULAIRE`

Les cas d'utilisation ci-dessous restent documentes sous l'acteur `TITULAIRE`, mais leur activation depend de la doctrine du titulariat.

### 1. Encoder une fiche de bulletin

- BC : `bulletins-evaluations`
- origine de preuve :
  - route `POST /bc/bulletins/fiches/encoder`
  - [bulletin.workflow.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/workflows/bulletin.workflow.spec.ts)
- contraintes importantes :
  - capacites de base `ENSEIGNANT`
  - pas de droit d'encodage propre au titulariat

Lecture doctrinale officielle :

- ce cas d'utilisation n'ouvre pas un workflow distinct d'encodage pour `TITULAIRE`
- il redescrit le meme cas metier que celui de l'`ENSEIGNANT`, lorsque l'enseignant concerne est aussi `TITULAIRE`
- le titulariat devient structurant pour `Generer un bulletin` et `Generer une proclamation`, pas pour l'encodage courant des cotes

### 2. Generer un bulletin

- BC : `bulletins-evaluations`
- origine de preuve :
  - route `POST /bc/bulletins/generer`
  - [security-bulletins.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-bulletins.integration.spec.ts)
  - [bulletin.workflow.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/workflows/bulletin.workflow.spec.ts)
  - [titulaire-workflow.e2e.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/e2e/titulaire-workflow.e2e.spec.ts)
- contraintes importantes :
  - permission effective `bulletins.generate`
  - bonne classe
  - bonne annee scolaire
  - bonne organisation
  - bonne ecole
  - titulariat effectif actif

### 3. Generer une proclamation

- BC : `bulletins-evaluations`
- origine de preuve :
  - route `POST /bc/proclamations/generer`
  - [bulletin.workflow.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/workflows/bulletin.workflow.spec.ts)
  - [titulaire-workflow.e2e.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/e2e/titulaire-workflow.e2e.spec.ts)
- contraintes importantes :
  - permission effective `proclamations.generate`
  - bonne classe
  - bonne annee scolaire
  - titulariat effectif actif

### 4. Lire les finances

- BC : `paiements-facturation`
- origine de preuve :
  - route `GET /bc/finances/lire`
  - [titulaire-workflow.e2e.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/e2e/titulaire-workflow.e2e.spec.ts)
- contraintes importantes :
  - permission `paiements.read`
  - scope valide

### 5. Consulter l'historique des paiements d'un eleve de sa classe si l'ecole l'autorise

- BC : `paiements-facturation`
- origine de preuve :
  - route `GET /api/eleves/:idEleve/paiements`
  - [AutorisationHistoriquePaiementsAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationHistoriquePaiementsAdapter.ts)
  - [security-historique-paiements-facturation.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-historique-paiements-facturation.integration.spec.ts)
- contraintes importantes :
  - permission `paiements.read`
  - bonne organisation
  - bonne ecole
  - classe titulaire effective obligatoire
  - bonne annee scolaire
  - parametrage ecole obligatoire

### 6. Consulter la situation financiere d'un eleve de sa classe si l'ecole l'autorise

- BC : `paiements-facturation`
- origine de preuve :
  - routes `GET /api/eleves/:idEleve/dette` et `GET /api/eleves/:idEleve/frais-exigibles`
  - [AutorisationSituationFinanciereEleveAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationSituationFinanciereEleveAdapter.ts)
  - [security-situation-financiere-paiements.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-situation-financiere-paiements.integration.spec.ts)
- contraintes importantes :
  - permission `paiements.read`
  - bonne organisation
  - bonne ecole
  - classe titulaire effective obligatoire
  - bonne annee scolaire
  - parametrage ecole obligatoire

### 7. Consulter le classement de sa classe

- BC : `bulletins-evaluations`
- origine de preuve :
  - lecture `PED-06`
  - [security-classements.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-classements.integration.spec.ts)
  - [ClassementsUseCases.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/tests/application/use-cases/ClassementsUseCases.spec.ts)
- contraintes importantes :
  - permission `bulletins.read`
  - bonne classe
  - bonne annee scolaire
  - titulariat effectif actif
  - pas de lecture globale d'ecole via ce cas

### 8. Recalculer le classement de sa classe

- BC : `bulletins-evaluations`
- origine de preuve :
  - lecture `PED-06`
  - [security-classements.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-classements.integration.spec.ts)
  - [ClassementsUseCases.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/tests/application/use-cases/ClassementsUseCases.spec.ts)
  - [BulletinsSagas.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/tests/application/sagas/BulletinsSagas.spec.ts)
- contraintes importantes :
  - permission effective `bulletins.generate`
  - bonne ecole
  - bonne classe
- bonne annee scolaire
- titulariat effectif actif

### 9. Encoder la conduite de sa classe

- BC : `bulletins-evaluations`
- origine de preuve :
  - route `POST /bc/bulletins/conduite`
  - [security-conduite.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-conduite.integration.spec.ts)
  - [ConduiteUseCases.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/tests/application/use-cases/ConduiteUseCases.spec.ts)
- contraintes importantes :
  - permission `cotes.write`
  - bonne ecole
  - bonne classe
  - bonne annee scolaire
  - titulariat effectif actif
  - `application` ne fait pas partie de ce cas d'utilisation humain

### 10. Consulter le centre d'analyse pedagogique de sa classe

- BC : `bulletins-evaluations`
- origine de preuve :
  - lecture `PED-08`
  - [security-resultats.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-resultats.integration.spec.ts)
  - [ResultatsUseCases.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/tests/application/use-cases/ResultatsUseCases.spec.ts)
- contraintes importantes :
  - permission `bulletins.read`
  - bonne ecole
  - bonne classe
  - bonne annee scolaire
  - titulariat effectif actif
  - couvre la consultation du resultat consolide, des diagnostics et des analyses associees

## `PREFET_ETUDES`

### 1. Lire les bulletins

- BC : `bulletins-evaluations`
- origine de preuve :
  - route `GET /bc/bulletins/lire`
  - [security-bulletins.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-bulletins.integration.spec.ts)
  - [prefet-workflow.e2e.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/e2e/prefet-workflow.e2e.spec.ts)
- contraintes importantes :
  - permission `bulletins.read`
  - absence de restriction bulletins
  - scope valide

### 2. Lire le referentiel

- BC : `referentiel-academique`
- origine de preuve :
  - route `GET /bc/referentiel/lire`
  - [security-referentiel.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-referentiel.integration.spec.ts)
- contraintes importantes :
  - permission `referentiel.read`
  - scope valide

### 3. Lire les paiements

- BC : `paiements-facturation`
- origine de preuve :
  - route `GET /bc/paiements/lire`
  - [security-paiements.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-paiements.integration.spec.ts)
- contraintes importantes :
  - permission `paiements.read`
  - scope valide

### 4. Percevoir certains frais delegues de sa section secondaire

- BC : `paiements-facturation`
- origine de preuve :
  - route `POST /api/paiements`
  - [AutorisationPerceptionPaiementAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationPerceptionPaiementAdapter.ts)
  - [security-perception-paiements-facturation.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-perception-paiements-facturation.integration.spec.ts)
- contraintes importantes :
  - permission brute `paiements.read`
  - bonne organisation
  - bonne ecole
  - bonne section secondaire
  - parametrage ecole obligatoire par type de frais
  - jamais `FRAIS_MINERVAL`

### 5. Annuler certains paiements delegues de sa section secondaire

- BC : `paiements-facturation`
- origine de preuve :
  - route `POST /api/paiements/:idPaiement/annulation`
  - [AutorisationAnnulationPaiementAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationAnnulationPaiementAdapter.ts)
  - [security-annulation-paiements-facturation.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-annulation-paiements-facturation.integration.spec.ts)
- contraintes importantes :
  - bonne organisation
  - bonne ecole
  - bonne section secondaire
  - parametrage ecole obligatoire par type de frais
  - jamais `FRAIS_MINERVAL`

### 6. Restituer certains paiements delegues de sa section secondaire

- BC : `paiements-facturation`
- origine de preuve :
  - route `POST /api/paiements/restitution`
  - [AutorisationRestitutionPaiementAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationRestitutionPaiementAdapter.ts)
  - [security-restitution-paiements-facturation.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-restitution-paiements-facturation.integration.spec.ts)
- contraintes importantes :
  - bonne organisation
  - bonne ecole
  - bonne section secondaire
  - parametrage ecole obligatoire par type de frais
  - jamais `FRAIS_MINERVAL`

### 7. Lire les finances

- BC : `paiements-facturation`
- origine de preuve :
  - route `GET /bc/finances/lire`
  - [prefet-workflow.e2e.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/e2e/prefet-workflow.e2e.spec.ts)
- contraintes importantes :
  - permission `paiements.read`
  - scope valide

### 8. Declarer un abandon

- BC : `scolarite-eleves`
- origine de preuve :
  - route `POST /bc/scolarite/abandon`
  - [security-scolarite.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-scolarite.integration.spec.ts)
  - [prefet-workflow.e2e.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/e2e/prefet-workflow.e2e.spec.ts)
- contraintes importantes :
  - permission `abandons.write`
  - absence de restriction abandon
  - scope valide

### 9. Enregistrer un transfert

- BC : `scolarite-eleves`
- origine de preuve :
  - route `POST /bc/scolarite/transfert`
  - [abandon-transfert-parent.workflow.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/workflows/abandon-transfert-parent.workflow.spec.ts)
- contraintes importantes :
  - permission `transferts.write`
  - absence de restriction transfert
  - scope valide

### 10. Consulter les statistiques de classe de sa section

- BC : `bulletins-evaluations`
- origine de preuve :
  - lecture `PED-05`
  - [security-statistiques.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-statistiques.integration.spec.ts)
- contraintes importantes :
  - permission `bulletins.read`
  - bonne ecole
  - bonne section secondaire
  - bonne classe resolue dans cette section
  - pas de lecture globale d'ecole via ce cas

### 11. Consulter le classement d'une classe de sa section

- BC : `bulletins-evaluations`
- origine de preuve :
  - lecture `PED-06`
  - [security-classements.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-classements.integration.spec.ts)
- contraintes importantes :
  - permission `bulletins.read`
  - bonne ecole
  - bonne section secondaire
  - bonne classe resolue dans cette section
  - pas de droit de recalcul par ce cas

### 12. Consulter le centre d'analyse pedagogique d'une classe de sa section

- BC : `bulletins-evaluations`
- origine de preuve :
  - lecture `PED-08`
  - [security-resultats.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-resultats.integration.spec.ts)
  - [ResultatsRoutes.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/tests/interfaces/routes/ResultatsRoutes.spec.ts)
- contraintes importantes :
  - permission `bulletins.read`
  - bonne ecole
- bonne section secondaire
- bonne classe resolue dans cette section
- lecture analytique uniquement

### 12. Consulter l'historique des paiements d'un eleve de sa section si l'ecole l'autorise

- BC : `paiements-facturation`
- origine de preuve :
  - route `GET /api/eleves/:idEleve/paiements`
  - [AutorisationHistoriquePaiementsAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationHistoriquePaiementsAdapter.ts)
  - [security-historique-paiements-facturation.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-historique-paiements-facturation.integration.spec.ts)
- contraintes importantes :
  - permission `paiements.read`
  - bonne ecole
  - bonne section secondaire
  - bonne classe resolue dans cette section
  - parametrage ecole obligatoire

### 13. Consulter la situation financiere d'un eleve de sa section si l'ecole l'autorise

- BC : `paiements-facturation`
- origine de preuve :
  - routes `GET /api/eleves/:idEleve/dette` et `GET /api/eleves/:idEleve/frais-exigibles`
  - [AutorisationSituationFinanciereEleveAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationSituationFinanciereEleveAdapter.ts)
  - [security-situation-financiere-paiements.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-situation-financiere-paiements.integration.spec.ts)
- contraintes importantes :
  - permission `paiements.read`
  - bonne ecole
  - bonne section secondaire
  - bonne classe resolue dans cette section
  - parametrage ecole obligatoire

### 10. Gerer le statut scolaire d'un eleve de sa section

- BC : `scolarite-eleves`
- origine de preuve :
  - lecture `SCO-02`
  - [security-cycle-vie-scolarite.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-cycle-vie-scolarite.integration.spec.ts)
  - [ChangerStatutEleve.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/scolarite-eleves/tests/integration/application/ChangerStatutEleve.spec.ts)
- contraintes importantes :
  - permission `eleves.write`
- bonne organisation
- bonne ecole
- bonne section secondaire
- action limitee au perimetre de section

### 11. Consulter le parcours scolaire d'un eleve de sa section

- BC : `scolarite-eleves`
- origine de preuve :
  - lecture `SCO-03`
  - [security-parcours-scolarite.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-parcours-scolarite.integration.spec.ts)
  - [ParcoursEleve.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/scolarite-eleves/tests/integration/application/ParcoursEleve.spec.ts)
- contraintes importantes :
  - permission `eleves.read`
  - bonne organisation
- bonne ecole
- bonne section secondaire
- jamais hors section

### 12. Gerer les affectations de classe de sa section

- BC : `scolarite-eleves`
- origine de preuve :
  - lecture `SCO-04`
  - [security-affectations-scolarite.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-affectations-scolarite.integration.spec.ts)
  - [AffectationsClasses.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/scolarite-eleves/tests/integration/application/AffectationsClasses.spec.ts)
- contraintes importantes :
  - permissions `eleves.read` et `eleves.write`
  - bonne organisation
  - bonne ecole
  - bonne section secondaire
  - bonne annee scolaire
  - jamais hors section

## `DIRECTEUR_ETUDES`

### 1. Lire la scolarite

- BC : `scolarite-eleves`
- origine de preuve :
  - route `GET /bc/scolarite/lire`
  - [security-scolarite.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-scolarite.integration.spec.ts)
- contraintes importantes :
  - permission `eleves.read`
  - scope valide

### 2. Lire les bulletins

- BC : `bulletins-evaluations`
- origine de preuve :
  - route `GET /bc/bulletins/lire`
  - [directeur-etudes-workflow.e2e.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/e2e/directeur-etudes-workflow.e2e.spec.ts)
- contraintes importantes :
  - permission `bulletins.read`
  - absence de restriction bulletins

### 3. Lire les finances

- BC : `paiements-facturation`
- origine de preuve :
  - route `GET /bc/finances/lire`
  - [directeur-etudes-workflow.e2e.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/e2e/directeur-etudes-workflow.e2e.spec.ts)
- contraintes importantes :
  - permission `paiements.read`
  - scope valide

### 4. Consulter les statistiques de classe de sa section

- BC : `bulletins-evaluations`
- origine de preuve :
  - lecture `PED-05`
  - [security-statistiques.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-statistiques.integration.spec.ts)
- contraintes importantes :
  - permission `bulletins.read`
  - bonne ecole
  - bonne section secondaire
  - bonne classe resolue dans cette section
  - pas de lecture globale d'ecole via ce cas

### 5. Consulter le classement d'une classe de sa section

- BC : `bulletins-evaluations`
- origine de preuve :
  - lecture `PED-06`
  - [AutorisationClassementAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationClassementAdapter.ts)
- contraintes importantes :
  - permission `bulletins.read`
  - bonne ecole
  - bonne section secondaire
  - bonne classe resolue dans cette section
  - pas de droit de recalcul par ce cas

### 6. Consulter le centre d'analyse pedagogique d'une classe de sa section

- BC : `bulletins-evaluations`
- origine de preuve :
  - lecture `PED-08`
  - [AutorisationConsultationStatistiquesAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationConsultationStatistiquesAdapter.ts)
  - [security-resultats.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-resultats.integration.spec.ts)
- contraintes importantes :
  - permission `bulletins.read`
  - bonne ecole
  - bonne section secondaire
  - bonne classe resolue dans cette section
  - lecture analytique uniquement

### 7. Consulter l'historique des paiements d'un eleve de sa section si l'ecole l'autorise

- BC : `paiements-facturation`
- origine de preuve :
  - route `GET /api/eleves/:idEleve/paiements`
  - [AutorisationHistoriquePaiementsAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationHistoriquePaiementsAdapter.ts)
  - [security-historique-paiements-facturation.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-historique-paiements-facturation.integration.spec.ts)
- contraintes importantes :
  - permission `paiements.read`
  - bonne organisation
  - bonne ecole
  - bonne section secondaire
  - parametrage ecole obligatoire

### 8. Consulter la situation financiere d'un eleve de sa section si l'ecole l'autorise

- BC : `paiements-facturation`
- origine de preuve :
  - routes `GET /api/eleves/:idEleve/dette` et `GET /api/eleves/:idEleve/frais-exigibles`
  - [AutorisationSituationFinanciereEleveAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationSituationFinanciereEleveAdapter.ts)
  - [security-situation-financiere-paiements.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-situation-financiere-paiements.integration.spec.ts)
- contraintes importantes :
  - permission `paiements.read`
  - bonne organisation
  - bonne ecole
  - bonne section secondaire
  - parametrage ecole obligatoire

### 7. Gerer le statut scolaire d'un eleve de sa section

- BC : `scolarite-eleves`
- origine de preuve :
  - lecture `SCO-02`
  - [security-cycle-vie-scolarite.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-cycle-vie-scolarite.integration.spec.ts)
- contraintes importantes :
  - permission `eleves.write`
- bonne organisation
- bonne ecole
- bonne section secondaire
- mutation locale uniquement, jamais hors section

### 8. Consulter le parcours scolaire d'un eleve de sa section

- BC : `scolarite-eleves`
- origine de preuve :
  - lecture `SCO-03`
  - [security-parcours-scolarite.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-parcours-scolarite.integration.spec.ts)
- contraintes importantes :
  - permission `eleves.read`
  - bonne organisation
- bonne ecole
- bonne section secondaire
- jamais hors section

### 9. Gerer les affectations de classe de sa section

- BC : `scolarite-eleves`
- origine de preuve :
  - lecture `SCO-04`
  - [security-affectations-scolarite.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-affectations-scolarite.integration.spec.ts)
  - [AffectationsClasses.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/scolarite-eleves/tests/integration/application/AffectationsClasses.spec.ts)
- contraintes importantes :
  - permissions `eleves.read` et `eleves.write`
  - bonne organisation
  - bonne ecole
  - bonne section secondaire
  - bonne annee scolaire
  - jamais hors section

## `DIRECTEUR_PRIMAIRE`

### 1. Gerer le statut scolaire d'un eleve de sa section

- BC : `scolarite-eleves`
- origine de preuve :
  - lecture `SCO-02`
  - [security-cycle-vie-scolarite.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-cycle-vie-scolarite.integration.spec.ts)
- contraintes importantes :
  - permission `eleves.write`
- bonne organisation
- bonne ecole
- bonne section primaire
- action limitee au perimetre de section

### 2. Consulter le parcours scolaire d'un eleve de sa section

- BC : `scolarite-eleves`
- origine de preuve :
  - lecture `SCO-03`
  - [security-parcours-scolarite.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-parcours-scolarite.integration.spec.ts)
- contraintes importantes :
  - permission `eleves.read`
  - bonne organisation
- bonne ecole
- bonne section primaire
- jamais hors section

### 3. Gerer les affectations de classe de sa section

- BC : `scolarite-eleves`
- origine de preuve :
  - lecture `SCO-04`
  - [security-affectations-scolarite.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-affectations-scolarite.integration.spec.ts)
  - [AffectationsClasses.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/scolarite-eleves/tests/integration/application/AffectationsClasses.spec.ts)
- contraintes importantes :
  - permissions `eleves.read` et `eleves.write`
  - bonne organisation
  - bonne ecole
- bonne section primaire
- bonne annee scolaire
- jamais hors section

### 4. Percevoir certains frais delegues de sa section primaire

- BC : `paiements-facturation`
- origine de preuve :
  - route `POST /api/paiements`
  - [AutorisationPerceptionPaiementAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationPerceptionPaiementAdapter.ts)
  - [security-perception-paiements-facturation.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-perception-paiements-facturation.integration.spec.ts)
- contraintes importantes :
  - permission brute `paiements.read`
  - bonne organisation
  - bonne ecole
  - bonne section primaire
  - parametrage ecole obligatoire par type de frais
  - jamais `FRAIS_MINERVAL`

### 5. Annuler certains paiements delegues de sa section primaire

- BC : `paiements-facturation`
- origine de preuve :
  - route `POST /api/paiements/:idPaiement/annulation`
  - [AutorisationAnnulationPaiementAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationAnnulationPaiementAdapter.ts)
  - [security-annulation-paiements-facturation.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-annulation-paiements-facturation.integration.spec.ts)
- contraintes importantes :
  - bonne organisation
  - bonne ecole
  - bonne section primaire
  - parametrage ecole obligatoire par type de frais
  - jamais `FRAIS_MINERVAL`

### 6. Restituer certains paiements delegues de sa section primaire

- BC : `paiements-facturation`
- origine de preuve :
  - route `POST /api/paiements/restitution`
  - [AutorisationRestitutionPaiementAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationRestitutionPaiementAdapter.ts)
  - [security-restitution-paiements-facturation.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-restitution-paiements-facturation.integration.spec.ts)
- contraintes importantes :
  - bonne organisation
  - bonne ecole
  - bonne section primaire
  - parametrage ecole obligatoire par type de frais
  - jamais `FRAIS_MINERVAL`

### 7. Consulter l'historique des paiements d'un eleve de sa section si l'ecole l'autorise

- BC : `paiements-facturation`
- origine de preuve :
  - route `GET /api/eleves/:idEleve/paiements`
  - [AutorisationHistoriquePaiementsAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationHistoriquePaiementsAdapter.ts)
  - [security-historique-paiements-facturation.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-historique-paiements-facturation.integration.spec.ts)
- contraintes importantes :
  - permission `paiements.read`
  - bonne organisation
  - bonne ecole
  - bonne section primaire
  - parametrage ecole obligatoire

### 8. Consulter la situation financiere d'un eleve de sa section si l'ecole l'autorise

- BC : `paiements-facturation`
- origine de preuve :
  - routes `GET /api/eleves/:idEleve/dette` et `GET /api/eleves/:idEleve/frais-exigibles`
  - [AutorisationSituationFinanciereEleveAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationSituationFinanciereEleveAdapter.ts)
  - [security-situation-financiere-paiements.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-situation-financiere-paiements.integration.spec.ts)
- contraintes importantes :
  - permission `paiements.read`
  - bonne organisation
  - bonne ecole
  - bonne section primaire
  - parametrage ecole obligatoire

## `DIRECTEUR_MATERNELLE`

### 1. Gerer le statut scolaire d'un eleve de sa section

- BC : `scolarite-eleves`
- origine de preuve :
  - lecture `SCO-02`
  - [security-cycle-vie-scolarite.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-cycle-vie-scolarite.integration.spec.ts)
- contraintes importantes :
  - permission `eleves.write`
- bonne organisation
- bonne ecole
- bonne section maternelle
- action limitee au perimetre de section

### 2. Consulter le parcours scolaire d'un eleve de sa section

- BC : `scolarite-eleves`
- origine de preuve :
  - lecture `SCO-03`
  - [security-parcours-scolarite.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-parcours-scolarite.integration.spec.ts)
- contraintes importantes :
  - permission `eleves.read`
  - bonne organisation
- bonne ecole
- bonne section maternelle
- jamais hors section

### 3. Gerer les affectations de classe de sa section

- BC : `scolarite-eleves`
- origine de preuve :
  - lecture `SCO-04`
  - [security-affectations-scolarite.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-affectations-scolarite.integration.spec.ts)
  - [AffectationsClasses.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/scolarite-eleves/tests/integration/application/AffectationsClasses.spec.ts)
- contraintes importantes :
  - permissions `eleves.read` et `eleves.write`
  - bonne organisation
  - bonne ecole
- bonne section maternelle
- bonne annee scolaire
- jamais hors section

### 4. Percevoir certains frais delegues de sa section maternelle

- BC : `paiements-facturation`
- origine de preuve :
  - route `POST /api/paiements`
  - [AutorisationPerceptionPaiementAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationPerceptionPaiementAdapter.ts)
  - [security-perception-paiements-facturation.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-perception-paiements-facturation.integration.spec.ts)
- contraintes importantes :
  - permission brute `paiements.read`
  - bonne organisation
  - bonne ecole
  - bonne section maternelle
  - parametrage ecole obligatoire par type de frais
  - jamais `FRAIS_MINERVAL`

### 5. Annuler certains paiements delegues de sa section maternelle

- BC : `paiements-facturation`
- origine de preuve :
  - route `POST /api/paiements/:idPaiement/annulation`
  - [AutorisationAnnulationPaiementAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationAnnulationPaiementAdapter.ts)
  - [security-annulation-paiements-facturation.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-annulation-paiements-facturation.integration.spec.ts)
- contraintes importantes :
  - bonne organisation
  - bonne ecole
  - bonne section maternelle
  - parametrage ecole obligatoire par type de frais
  - jamais `FRAIS_MINERVAL`

### 6. Restituer certains paiements delegues de sa section maternelle

- BC : `paiements-facturation`
- origine de preuve :
  - route `POST /api/paiements/restitution`
  - [AutorisationRestitutionPaiementAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationRestitutionPaiementAdapter.ts)
  - [security-restitution-paiements-facturation.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-restitution-paiements-facturation.integration.spec.ts)
- contraintes importantes :
  - bonne organisation
  - bonne ecole
  - bonne section maternelle
  - parametrage ecole obligatoire par type de frais
  - jamais `FRAIS_MINERVAL`

### 7. Consulter l'historique des paiements d'un eleve de sa section si l'ecole l'autorise

- BC : `paiements-facturation`
- origine de preuve :
  - route `GET /api/eleves/:idEleve/paiements`
  - [AutorisationHistoriquePaiementsAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationHistoriquePaiementsAdapter.ts)
  - [security-historique-paiements-facturation.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-historique-paiements-facturation.integration.spec.ts)
- contraintes importantes :
  - permission `paiements.read`
  - bonne organisation
  - bonne ecole
  - bonne section maternelle
  - parametrage ecole obligatoire

### 8. Consulter la situation financiere d'un eleve de sa section si l'ecole l'autorise

- BC : `paiements-facturation`
- origine de preuve :
  - routes `GET /api/eleves/:idEleve/dette` et `GET /api/eleves/:idEleve/frais-exigibles`
  - [AutorisationSituationFinanciereEleveAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationSituationFinanciereEleveAdapter.ts)
  - [security-situation-financiere-paiements.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-situation-financiere-paiements.integration.spec.ts)
- contraintes importantes :
  - permission `paiements.read`
  - bonne organisation
  - bonne ecole
  - bonne section maternelle
  - parametrage ecole obligatoire

## `DIRECTEUR_DISCIPLINE`

### 1. Lire les finances

- BC : `paiements-facturation`
- origine de preuve :
  - route `GET /bc/finances/lire`
  - [directeur-discipline-workflow.e2e.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/e2e/directeur-discipline-workflow.e2e.spec.ts)
- contraintes importantes :
- permission `paiements.read`
- scope valide
- restriction caisse non bloquante pour cette lecture

### 2. Encoder la conduite d'une classe de sa section secondaire

- BC : `bulletins-evaluations`
- origine de preuve :
  - route `POST /bc/bulletins/conduite`
  - [security-conduite.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-conduite.integration.spec.ts)
  - [AutorisationConduiteAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationConduiteAdapter.ts)
- contraintes importantes :
  - permission `cotes.write`
  - bonne ecole
  - bonne section secondaire
  - bonne classe resolue dans cette section
- jamais hors section
- ce cas d'utilisation ne couvre pas `application`, qui reste calculee automatiquement

### 3. Suspendre un eleve de sa section

- BC : `scolarite-eleves`
- origine de preuve :
  - lecture `SCO-02`
  - [security-cycle-vie-scolarite.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-cycle-vie-scolarite.integration.spec.ts)
- contraintes importantes :
  - permission `eleves.write`
  - bonne organisation
  - bonne ecole
  - bonne section secondaire
  - jamais hors section
  - aucune autre mutation de statut n'est ouverte via ce cas

## `CAISSIER`

### 1. Percevoir un paiement

- BC : `paiements-facturation`
- origine de preuve :
  - route `POST /bc/paiements/percevoir`
  - [security-paiements.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-paiements.integration.spec.ts)
  - [perception.workflow.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/workflows/perception.workflow.spec.ts)
  - [caissier-workflow.e2e.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/e2e/caissier-workflow.e2e.spec.ts)
- contraintes importantes :
  - permission `paiements.write`
  - absence de restriction caisse
  - scope valide
  - toute l'ecole
  - route backend reelle `POST /api/paiements`
  - utilisateur authentifie prioritaire sur tout `x-user-id` fourni
  - annee scolaire active de l'eleve rechargee avant lecture des obligations
  - les delegations de perception de certains frais ne retirent pas ce role principal au `CAISSIER`

### 2. Ouvrir la caisse

- BC : `paiements-facturation`
- origine de preuve :
  - route `POST /bc/caisse/ouvrir`
  - [caissier-workflow.e2e.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/e2e/caissier-workflow.e2e.spec.ts)
- contraintes importantes :
  - permission `caisse.write`
  - absence de restriction caisse
  - scope valide

### 3. Consulter la caisse du jour

- BC : `paiements-facturation`
- origine de preuve :
  - route `GET /api/caisse/jour`
  - [ConsulterCaisseJourUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/application/use-cases/caisse/ConsulterCaisseJourUseCase.ts)
  - [CaisseUseCases.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/tests/application/use-cases/CaisseUseCases.spec.ts)
  - [PaiementsRoutes.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/tests/interfaces/routes/PaiementsRoutes.spec.ts)
  - [security-ouverture-caisse-paiements.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-ouverture-caisse-paiements.integration.spec.ts)
- contraintes importantes :
  - permission `caisse.read`
  - acteur reel `CAISSIER`
  - bonne organisation
  - bonne ecole
  - absence de restriction caisse
  - utilisateur authentifie prioritaire sur tout `x-user-id` fourni

### 4. Consulter l'historique des paiements d'un eleve

- BC : `paiements-facturation`
- origine de preuve :
  - route `GET /api/eleves/:idEleve/paiements`
  - [ConsulterHistoriquePaiementsEleveUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/application/use-cases/dettes/ConsulterHistoriquePaiementsEleveUseCase.ts)
  - [ConsulterHistoriquePaiementsEleveUseCase.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/tests/application/use-cases/ConsulterHistoriquePaiementsEleveUseCase.spec.ts)
  - [security-historique-paiements-facturation.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-historique-paiements-facturation.integration.spec.ts)
- contraintes importantes :
  - permission `paiements.read`
  - bonne organisation
  - bonne ecole
  - lecture locale d'ecole uniquement
  - utilisateur authentifie prioritaire sur tout `x-user-id` fourni

### 5. Consulter la situation financiere d'un eleve

- BC : `paiements-facturation`
- origine de preuve :
  - routes `GET /api/eleves/:idEleve/dette` et `GET /api/eleves/:idEleve/frais-exigibles`
  - [ConsulterDetteEleveUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/application/use-cases/dettes/ConsulterDetteEleveUseCase.ts)
  - [ConsulterFraisExigiblesEleveUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/application/use-cases/dettes/ConsulterFraisExigiblesEleveUseCase.ts)
  - [security-situation-financiere-paiements.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-situation-financiere-paiements.integration.spec.ts)
- contraintes importantes :
  - permission `paiements.read`
  - bonne organisation
  - bonne ecole
  - lecture locale d'ecole uniquement
  - utilisateur authentifie prioritaire sur tout `x-user-id` fourni

### 6. Consulter l'audit administratif et financier de son ecole

- BC : `shared/audit`
- origine de preuve :
  - route `GET /api/v1/ecole/audit/administratif-financier`
  - [audit-ecole-routes.integration.test.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/tests/integration/audit-ecole-routes.integration.test.ts)
- contraintes importantes :
  - permission `audit.finance.read`
  - bonne organisation
  - bonne ecole
  - scope `ECOLE`
  - filtre backend force `categorieAudit=FINANCIER`

### 7. Annuler un paiement

- BC : `paiements-facturation`
- origine de preuve :
  - route `POST /api/paiements/:idPaiement/annulation`
  - [AnnulerPaiementUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/application/use-cases/annulations/AnnulerPaiementUseCase.ts)
  - [RestitutionEtAnnulation.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/tests/application/use-cases/RestitutionEtAnnulation.spec.ts)
  - [security-annulation-paiements-facturation.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-annulation-paiements-facturation.integration.spec.ts)
- contraintes importantes :
  - permission `paiements.write`
  - bonne organisation
  - bonne ecole
  - utilisateur authentifie prioritaire sur tout `x-user-id` fourni
  - les recus annules sont persistes
  - l'annulation ajoute une contre-operation de caisse au lieu de cloturer la caisse

### 7. Restituer un excedent de paiement

- BC : `paiements-facturation`
- origine de preuve :
  - route `POST /api/paiements/restitution`
  - [RestituerExcedentUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/application/use-cases/annulations/RestituerExcedentUseCase.ts)
  - [RestitutionEtAnnulation.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/tests/application/use-cases/RestitutionEtAnnulation.spec.ts)
  - [security-restitution-paiements-facturation.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-restitution-paiements-facturation.integration.spec.ts)
- contraintes importantes :
  - permission `paiements.write`
  - bonne organisation
  - bonne ecole
  - utilisateur authentifie prioritaire sur tout `x-user-id` fourni
  - une double restitution du meme paiement est refusee
  - la restitution ajoute une contre-operation de caisse sans cloturer la caisse

### 8. Creer une inscription scolaire complete

- BC : `scolarite-eleves`
- origine de preuve :
  - route `POST /api/inscriptions-scolaires/complete`
  - [CreerInscriptionComplete.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/scolarite-eleves/tests/integration/application/CreerInscriptionComplete.spec.ts)
  - [api-scolarite-eleves.test.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/scolarite-eleves/tests/e2e/api-scolarite-eleves.test.ts)
  - [security-inscription-scolarite.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-inscription-scolarite.integration.spec.ts)
- contraintes importantes :
  - role reel `CAISSIER`
  - permission `caisse.write`
  - bonne organisation
  - bonne ecole
- payload compose coherent
- idempotency-key obligatoire
- transaction composee

### 9. Reimprimer un recu de paiement

- BC : `paiements-facturation`
- origine de preuve :
  - route `GET /api/recus/:idRecu`
  - route `GET /api/recus/:idRecu/pdf`
  - [ReimprimerRecuUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/application/use-cases/recus/ReimprimerRecuUseCase.ts)
  - [TelechargerRecuPdfUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/application/use-cases/recus/TelechargerRecuPdfUseCase.ts)
  - [PaiementsRoutes.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/tests/interfaces/routes/PaiementsRoutes.spec.ts)
  - [security-reimpression-recu-paiements-facturation.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-reimpression-recu-paiements-facturation.integration.spec.ts)
- contraintes importantes :
  - permission `paiements.read`
  - acteur reel `CAISSIER`
  - bonne organisation
  - bonne ecole
  - le recu relu doit appartenir a l'ecole courante
  - utilisateur authentifie prioritaire sur tout `x-user-id` fourni
  - le recu officiel est agrege par operation et peut etre exporte en PDF
  - les assets documentaires optionnels du recu sont maintenant persistables et relus proprement

### 9 bis. Consulter et rechercher les recus de paiement

- BC : `paiements-facturation`
- origine de preuve :
  - route `GET /api/recus`
  - [ConsulterRecusPaiementUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/application/use-cases/recus/ConsulterRecusPaiementUseCase.ts)
  - [RecusPaiementQueryRepository.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/infrastructure/persistence/postgres/queries/RecusPaiementQueryRepository.ts)
  - [AutorisationConsultationRecusAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationConsultationRecusAdapter.ts)
  - [PaiementsRoutes.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/tests/interfaces/routes/PaiementsRoutes.spec.ts)
  - [security-consultation-recus-paiements-facturation.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-consultation-recus-paiements-facturation.integration.spec.ts)
- contraintes importantes :
  - permission `paiements.read`
  - acteur reel `CAISSIER`
  - bonne organisation
  - bonne ecole
  - utilisateur authentifie prioritaire sur tout `x-user-id` fourni
  - filtres reels disponibles : `idEleve`, `numeroRecu`, `dateDebut`, `dateFin`
  - la consultation ne devient pas une lecture generique ouverte aux autres acteurs

### 10. Consulter le rapport financier journalier

- BC : `paiements-facturation`
- origine de preuve :
  - route `GET /api/rapports-financiers/journalier?date=YYYY-MM-DD`
  - [ConsulterRapportFinancierJournalierUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/application/use-cases/rapports/ConsulterRapportFinancierJournalierUseCase.ts)
  - [AutorisationRapportFinancierAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationRapportFinancierAdapter.ts)
  - [security-rapport-financier-paiements-facturation.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-rapport-financier-paiements-facturation.integration.spec.ts)
- contraintes importantes :
  - permission `paiements.read`
  - `CAISSIER` et `ADMINISTRATEUR_ECOLE` lisent dans leur ecole
  - `GESTIONNAIRE_ORGANISATION` et `PROMOTEUR_ORGANISATION` lisent dans leur organisation

### 11. Consulter les paiements par caissier

- BC : `paiements-facturation`
- origine de preuve :
  - route `GET /api/rapports-financiers/paiements-par-caissier`
  - [ConsulterPaiementsParCaissierUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/application/use-cases/rapports/ConsulterPaiementsParCaissierUseCase.ts)
  - [PaiementsParCaissierQueryRepository.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/infrastructure/persistence/postgres/queries/PaiementsParCaissierQueryRepository.ts)
  - [AutorisationRapportFinancierAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationRapportFinancierAdapter.ts)
  - [security-rapport-financier-paiements-facturation.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-rapport-financier-paiements-facturation.integration.spec.ts)
- contraintes importantes :
  - permission `paiements.read`
  - `CAISSIER` et `ADMINISTRATEUR_ECOLE` lisent dans leur ecole
  - `GESTIONNAIRE_ORGANISATION` et `PROMOTEUR_ORGANISATION` lisent dans leur organisation

### 12. Consulter les paiements par type de frais

- BC : `paiements-facturation`
- origine de preuve :
  - route `GET /api/rapports-financiers/paiements-par-type-frais`
  - [ConsulterPaiementsParTypeFraisUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/application/use-cases/rapports/ConsulterPaiementsParTypeFraisUseCase.ts)
  - [PaiementsParTypeFraisQueryRepository.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/infrastructure/persistence/postgres/queries/PaiementsParTypeFraisQueryRepository.ts)
  - [AutorisationPaiementsParTypeFraisAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationPaiementsParTypeFraisAdapter.ts)
  - [security-paiements-par-type-frais-pedagogique.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-paiements-par-type-frais-pedagogique.integration.spec.ts)
- contraintes importantes :
  - permission `paiements.read`
  - `CAISSIER`, `ADMINISTRATEUR_ECOLE`, `GESTIONNAIRE_ORGANISATION`, `PROMOTEUR_ORGANISATION` lisent selon leur perimetre naturel
  - `TITULAIRE`, `PREFET_ETUDES`, `DIRECTEUR_ETUDES`, `DIRECTEUR_PRIMAIRE`, `DIRECTEUR_MATERNELLE` ne lisent que si l'ecole les autorise et seulement dans leur perimetre pedagogique reel

### 13. Consulter les fonds anticipes

- BC : `paiements-facturation`
- origine de preuve :
  - route `GET /api/rapports-financiers/fonds-anticipes`
  - [ConsulterFondsAnticipesUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/application/use-cases/rapports/ConsulterFondsAnticipesUseCase.ts)
  - [FondsAnticipesQueryRepository.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/infrastructure/persistence/postgres/queries/FondsAnticipesQueryRepository.ts)
  - [AutorisationPaiementsParTypeFraisAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationPaiementsParTypeFraisAdapter.ts)
  - [security-fonds-anticipes-paiements-facturation.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-fonds-anticipes-paiements-facturation.integration.spec.ts)
- contraintes importantes :
  - permission `paiements.read`
  - `CAISSIER`, `ADMINISTRATEUR_ECOLE`, `GESTIONNAIRE_ORGANISATION`, `PROMOTEUR_ORGANISATION` lisent selon leur perimetre naturel
  - `TITULAIRE`, `PREFET_ETUDES`, `DIRECTEUR_ETUDES`, `DIRECTEUR_PRIMAIRE`, `DIRECTEUR_MATERNELLE` ne lisent que si l'ecole les autorise et seulement dans leur perimetre pedagogique reel
  - la lecture est calculee sur les repartitions anticipees reelles et non sur un total ecole non filtrable

### 13 bis. Consulter le registre financier de classe

- BC : `paiements-facturation`
- origine de preuve :
  - route `GET /api/rapports-financiers/registre-classe`
  - [ConsulterRegistreFinancierClasseUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/application/use-cases/rapports/ConsulterRegistreFinancierClasseUseCase.ts)
  - [RegistreFinancierClasseQueryRepository.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/infrastructure/persistence/postgres/queries/RegistreFinancierClasseQueryRepository.ts)
  - [AutorisationRegistreFinancierClasseAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationRegistreFinancierClasseAdapter.ts)
  - [security-registre-financier-classe-paiements.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-registre-financier-classe-paiements.integration.spec.ts)
- contraintes importantes :
  - permission `paiements.read`
  - `CAISSIER`, `ADMINISTRATEUR_ECOLE`, `GESTIONNAIRE_ORGANISATION`, `PROMOTEUR_ORGANISATION` lisent selon leur perimetre naturel
  - `TITULAIRE` ne lit que sa classe titulaire et sa propre annee scolaire
  - `PREFET_ETUDES`, `DIRECTEUR_ETUDES`, `DIRECTEUR_PRIMAIRE`, `DIRECTEUR_MATERNELLE` ne lisent que si l'ecole les autorise et seulement dans leur section reelle
  - la lecture renvoie un vrai registre par eleve avec colonnes mensuelles, tranches Etat, inscription et statistiques integrees par colonne

### 14. Consulter les arrieres d'un eleve

- BC : `paiements-facturation`
- origine de preuve :
  - route `GET /api/eleves/:idEleve/arrieres`
  - [ConsulterArrieresEleveUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/application/use-cases/dettes/ConsulterArrieresEleveUseCase.ts)
  - [ArrieresEleveQueryRepository.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/infrastructure/persistence/postgres/queries/ArrieresEleveQueryRepository.ts)
  - [AutorisationSituationFinanciereEleveAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationSituationFinanciereEleveAdapter.ts)
  - [security-arrieres-paiements-facturation.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-arrieres-paiements-facturation.integration.spec.ts)
- contraintes importantes :
  - permission `paiements.read`
  - `CAISSIER`, `ADMINISTRATEUR_ECOLE`, `GESTIONNAIRE_ORGANISATION`, `PROMOTEUR_ORGANISATION` lisent selon leur perimetre naturel
  - `TITULAIRE`, `PREFET_ETUDES`, `DIRECTEUR_ETUDES`, `DIRECTEUR_PRIMAIRE`, `DIRECTEUR_MATERNELLE` ne lisent que si l'ecole les autorise et seulement dans leur perimetre pedagogique reel
  - la lecture reverifie maintenant `idEcole + idEleve` jusque dans le repository

### 10. Gerer le statut scolaire d'un eleve dans toute l'ecole

- BC : `scolarite-eleves`
- origine de preuve :
  - lecture `SCO-02`
  - [security-cycle-vie-scolarite.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-cycle-vie-scolarite.integration.spec.ts)
- contraintes importantes :
  - role reel `CAISSIER`
  - permission `caisse.write`
  - bonne organisation
  - bonne ecole
  - actions couvertes seulement :
    - abandon
    - transfert
    - reactivation
    - deces

### 10. Gerer les affectations de classe dans toute l'ecole

- BC : `scolarite-eleves`
- origine de preuve :
  - lecture `SCO-04`
  - [security-affectations-scolarite.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-affectations-scolarite.integration.spec.ts)
  - [AffectationsClasses.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/scolarite-eleves/tests/integration/application/AffectationsClasses.spec.ts)
- contraintes importantes :
  - permissions `caisse.read` et `caisse.write`
- bonne organisation
- bonne ecole
- pas d'ouverture implicite hors ecole

### 11. Gerer les familles et leurs responsables dans toute l'ecole

- BC : `scolarite-eleves`
- origine de preuve :
  - lecture `SCO-05`
  - [security-familles-scolarite.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-familles-scolarite.integration.spec.ts)
  - [Familles.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/scolarite-eleves/tests/integration/application/Familles.spec.ts)
- contraintes importantes :
  - acteur reel `CAISSIER`
  - permissions `caisse.read` et `caisse.write`
- bonne organisation
- bonne ecole
- workflow local d'inscription, pas de lecture ou mutation hors ecole

### 12. Gerer l'identite eleve et son lien familial dans toute l'ecole

- BC : `scolarite-eleves`
- origine de preuve :
  - lecture `SCO-06`
  - [security-eleves-scolarite.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-eleves-scolarite.integration.spec.ts)
  - [Eleves.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/scolarite-eleves/tests/integration/application/Eleves.spec.ts)
- contraintes importantes :
  - acteur reel `CAISSIER`
  - permissions `caisse.read` et `caisse.write`
  - bonne organisation
  - bonne ecole
  - pas d'ouverture implicite hors ecole

### 13. Gerer sa signature documentaire de recu dans son ecole

- BC : `paiements-facturation`
- origine de preuve :
  - route `PUT /api/recus/assets/signature`
  - [GererAssetsRecusUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/application/use-cases/recus/GererAssetsRecusUseCase.ts)
  - [GererAssetsRecusUseCase.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/tests/application/use-cases/GererAssetsRecusUseCase.spec.ts)
- contraintes importantes :
  - acteur reel `CAISSIER`
- bonne organisation
- bonne ecole
- signature reservee au percepteur reel

### 14. Gerer la qualification financiere `ENFANT_AGENT` d'un eleve de son ecole

- BC : `paiements-facturation`
- origine de preuve :
  - routes `POST /api/qualifications-financieres-eleves`, `POST /api/qualifications-financieres-eleves/:idQualification/desactivation` et `GET /api/eleves/:idEleve/qualifications-financieres`
  - [AutorisationQualificationFinanciereEleveAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationQualificationFinanciereEleveAdapter.ts)
  - [QualificationsFinancieresEleveUseCases.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/tests/application/use-cases/QualificationsFinancieresEleveUseCases.spec.ts)
- contraintes importantes :
  - acteur reel `CAISSIER`
  - permission effective `paiements.write` pour activer et desactiver
  - permission effective `paiements.read` pour relire
  - bonne organisation
  - bonne ecole
  - `ENFANT_AGENT` est une qualification autonome, distincte des exonerations

## `ADMINISTRATEUR_ECOLE`

### 1. Modifier le referentiel

- BC : `referentiel-academique`
- origine de preuve :
  - route `POST /bc/referentiel/modifier`
  - [rentree-scolaire.workflow.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/workflows/rentree-scolaire.workflow.spec.ts)
  - [admin-ecole-workflow.e2e.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/e2e/admin-ecole-workflow.e2e.spec.ts)
- contraintes importantes :
  - permission `referentiel.write`
  - scope valide

### 2. Lire la scolarite

- BC : `scolarite-eleves`
- origine de preuve :
  - route `GET /bc/scolarite/lire`
  - [inscription.workflow.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/workflows/inscription.workflow.spec.ts)
- contraintes importantes :
  - permission `eleves.read`
  - scope valide

### 3. Percevoir un paiement

- BC : `paiements-facturation`
- origine de preuve :
  - route `POST /bc/paiements/percevoir`
  - [security-paiements.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-paiements.integration.spec.ts)
  - [admin-ecole-workflow.e2e.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/e2e/admin-ecole-workflow.e2e.spec.ts)
- contraintes importantes :
  - permission `paiements.write`
  - scope valide

### 4. Declarer un abandon

- BC : `scolarite-eleves`
- origine de preuve :
  - route `POST /bc/scolarite/abandon`
  - [rentree-scolaire.workflow.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/workflows/rentree-scolaire.workflow.spec.ts)
  - [admin-ecole-workflow.e2e.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/e2e/admin-ecole-workflow.e2e.spec.ts)
- contraintes importantes :
  - permission `abandons.write`
  - absence de restriction abandon
  - scope valide

### 5. Consulter les statistiques globales de l'ecole

- BC : `bulletins-evaluations`
- origine de preuve :
  - lecture `PED-05`
  - [security-statistiques.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-statistiques.integration.spec.ts)
- contraintes importantes :
  - permission `bulletins.read`
  - perimetre global d'ecole
  - pas de simple lecture sectionnelle

### 6. Consulter la caisse du jour de son ecole

- BC : `paiements-facturation`
- origine de preuve :
  - route `GET /api/caisse/jour`
  - [AutorisationOuvertureCaisseAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationOuvertureCaisseAdapter.ts)
  - [security-ouverture-caisse-paiements.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-ouverture-caisse-paiements.integration.spec.ts)
- contraintes importantes :
  - permission `caisse.read`
  - bonne organisation
  - bonne ecole
  - lecture uniquement

### 7. Consulter l'historique des paiements d'un eleve de son ecole

- BC : `paiements-facturation`
- origine de preuve :
  - route `GET /api/eleves/:idEleve/paiements`
  - [AutorisationHistoriquePaiementsAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationHistoriquePaiementsAdapter.ts)
  - [security-historique-paiements-facturation.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-historique-paiements-facturation.integration.spec.ts)
- contraintes importantes :
  - permission `paiements.read`
  - bonne organisation
  - bonne ecole
  - lecture uniquement

### 8. Consulter la situation financiere d'un eleve de son ecole

- BC : `paiements-facturation`
- origine de preuve :
  - routes `GET /api/eleves/:idEleve/dette` et `GET /api/eleves/:idEleve/frais-exigibles`
  - [AutorisationSituationFinanciereEleveAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationSituationFinanciereEleveAdapter.ts)
  - [security-situation-financiere-paiements.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-situation-financiere-paiements.integration.spec.ts)
- contraintes importantes :
  - permission `paiements.read`
  - bonne organisation
  - bonne ecole
  - lecture uniquement

### 9. Consulter l'audit administratif et financier de son ecole

- BC : `shared/audit`
- origine de preuve :
  - route `GET /api/v1/ecole/audit/administratif-financier`
  - [audit-ecole-routes.integration.test.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/tests/integration/audit-ecole-routes.integration.test.ts)
- contraintes importantes :
  - permission `audit.finance.read`
  - bonne organisation
  - bonne ecole
  - scope `ECOLE`
  - filtre backend force `categorieAudit=FINANCIER`

### 10. Annuler un paiement de son ecole

- BC : `paiements-facturation`
- origine de preuve :
  - route `POST /api/paiements/:idPaiement/annulation`
  - [AutorisationAnnulationPaiementAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationAnnulationPaiementAdapter.ts)
  - [security-annulation-paiements-facturation.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-annulation-paiements-facturation.integration.spec.ts)
- contraintes importantes :
  - permission `paiements.write`
  - bonne organisation
  - bonne ecole
  - annulation uniquement dans le perimetre d'ecole

### 10. Restituer un excedent de paiement de son ecole

- BC : `paiements-facturation`
- origine de preuve :
  - route `POST /api/paiements/restitution`
  - [AutorisationRestitutionPaiementAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationRestitutionPaiementAdapter.ts)
  - [security-restitution-paiements-facturation.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-restitution-paiements-facturation.integration.spec.ts)
- contraintes importantes :
  - permission `paiements.write`
  - bonne organisation
  - bonne ecole
  - restitution uniquement dans le perimetre d'ecole

### 11. Gerer les exonerations de son ecole

- BC : `paiements-facturation`
- origine de preuve :
  - routes `POST /api/exonerations` et `POST /api/exonerations/:idExoneration/annulation`
  - [AutorisationExonerationAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationExonerationAdapter.ts)
  - [security-exonerations-paiements-facturation.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-exonerations-paiements-facturation.integration.spec.ts)
- contraintes importantes :
- permission effective `paiements.write`
- bonne organisation
- bonne ecole
- gestion uniquement dans le perimetre d'ecole

### 12. Gerer les qualifications financieres d'un eleve de son ecole

- BC : `paiements-facturation`
- origine de preuve :
  - routes `POST /api/qualifications-financieres-eleves`, `POST /api/qualifications-financieres-eleves/:idQualification/desactivation` et `GET /api/eleves/:idEleve/qualifications-financieres`
  - [AutorisationQualificationFinanciereEleveAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationQualificationFinanciereEleveAdapter.ts)
  - [QualificationsFinancieresEleveUseCases.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/tests/application/use-cases/QualificationsFinancieresEleveUseCases.spec.ts)
- contraintes importantes :
  - permission effective `paiements.write` pour activer et desactiver
  - permission effective `paiements.read` pour relire
  - bonne organisation
  - bonne ecole
  - `ENFANT_AGENT` reste une qualification autonome, distincte des exonerations

## `GESTIONNAIRE_ORGANISATION`

### 1. Consulter la caisse du jour d'une ecole de son organisation

- BC : `paiements-facturation`
- origine de preuve :
  - route `GET /api/caisse/jour`
  - [AutorisationOuvertureCaisseAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationOuvertureCaisseAdapter.ts)
  - [security-ouverture-caisse-paiements.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-ouverture-caisse-paiements.integration.spec.ts)
- contraintes importantes :
  - permission `paiements.read`
  - bonne organisation
  - supervision organisationnelle
  - lecture uniquement

### 2. Consulter l'historique des paiements d'un eleve d'une ecole de son organisation

- BC : `paiements-facturation`
- origine de preuve :
  - route `GET /api/eleves/:idEleve/paiements`
  - [AutorisationHistoriquePaiementsAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationHistoriquePaiementsAdapter.ts)
  - [security-historique-paiements-facturation.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-historique-paiements-facturation.integration.spec.ts)
- contraintes importantes :
  - permission `paiements.read`
  - bonne organisation
  - supervision organisationnelle
  - lecture uniquement

### 3. Consulter la situation financiere d'un eleve d'une ecole de son organisation

- BC : `paiements-facturation`
- origine de preuve :
  - routes `GET /api/eleves/:idEleve/dette` et `GET /api/eleves/:idEleve/frais-exigibles`
  - [AutorisationSituationFinanciereEleveAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationSituationFinanciereEleveAdapter.ts)
  - [security-situation-financiere-paiements.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-situation-financiere-paiements.integration.spec.ts)
- contraintes importantes :
  - permission `paiements.read`
  - bonne organisation
  - supervision organisationnelle
  - lecture uniquement

### 4. Gerer les exonerations d'une ecole de son organisation

- BC : `paiements-facturation`
- origine de preuve :
  - routes `POST /api/exonerations` et `POST /api/exonerations/:idExoneration/annulation`
  - [AutorisationExonerationAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationExonerationAdapter.ts)
  - [security-exonerations-paiements-facturation.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-exonerations-paiements-facturation.integration.spec.ts)
- contraintes importantes :
- permission `paiements.read`
- bonne organisation
- supervision organisationnelle
- gestion bornee aux ecoles de l'organisation

### 5. Consulter les qualifications financieres d'un eleve d'une ecole de son organisation

- BC : `paiements-facturation`
- origine de preuve :
  - route `GET /api/eleves/:idEleve/qualifications-financieres`
  - [AutorisationQualificationFinanciereEleveAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationQualificationFinanciereEleveAdapter.ts)
- contraintes importantes :
  - permission `paiements.read`
  - bonne organisation
  - supervision organisationnelle
  - lecture uniquement

## `PROMOTEUR_ORGANISATION`

### 1. Consulter une synthese d'organisation

- BC : transverse organisation
- origine de preuve :
  - route `GET /bc/organisation/synthese`
  - [promoteur-organisation-workflow.e2e.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/e2e/promoteur-organisation-workflow.e2e.spec.ts)
- contraintes importantes :
  - permission `utilisateurs.read`
  - scope organisation valide

### 2. Lire les finances

- BC : `paiements-facturation`
- origine de preuve :
  - route `GET /bc/finances/lire`
  - [promoteur-organisation-workflow.e2e.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/e2e/promoteur-organisation-workflow.e2e.spec.ts)
- contraintes importantes :
  - permission `paiements.read`
  - organisation active valide

### 3. Consulter la caisse du jour d'une ecole de son organisation

- BC : `paiements-facturation`
- origine de preuve :
  - route `GET /api/caisse/jour`
  - [AutorisationOuvertureCaisseAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationOuvertureCaisseAdapter.ts)
  - [security-ouverture-caisse-paiements.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-ouverture-caisse-paiements.integration.spec.ts)
- contraintes importantes :
  - permission `paiements.read`
  - bonne organisation
  - supervision organisationnelle
  - lecture uniquement

### 4. Consulter l'historique des paiements d'un eleve d'une ecole de son organisation

- BC : `paiements-facturation`
- origine de preuve :
  - route `GET /api/eleves/:idEleve/paiements`
  - [AutorisationHistoriquePaiementsAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationHistoriquePaiementsAdapter.ts)
  - [security-historique-paiements-facturation.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-historique-paiements-facturation.integration.spec.ts)
- contraintes importantes :
  - permission `paiements.read`
  - bonne organisation
  - supervision organisationnelle
  - lecture uniquement

### 5. Consulter la situation financiere d'un eleve d'une ecole de son organisation

- BC : `paiements-facturation`
- origine de preuve :
  - routes `GET /api/eleves/:idEleve/dette` et `GET /api/eleves/:idEleve/frais-exigibles`
  - [AutorisationSituationFinanciereEleveAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationSituationFinanciereEleveAdapter.ts)
  - [security-situation-financiere-paiements.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-situation-financiere-paiements.integration.spec.ts)
- contraintes importantes :
  - permission `paiements.read`
  - bonne organisation
  - supervision organisationnelle
  - lecture uniquement

### 6. Gerer les exonerations d'une ecole de son organisation

- BC : `paiements-facturation`
- origine de preuve :
  - routes `POST /api/exonerations` et `POST /api/exonerations/:idExoneration/annulation`
  - [AutorisationExonerationAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationExonerationAdapter.ts)
  - [security-exonerations-paiements-facturation.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-exonerations-paiements-facturation.integration.spec.ts)
- contraintes importantes :
- permission `paiements.read`
- bonne organisation
- supervision organisationnelle
- gestion bornee aux ecoles de l'organisation

### 7. Consulter les qualifications financieres d'un eleve d'une ecole de son organisation

- BC : `paiements-facturation`
- origine de preuve :
  - route `GET /api/eleves/:idEleve/qualifications-financieres`
  - [AutorisationQualificationFinanciereEleveAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationQualificationFinanciereEleveAdapter.ts)
- contraintes importantes :
  - permission `paiements.read`
  - bonne organisation
  - supervision organisationnelle
  - lecture uniquement

## `SECRETAIRE`

### 1. Gerer les exonerations de son ecole si l'ecole l'autorise

- BC : `paiements-facturation`
- origine de preuve :
  - routes `POST /api/exonerations` et `POST /api/exonerations/:idExoneration/annulation`
  - [AutorisationExonerationAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationExonerationAdapter.ts)
  - [security-exonerations-paiements-facturation.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-exonerations-paiements-facturation.integration.spec.ts)
- contraintes importantes :
  - permission `paiements.read`
  - bonne organisation
  - bonne ecole
  - delegation locale explicite `exonerationDeleguee`
  - aucun pouvoir implicite sans parametrage de l'ecole

## `PARENT`

### 1. Consulter un enfant autorise

- BC : `scolarite-eleves`
- origine de preuve :
  - route `GET /bc/parent/enfants/:idEleve`
  - [parent-workflow.e2e.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/e2e/parent-workflow.e2e.spec.ts)
- contraintes importantes :
  - permission `eleves.read`
  - l'eleve doit appartenir a la liste autorisee

### 2. Lire les bulletins

- BC : `bulletins-evaluations`
- origine de preuve :
  - route `GET /api/bulletins/:idEleve/:idAnneeScolaire`
  - route `GET /api/bulletins/:idBulletinEleve/historique`
  - [security-lecture-bulletins.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-lecture-bulletins.integration.spec.ts)
- contraintes importantes :
  - permission `bulletins.read`
  - portee limitee aux enfants autorises rattaches au parent courant

### 3. Lire les finances

- BC : `paiements-facturation`
- origine de preuve :
  - route `GET /bc/finances/lire`
  - [parent-workflow.e2e.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/e2e/parent-workflow.e2e.spec.ts)
- contraintes importantes :
  - permission `paiements.read`
  - portee limitee aux enfants autorises dans l'experience metier

### 4. Consulter l'historique des paiements d'un enfant autorise

- BC : `paiements-facturation`
- origine de preuve :
  - doctrine `PF-05`
- contraintes importantes :
  - permission `paiements.read`
  - enfant autorise obligatoire
  - le backend relit maintenant ce droit via le rattachement `ResponsableFamille.idUtilisateurAuth`

### 5. Consulter la situation financiere d'un enfant autorise

- BC : `paiements-facturation`
- origine de preuve :
  - routes `GET /api/eleves/:idEleve/dette` et `GET /api/eleves/:idEleve/frais-exigibles`
  - [AutorisationSituationFinanciereEleveAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationSituationFinanciereEleveAdapter.ts)
  - [security-situation-financiere-paiements.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-situation-financiere-paiements.integration.spec.ts)
- contraintes importantes :
  - permission `paiements.read`
  - enfant autorise obligatoire
  - le backend relit maintenant ce droit via le rattachement `ResponsableFamille.idUtilisateurAuth`

## `ADMIN_SYSTEME_ECOLE`

### 1. Modifier le referentiel

- BC : `referentiel-academique`
- origine de preuve :
  - route `POST /bc/referentiel/modifier`
  - [security-referentiel.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-referentiel.integration.spec.ts)
- contraintes importantes :
  - permission `referentiel.write`
  - scope ecole valide

### 2. Gerer l'identite documentaire officielle des recus de son ecole

- BC : `paiements-facturation`
- origine de preuve :
  - routes `GET /api/recus/assets/ecole`, `PUT /api/recus/assets/ecole`, `GET /api/recus/assets/ecole/logo`, `GET /api/recus/assets/ecole/cachet`
  - [AssetsRecusController.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/interfaces/http/controllers/AssetsRecusController.ts)
  - [GererAssetsRecusUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/application/use-cases/recus/GererAssetsRecusUseCase.ts)
  - [GererAssetsRecusUseCase.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/tests/application/use-cases/GererAssetsRecusUseCase.spec.ts)
- contraintes importantes :
  - acteur reel `ADMIN_SYSTEME_ECOLE`
  - bonne organisation
  - bonne ecole
  - le logo et le cachet appartiennent a l'identite documentaire de l'ecole
  - la signature n'entre pas dans ce cas d'utilisation

### 3. Consulter et configurer les parametres de paiement de son ecole

- BC : `paiements-facturation`
- origine de preuve :
  - routes `GET /api/paiements/parametres` et `PUT /api/paiements/parametres`
  - [ParametresPaiementController.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/interfaces/http/controllers/ParametresPaiementController.ts)
  - [ConfigurerParametresPaiementEcoleUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/application/use-cases/parametres/ConfigurerParametresPaiementEcoleUseCase.ts)
  - [ConsulterParametresPaiementEcoleUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/application/use-cases/parametres/ConsulterParametresPaiementEcoleUseCase.ts)
  - [ParametresPaiementEcoleUseCases.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/tests/application/use-cases/ParametresPaiementEcoleUseCases.spec.ts)
- contraintes importantes :
  - acteur reel `ADMIN_SYSTEME_ECOLE`
  - bonne organisation
  - bonne ecole
  - role actif systeme requis
  - pas d'ouverture implicite a `ADMINISTRATEUR_ECOLE`

### 4. Gerer les grilles de tarification de son ecole

- BC : `paiements-facturation`
- origine de preuve :
  - routes `GET /api/tarification/grilles`, `POST /api/tarification/grilles`, `PUT /api/tarification/grilles/:idGrilleTarification`, `POST /api/tarification/grilles/:idGrilleTarification/desactivation`
  - [TarificationController.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/interfaces/http/controllers/TarificationController.ts)
  - [CreerGrilleTarificationUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/application/use-cases/tarification/CreerGrilleTarificationUseCase.ts)
  - [ListerGrillesTarificationUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/application/use-cases/tarification/ListerGrillesTarificationUseCase.ts)
  - [ModifierGrilleTarificationUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/application/use-cases/tarification/ModifierGrilleTarificationUseCase.ts)
  - [DesactiverGrilleTarificationUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/application/use-cases/tarification/DesactiverGrilleTarificationUseCase.ts)
  - [TarificationUseCases.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/paiements-facturation/tests/application/use-cases/TarificationUseCases.spec.ts)
- contraintes importantes :
  - acteur reel `ADMIN_SYSTEME_ECOLE`
  - bonne organisation
  - bonne ecole
- bonne annee scolaire
- role actif systeme requis
- lecture et mutation bornees au perimetre `organisation + ecole`

### 5. Consulter l'audit technique de son ecole

- BC : `shared/audit`
- origine de preuve :
  - routes `GET /api/v1/ecole/audit/technique/traces` et `GET /api/v1/ecole/audit/technique/metrics`
  - [ecole.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/audit/interfaces/http/routes/ecole.routes.ts)
  - [AuditTraceService.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/audit/infrastructure/monitoring/traces/AuditTraceService.ts)
  - [AuditSchoolTechnicalMetricsService.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/audit/infrastructure/monitoring/ecole/AuditSchoolTechnicalMetricsService.ts)
  - [audit-technique-ecole-routes.integration.test.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/tests/integration/audit-technique-ecole-routes.integration.test.ts)
- contraintes importantes :
  - acteur reel `ADMIN_SYSTEME_ECOLE`
  - permission `audit.technical.read`
  - bonne organisation
  - bonne ecole
  - scope `ECOLE`
  - lecture limitee aux traces et metriques techniques locales
  - pas de reinterpretation du monitoring global plateforme

## `ACTEUR_AUTHENTIFIABLE`

### 1. Ouvrir une session AUTH

- BC : `shared/auth`
- origine de preuve :
  - route `POST /api/auth/login`
  - [auth.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/auth/interfaces/http/routes/auth.routes.ts)
  - [auth-routes.integration.test.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/tests/integration/auth-routes.integration.test.ts)
- contraintes importantes :
  - compte actif
  - mot de passe valide
  - organisation active et ecole active compatibles avec les scopes SECURITY si elles sont fournies

### 2. Consulter sa session active

- BC : `shared/auth`
- origine de preuve :
  - route `GET /api/auth/session`
  - [auth.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/auth/interfaces/http/routes/auth.routes.ts)
  - [auth-routes.integration.test.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/tests/integration/auth-routes.integration.test.ts)
- contraintes importantes :
  - JWT valide
  - session active
  - lecture limitee a la session courante

### 3. Consulter son contexte actif

- BC : `shared/auth`
- origine de preuve :
  - route `GET /api/auth/contexte`
  - [auth.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/auth/interfaces/http/routes/auth.routes.ts)
- contraintes importantes :
  - JWT valide
  - contexte actif coherent
  - lecture limitee a l'utilisateur courant

### 4. Changer son organisation ou son ecole actives

- BC : `shared/auth`
- origine de preuve :
  - routes `PUT /api/auth/contexte/organisation-active` et `PUT /api/auth/contexte/ecole-active`
  - [auth.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/auth/interfaces/http/routes/auth.routes.ts)
- contraintes importantes :
  - session active
  - scopes SECURITY compatibles
  - coherence du contexte actif preservee

### 5. Fermer sa session et revoquer toutes ses sessions

- BC : `shared/auth`
- origine de preuve :
  - routes `POST /api/auth/logout` et `POST /api/auth/revoquer-toutes-sessions`
  - [auth.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/auth/interfaces/http/routes/auth.routes.ts)
- contraintes importantes :
  - session active
  - action limitee au meme utilisateur authentifie

### 6. Synchroniser son contexte offline

- BC : `shared/auth`
- origine de preuve :
  - route `POST /api/auth/offline/synchroniser`
  - [auth.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/auth/interfaces/http/routes/auth.routes.ts)
- contraintes importantes :
  - JWT valide
  - appareil connu
  - synchronisation limitee au couple utilisateur/appareil courant

## Acteurs Officiels Sans Cas d'Utilisation Atteste Positif Dans les Sources Lues

Les acteurs suivants existent officiellement comme roles securite, mais aucun cas d'utilisation positif suffisamment atteste n'a ete releve dans les sources lues pour cette phase :

- `ADMIN_SYSTEME_ORGANISATION`
- `COMPTABLE`

Cela signifie :

- ils existent
- mais leur matrice de cas d'utilisation ne doit pas etre inventee

Exception deja materialisee :

- `MANAGER_SYSTEME`
- `OPERATEUR_SYSTEME`
- `SUPPORT_SYSTEME`
  - disposent maintenant d'un cas d'utilisation positif atteste sur `ACA-08`
  - lecture / mutation du socle academique officiel
  - disposent aussi maintenant d'un cas d'utilisation positif atteste sur `ACA-09`
  - lecture / mutation des migrations de referentiel

Exception plateforme systeme maintenant materialisee :

- `MANAGER_SYSTEME`
- `OPERATEUR_SYSTEME`
  - disposent maintenant d'un cas d'utilisation positif atteste sur `PLT-01`
  - publication officielle d'une version de referentiel
  - disposent maintenant d'un cas d'utilisation positif atteste sur `PLT-02`
  - activation officielle d'une version de referentiel
  - disposent maintenant d'un cas d'utilisation positif atteste sur `PLT-03`
  - import officiel du referentiel
  - disposent maintenant d'un cas d'utilisation positif atteste sur `PLT-04`
  - comparaison officielle de deux versions de referentiel
  - disposent maintenant d'un cas d'utilisation positif atteste sur `PLT-05`
  - lecture officielle des referentiels programmes et cours
  - `OPERATEUR_SYSTEME` reste conditionne par une activation explicite de plateforme pour chacun de ces cinq workflows

Exception transverse maintenant materialisee :

- `MANAGER_SYSTEME`
- `OPERATEUR_SYSTEME`
- `SUPPORT_SYSTEME`
  - disposent maintenant d'un cas d'utilisation positif atteste sur `SHD-AUD-01`
  - consultation de la liste d'audit plateforme globale
  - consultation de la timeline d'audit plateforme globale
  - consultation de l'historique d'audit plateforme global
  - le backend prouve aussi le refus d'un acteur ecole sans permissions `audit.*`

Lecture doctrinale obligatoire :

- ce cas d'utilisation positif ne doit pas etre relu comme un cas d'utilisation metier ecole
- il prouve un usage plateforme borne par un scope `PLATEFORME`
- il n'exige ni organisation ni ecole active
- les futurs cas d'utilisation d'audit doivent etre separes par famille :
  - audit organisationnel
  - audit administratif et financier ecole
  - audit technique ecole
  - audit pedagogique
  - audit disciplinaire
  - audit plateforme

Correspondance officielle :

- cette materialisation couvre deja `AUD-06`
- `AUD-06` n'ouvre donc pas un deuxieme cas d'utilisation backend distinct au-dela de `SHD-AUD-01`

Exception transverse maintenant materialisee :

- `MANAGER_SYSTEME`
- `OPERATEUR_SYSTEME`
- `SUPPORT_SYSTEME`
  - disposent maintenant de cas d'utilisation positifs attestes sur `shared/monitoring`
  - consultation de l'etat systeme
  - consultation du tableau de bord Monitoring
  - consultation de l'observabilite
  - consultation de la sante systeme
  - consultation des incidents, alertes, diagnostics, capacites et traces
  - `SUPPORT_SYSTEME` reste lecture seule sur ce bloc

Exception transverse maintenant materialisee :

- `MANAGER_SYSTEME`
- `OPERATEUR_SYSTEME`
  - disposent maintenant de cas d'utilisation positifs attestes sur les mutations `shared/monitoring`
  - ouverture et escalation d'incident
  - creation et resolution d'alerte
  - generation de diagnostic
  - calcul de capacite et de saturation
  - capture de trace

Exception transverse maintenant materialisee :

- `PROMOTEUR_ORGANISATION`
- `GESTIONNAIRE_ORGANISATION`
  - disposent maintenant d'un cas d'utilisation positif atteste sur `AUD-01`
  - consultation du monitoring organisationnel
  - consultation des analytics d'audit organisationnels
  - consultation des incidents de securite organisationnels
  - le backend prouve aussi le refus d'un acteur ecole sur ce perimetre

Exception transverse maintenant materialisee :

- `TITULAIRE`
- `PREFET_ETUDES`
- `DIRECTEUR_ETUDES`
- `DIRECTEUR_DISCIPLINE`
- `DIRECTEUR_PRIMAIRE`
- `DIRECTEUR_MATERNELLE`
- `ADMINISTRATEUR_ECOLE`
- `PROMOTEUR_ORGANISATION`
  - disposent maintenant d'un cas d'utilisation positif atteste sur `AUD-04`
  - consultation de l'audit des cotes
  - consultation de l'audit de conduite
  - consultation de l'audit des bulletins
  - consultation de l'audit des classements
  - le backend prouve aussi qu'une simple exposition de route ne suffit plus sans controle local de perimetre

Exception transverse maintenant materialisee :

- `PROMOTEUR_ORGANISATION`
- `ADMIN_SYSTEME_ORGANISATION`
- `GESTIONNAIRE_ORGANISATION`
- `ADMIN_SYSTEME_ECOLE`
- `ADMINISTRATEUR_ECOLE`
  - disposent maintenant d'un cas d'utilisation positif atteste sur `shared/configuration`
  - configuration des modules autorises au niveau organisation
  - configuration des modules actives au niveau ecole
  - consultation des modules effectifs pour une ecole
  - creation, lecture, mise a jour, verrouillage, snapshots, propagation et reload d'une configuration dans leur portee reelle
  - surcharge d'une configuration heritee vers une portee ecole autorisee
  - le backend prouve aussi le blocage runtime d'un BC quand son module est inactif
  - ce bloc n'est pas un simple parametrage technique mais une gouvernance commerciale transverse

## Contraintes Transverses

Quel que soit l'acteur, les cas d'utilisation reels documentes ci-dessus restent soumis a :

- la permission requise
- l'affectation active
- le contexte actif coherent
- le scope organisation / ecole valide
- la section valide quand le workflow fournit un perimetre sectionnel
- la classe ou le cours valides quand le workflow fournit ce perimetre
- l'isolation tenant
- les restrictions metier eventuelles
- les policies metier specialisees

Dans le cas du titulariat, cela inclut en plus :

- la source valide du titulariat effectif
- la bonne classe
- la bonne annee scolaire
- la bonne organisation
- la bonne ecole

Lecture doctrinale importante :

- une permission n'ouvre jamais, a elle seule, un cas d'utilisation global
- l'autorisation reelle depend toujours du perimetre metier effectivement verifie par le workflow consommateur

## Consequence Frontend Officielle

Le frontend devra construire ses futurs workflows et ecrans a partir de cette grille :

Acteur reel
-> Cas d'utilisation reels
-> Contraintes backend reelles

Et non a partir de :

- suppositions d'interface
- habitudes de role
- conventions implicites non exposees par le backend

## Conclusion

La phase 3 - cas d'utilisation est figee comme suit :

- les cas d'utilisation frontend doivent etre alignes sur les usages reels attestes par le backend
- `TITULAIRE` reste un acteur derive documente comme acteur d'experience
- l'activation de `TITULAIRE` depend de la doctrine officielle du titulariat
- les futurs workflows frontend devront s'appuyer sur ce document, ainsi que sur :
  - [00-doctrine-frontend.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/00-doctrine-frontend.md)
  - [01-acteurs.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/01-acteurs.md)
  - [02-permissions-effectives.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/02-permissions-effectives.md)
## Notifications

### NOTIF-01

- administrer les notifications d'une ecole
- relire dans la meme surface les notifications locales creees manuellement et les notifications automatiques issues des BC reels deja branches
- acteur principal : `ADMIN_SYSTEME_ECOLE`
- acteur secondaire : `ADMINISTRATEUR_ECOLE`
- routes reelles :
  - `POST /api/v1/notifications`
  - `GET /api/v1/notifications`
  - `GET /api/v1/notifications/:id`
  - `GET /api/v1/notifications/:id/timeline`
  - `POST /api/v1/notifications/:id/acknowledge`
  - `POST /api/v1/notifications/:id/escalate`
  - `GET /api/v1/notifications/monitoring`
  - `GET /api/v1/notifications/dead-letter`
  - `POST /api/v1/notifications/:id/retry`
  - `GET /api/v1/notifications/:id/retries`
  - `POST /api/v1/notifications/:id/replay`
  - `GET /api/v1/notifications/:id/replay/diagnostic`

### NOTIF-02

- superviser les notifications d'une organisation
- acteurs : `PROMOTEUR_ORGANISATION`, `ADMIN_SYSTEME_ORGANISATION`, `GESTIONNAIRE_ORGANISATION`
- routes reelles :
  - `GET /api/v1/admin/notifications/archives`
  - `GET /api/v1/admin/notifications/tenant`
  - `GET /api/v1/admin/notifications/:id/escalades`
  - `GET /api/v1/notifications/realtime-futur/capabilities`
  - `POST /api/v1/notifications/realtime-futur/publish-test`
