# Phase 53 - Backlog Backend Edition Des Versions De Travail

## Statut

Ce document transforme l'audit d'implementation de la phase 52 en backlog backend executable.

Il sert de pont entre :

- la doctrine figee
- l'audit technique
- l'implementation reelle

Il ne code rien lui-meme, mais il fixe l'ordre exact de travail recommande.

Etat d'avancement au 2026-07-08 :

- `LOT 1 - Domaine` : realise
- `LOT 2 - Application` : realise
- `LOT 3 - HTTP` : realise
- `LOT 4 - Tests backend complets` : realise
- `LOT 5 - Frontend` : non demarre pour cette fonctionnalite

## Objectif

Permettre l'implementation backend propre de l'edition des lignes d'un `ReferentielProgramme` officiel, uniquement sur une version non publiee, sans casser :

- la publication
- l'activation
- la comparaison
- la migration
- la separation `Plateforme` / `Ecole`

## Regles De Pilotage

1. Ne jamais muter une version `publiee`.
2. Ne jamais muter une version `active`.
3. Ne jamais muter une version deja engagee dans une migration non annulee.
4. Toute mutation doit etre auditee.
5. Toute mutation doit rester bornee a `referentiel.write`.
6. Le frontend ne sera branche qu'apres stabilisation backend.

## Ordre D Implementation Recommande

### LOT 1 - Domaine

Statut :

- ferme techniquement
- typecheck backend OK
- tests domaine dedies OK

#### Tache 1.1 - Introduire le verrouillage de version officielle

Objectif :

- centraliser la regle `non publiee + non active + non migree`

Fichiers cibles probables :

- [VersionReferentielProgramme.ts](/abs/path/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/domain/aggregates/VersionReferentielProgramme.ts)
- [ReferentielProgramme.ts](/abs/path/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/domain/aggregates/ReferentielProgramme.ts)

Livrable attendu :

- methode explicite de verification de mutabilite
- erreurs metier claires

#### Tache 1.2 - Ajouter les mutateurs de lignes sur version non publiee

Objectif :

- ajouter
- modifier
- retirer
- reordonner
- modifier la ponderation

Fichiers cibles probables :

- [VersionReferentielProgramme.ts](/abs/path/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/domain/aggregates/VersionReferentielProgramme.ts)
- [LigneReferentielProgramme.ts](/abs/path/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/domain/entities/LigneReferentielProgramme.ts)

Livrable attendu :

- mutateurs domaine
- maintien des invariants

#### Tache 1.3 - Ajouter la creation d'une version de travail

Objectif :

- cloner une version existante
- produire une nouvelle version non publiee
- conserver les lignes et le contexte de base

Fichier cible probable :

- [ReferentielProgramme.ts](/abs/path/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/domain/aggregates/ReferentielProgramme.ts)

Livrable attendu :

- methode de creation de version de travail
- prevention des doublons de code version

#### Tache 1.4 - Ajouter un controle de coherence explicite

Objectif :

- permettre un pre-check avant publication

Fichiers cibles probables :

- [VersionReferentielProgramme.ts](/abs/path/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/domain/aggregates/VersionReferentielProgramme.ts)
- [MoteurProgrammeAcademique.ts](/abs/path/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/domain/services/MoteurProgrammeAcademique.ts)
- [MoteurPonderation.ts](/abs/path/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/domain/services/MoteurPonderation.ts)

Livrable effectivement pose dans le domaine :

- verrou explicite `publiee` / `active`
- creation d'une version de travail depuis une version existante
- mutations de lignes sur version non publiee :
  - ajout
  - modification
  - retrait
  - reordonnancement
  - mise a jour de ponderation
- revalidation des invariants apres chaque mutation

Preuves code :

- [VersionReferentielProgramme.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/domain/aggregates/VersionReferentielProgramme.ts)
- [ReferentielProgramme.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/domain/aggregates/ReferentielProgramme.ts)
- [edition-version-travail-referentiel.domain.test.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/tests/edition-version-travail-referentiel.domain.test.ts)

## LOT 2 - Application

Statut :

- ferme techniquement
- use cases implementes
- audit applicatif branche
- verrou migration applicatif branche
- tests applicatifs dedies OK

#### Tache 2.1 - Creer les DTO d'entree et de sortie

DTO d'entree a prevoir :

- creation version de travail
- ajout ligne
- modification ligne
- suppression ligne
- reordonnancement
- modification ponderation
- verification coherence

Fichiers cibles probables :

- `backend/src/contexts/referentiel-academique/application/dto/input/*`
- `backend/src/contexts/referentiel-academique/application/dto/output/*`

#### Tache 2.2 - Creer les use cases

Use cases cibles :

- `CreerVersionTravailReferentielDepuisVersion`
- `AjouterLigneVersionReferentielProgramme`
- `ModifierLigneVersionReferentielProgramme`
- `RetirerLigneVersionReferentielProgramme`
- `ReordonnerLignesVersionReferentielProgramme`
- `ModifierPonderationLigneVersionReferentielProgramme`
- `VerifierCoherenceVersionReferentielAvantPublication`

Fichiers cibles probables :

- `backend/src/contexts/referentiel-academique/application/use-cases/referentiels/*`

#### Tache 2.3 - Brancher l'audit applicatif

Objectif :

- journaliser chaque mutation

Fichiers cibles probables :

- [ServiceJournalAuditReferentielAcademique.ts](/abs/path/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/application/services/ServiceJournalAuditReferentielAcademique.ts)
- nouveaux use cases

#### Tache 2.4 - Reutiliser `referentiel.write`

Objectif :

- rester coherent avec l'existant
- ne pas introduire une nouvelle permission

Livrable effectivement pose :

- DTO d'entree :
  - creation version de travail
  - ajout ligne
  - modification ligne
  - retrait ligne
  - reordonnancement
  - modification ponderation
  - verification coherence
- DTO de sortie pour verification de coherence
- use cases implementes :
  - `CreerVersionTravailReferentielDepuisVersion`
  - `AjouterLigneVersionReferentielProgramme`
  - `ModifierLigneVersionReferentielProgramme`
  - `RetirerLigneVersionReferentielProgramme`
  - `ReordonnerLignesVersionReferentielProgramme`
  - `ModifierPonderationLigneVersionReferentielProgramme`
  - `VerifierCoherenceVersionReferentielAvantPublication`
- support applicatif commun :
  - chargement version
  - verrou migration non annulee
  - conversion d'erreurs metier
- extension minimale du depot migration pour detecter une version deja engagee

Preuves code :

- [SupportEditionVersionReferentiel.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/application/use-cases/referentiels/SupportEditionVersionReferentiel.ts)
- [CreerVersionTravailReferentielDepuisVersion.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/application/use-cases/referentiels/CreerVersionTravailReferentielDepuisVersion.ts)
- [AjouterLigneVersionReferentielProgramme.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/application/use-cases/referentiels/AjouterLigneVersionReferentielProgramme.ts)
- [ModifierLigneVersionReferentielProgramme.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/application/use-cases/referentiels/ModifierLigneVersionReferentielProgramme.ts)
- [RetirerLigneVersionReferentielProgramme.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/application/use-cases/referentiels/RetirerLigneVersionReferentielProgramme.ts)
- [ReordonnerLignesVersionReferentielProgramme.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/application/use-cases/referentiels/ReordonnerLignesVersionReferentielProgramme.ts)
- [ModifierPonderationLigneVersionReferentielProgramme.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/application/use-cases/referentiels/ModifierPonderationLigneVersionReferentielProgramme.ts)
- [VerifierCoherenceVersionReferentielAvantPublication.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/application/use-cases/referentiels/VerifierCoherenceVersionReferentielAvantPublication.ts)
- [DepotMigrationReferentielProgramme.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/domain/repositories/DepotMigrationReferentielProgramme.ts)
- [DepotMigrationReferentielProgrammePostgres.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/infrastructure/persistence/postgres/depots/DepotMigrationReferentielProgrammePostgres.ts)
- [edition-version-travail-referentiel.use-cases.test.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/tests/edition-version-travail-referentiel.use-cases.test.ts)

## LOT 3 - HTTP

Statut :

- ferme techniquement
- controleur et validateurs branches
- routes HTTP exposees
- tests HTTP cibles OK

#### Tache 3.1 - Ajouter les validateurs HTTP

Fichiers cibles probables :

- [referentiel-import.validator.ts](/abs/path/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/interfaces/http/validators/referentiel-import.validator.ts)
  ou
- nouveau validateur dedie a l'edition des versions

#### Tache 3.2 - Etendre le controleur referentiel

Fichier cible :

- [ControleurReferentielsAcademiques.ts](/abs/path/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/interfaces/http/controllers/ControleurReferentielsAcademiques.ts)

Actions a ajouter :

- creer version de travail
- ajouter ligne
- modifier ligne
- retirer ligne
- reordonner
- modifier ponderation
- verifier coherence

#### Tache 3.3 - Ajouter les routes

Fichier cible :

- [referentiels-academiques.routes.ts](/abs/path/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/interfaces/http/routes/referentiels-academiques.routes.ts)

Routes cibles :

- `POST /api/referentiels/programmes/:id/versions-travail`
- `POST /api/referentiels/versions/:id/lignes`
- `PATCH /api/referentiels/versions/:id/lignes/:idLigne`
- `DELETE /api/referentiels/versions/:id/lignes/:idLigne`
- `POST /api/referentiels/versions/:id/lignes/reordonner`
- `POST /api/referentiels/versions/:id/lignes/:idLigne/ponderation`
- `POST /api/referentiels/versions/:id/verifier-coherence`

#### Tache 3.4 - Securiser cote backend

Objectif :

- verifier `referentiel.write`
- verifier contexte `Plateforme`
- verifier verrouillage version

Livrable effectivement pose :

- nouvelles validations HTTP :
  - creation version travail
  - ajout ligne
  - modification ligne
  - retrait ligne
  - reordonnancement
  - modification ponderation
  - verification coherence
- nouvelles actions controleur :
  - creation version travail
  - ajout ligne
  - modification ligne
  - retrait ligne
  - reordonnancement
  - modification ponderation
  - verification coherence
- nouvelles routes :
  - `POST /api/referentiels/programmes/:id/versions-travail`
  - `POST /api/referentiels/versions/:id/lignes`
  - `PATCH /api/referentiels/versions/:id/lignes/:idLigne`
  - `DELETE /api/referentiels/versions/:id/lignes/:idLigne`
  - `POST /api/referentiels/versions/:id/lignes/reordonner`
  - `POST /api/referentiels/versions/:id/lignes/:idLigne/ponderation`
  - `POST /api/referentiels/versions/:id/verifier-coherence`
- branchement composeur backend realise
- securisation des mutations via le meme rail `referentiel.write` que la publication

Preuves code :

- [ControleurReferentielsAcademiques.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/interfaces/http/controllers/ControleurReferentielsAcademiques.ts)
- [referentiel-import.validator.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/interfaces/http/validators/referentiel-import.validator.ts)
- [referentiels-academiques.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/interfaces/http/routes/referentiels-academiques.routes.ts)
- [referentiel-academique.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/routes/referentiel-academique.routes.ts)
- [edition-version-travail-referentiel.controller.test.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/tests/edition-version-travail-referentiel.controller.test.ts)
- [edition-version-travail-referentiel.routes.test.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/tests/edition-version-travail-referentiel.routes.test.ts)

## LOT 4 - Tests

Statut :

- ferme techniquement
- couverture critique domaine / application / controleur / routes en place
- validations, refus d'acces et conflits metier verifies

#### Tache 4.1 - Tests domaine

Cas minimaux :

- version publiee refusee en mutation
- version active refusee en mutation
- ligne ajoutee avec succes sur version non publiee
- duplication de cours refusee
- ordre duplique refuse
- ponderation invalide refusee
- examen interdit si ponderation examen incoherente

#### Tache 4.2 - Tests use cases

Cas minimaux :

- creation version de travail
- modification ligne
- retrait ligne
- reordonnancement
- verrouillage version migree

#### Tache 4.3 - Tests routes

Cas minimaux :

- `200` en cas nominal
- `403` sans permission
- `409` ou erreur metier equivalente sur version verrouillee
- `400` sur payload invalide

#### Tache 4.4 - Tests securite integration

Objectif :

- garantir que seul `Plateforme` + `referentiel.write` peut muter

Livrable effectivement pose :

- tests domaine :
  - version publiee refusee
  - version active refusee
  - creation version travail
  - duplication cours
  - duplication ordre
  - incompatibilite examen / ponderation
- tests use cases :
  - creation version travail
  - ajout ligne
  - modification ligne
  - retrait ligne
  - reordonnancement
  - modification ponderation
  - verification coherence
  - verrou migration
- tests controleur :
  - tracabilite acteur injectee depuis le contexte
- tests routes :
  - propagation contexte authentifie
  - `400` sur payload invalide
  - `403` sur refus d'acces
  - `409` sur conflit metier de version deja engagee en migration
- traduction HTTP durcie :
  - `ErreurVersionReferentielInvalide` -> `409`
  - `ErreurMigrationImpossible` -> `409`

Preuves code :

- [edition-version-travail-referentiel.domain.test.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/tests/edition-version-travail-referentiel.domain.test.ts)
- [edition-version-travail-referentiel.use-cases.test.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/tests/edition-version-travail-referentiel.use-cases.test.ts)
- [edition-version-travail-referentiel.controller.test.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/tests/edition-version-travail-referentiel.controller.test.ts)
- [edition-version-travail-referentiel.routes.test.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/tests/edition-version-travail-referentiel.routes.test.ts)
- [ExecutionRouteProtegeeReferentielAcademique.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/interfaces/http/routes/ExecutionRouteProtegeeReferentielAcademique.ts)

## LOT 5 - Frontend Apres Stabilisation Backend

Le frontend ne commence qu'apres :

- typecheck backend OK
- tests backend OK
- routes stabilisees

Travail frontend cible :

- afficher les actions d'edition uniquement sur version non publiee
- masquer ou desactiver les actions sinon
- conserver :
  - tableau de gauche
  - fiche resume
  - bouton `Ouvrir les lignes du programme`
  - mode detail large

## Decoupage Technique En PR Logiques

### PR 1

- domaine uniquement

### PR 2

- use cases + DTO + audit

### PR 3

- controleur + validateurs + routes

### PR 4

- tests complets backend

### PR 5

- branchement frontend

## Risques A Surveiller

### Risque 1

Confondre edition de version officielle et ajustement local ecole.

Parade :

- rester strictement dans `ReferentielProgramme`
- ne pas reutiliser `MoteurProgrammeLocal` pour muter l'officiel

### Risque 2

Laisser publier une version incoherente.

Parade :

- pre-check explicite
- revalidation implicite dans `PublierVersionReferentiel`

### Risque 3

Oublier le verrou version deja migree.

Parade :

- verifier les migrations referencees avant mutation

### Risque 4

Introduire une nouvelle permission inutile.

Parade :

- conserver `referentiel.write`

## Definition Of Done

Le backlog sera considere implemente proprement lorsque :

- une version de travail peut etre creee depuis une version existante
- les lignes peuvent etre editees uniquement sur version non publiee
- les versions publiees et actives sont explicitement verrouillees
- les versions deja engagees en migration sont explicitement verrouillees
- toutes les mutations sont auditees
- tous les tests backend critiques passent
- le frontend n'expose aucune fausse action

## Recommendation CTO

Ne pas commencer par le frontend.

Le meilleur chemin reste :

1. domaine
2. use cases
3. routes
4. tests
5. frontend

Ainsi, le centre `Referentiel officiel Plateforme` restera premium, vrai et sans dette cachee.
