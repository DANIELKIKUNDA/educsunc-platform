# Phase 52 - Audit D Implementation Edition Des Versions Non Publiees

## Statut

Ce document prepare l'implementation de l'edition des lignes d'un `ReferentielProgramme` officiel au niveau `Plateforme`.

Il :

- ne modifie aucun code backend
- ne modifie aucun code frontend
- ne cree aucune route effective a ce stade
- ne change aucune permission existante

Il fixe :

- l'audit technique de l'existant
- les changements backend necessaires
- les changements frontend necessaires
- le plan d'implementation recommande

## Decision Metier Figee

Au niveau `Plateforme`, les lignes d'un referentiel programme ne peuvent etre editees que sur une version non publiee, en preparation.

Une version :

- publiee
- active
- deja engagee dans une migration vers les ecoles

est consideree comme verrouillee.

Toute correction officielle doit passer par :

1. la creation d'une version de travail
2. l'edition de cette version
3. les controles de coherence
4. la publication
5. l'activation
6. la comparaison
7. la migration des programmes locaux si necessaire

## Source De Verite Backend

Le backend actuel prouve deja :

- la lecture des referentiels programmes
- l'import des programmes et des lignes
- la publication
- l'activation
- la comparaison
- la migration

Preuves principales :

- [ReferentielProgramme.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/domain/aggregates/ReferentielProgramme.ts)
- [VersionReferentielProgramme.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/domain/aggregates/VersionReferentielProgramme.ts)
- [LigneReferentielProgramme.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/domain/entities/LigneReferentielProgramme.ts)
- [referentiels-academiques.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/interfaces/http/routes/referentiels-academiques.routes.ts)
- [ControleurReferentielsAcademiques.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/interfaces/http/controllers/ControleurReferentielsAcademiques.ts)

Le backend actuel ne prouve pas encore :

- la creation d'une version de travail dediee
- la mutation ligne par ligne d'une version officielle non publiee
- le reordonnancement des lignes
- la suppression d'une ligne officielle en mode edition
- un controle de verrouillage mutation sur version publiee / active / deja migree

## Constats Techniques Actuels

### 1. Le modele de version distingue deja `publiee` et `active`

Preuves :

- [VersionReferentielProgrammeSortie.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/application/dto/output/VersionReferentielProgrammeSortie.ts)
- [SchemasTablesGlobales.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/infrastructure/persistence/postgres/schemas/SchemasTablesGlobales.ts)

Observation :

- `publiee` existe deja
- `active` existe deja
- le schema Postgres decrit explicitement `publiee` comme une version publiee et verrouillee metierement

### 2. Le domaine porte deja les invariants de ligne

Les lignes officielles portent deja :

- ordre d'affichage
- cours reference
- obligatoire
- a examen
- calculable
- ponderation
- domaine
- sous-domaine

Preuve :

- [LigneReferentielProgramme.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/domain/entities/LigneReferentielProgramme.ts)

### 3. Le domaine ne porte pas encore les mutateurs de version de travail

Aujourd'hui, `VersionReferentielProgramme` :

- valide ses lignes
- publie une version
- compare une version

Mais ne porte pas encore de methodes pour :

- ajouter une ligne
- modifier une ligne
- retirer une ligne
- reordonner
- corriger une ponderation

Preuve :

- [VersionReferentielProgramme.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/domain/aggregates/VersionReferentielProgramme.ts)

### 4. Les routes HTTP actuelles ne couvrent pas l'edition des lignes

Routes existantes prouvees :

- `GET /api/referentiels/programmes`
- `GET /api/referentiels/programmes/:id`
- `POST /api/referentiels/import-programmes`
- `POST /api/referentiels/import-lignes`
- `POST /api/referentiels/versions`
- `POST /api/referentiels/versions/:id/activer`
- `POST /api/referentiels/comparer`

Preuve :

- [referentiels-academiques.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/interfaces/http/routes/referentiels-academiques.routes.ts)

Conclusion :

aucune route actuelle ne permet l'edition de lignes d'une version non publiee.

## Use Cases Backend A Creer Ou Completer

### UC-REF-EDIT-01 - Creer une version de travail depuis une version existante

Objectif :

- cloner une version source
- rattacher la copie au meme `ReferentielProgramme`
- la laisser non publiee
- la laisser non active
- conserver l'historique de creation

Nom recommande :

- `CreerVersionTravailReferentielDepuisVersion`

Objet touche :

- `ReferentielProgramme`
- `VersionReferentielProgramme`

### UC-REF-EDIT-02 - Ajouter une ligne a une version non publiee

Nom recommande :

- `AjouterLigneVersionReferentielProgramme`

Objet touche :

- `VersionReferentielProgramme`

### UC-REF-EDIT-03 - Modifier une ligne d'une version non publiee

Nom recommande :

- `ModifierLigneVersionReferentielProgramme`

Objet touche :

- `VersionReferentielProgramme`

Portee :

- obligatoire
- a examen
- calculable
- domaine
- sous-domaine
- source si le modele l'autorise

### UC-REF-EDIT-04 - Retirer une ligne d'une version non publiee

Nom recommande :

- `RetirerLigneVersionReferentielProgramme`

Objet touche :

- `VersionReferentielProgramme`

### UC-REF-EDIT-05 - Reordonner les lignes d'une version non publiee

Nom recommande :

- `ReordonnerLignesVersionReferentielProgramme`

Objet touche :

- `VersionReferentielProgramme`

### UC-REF-EDIT-06 - Modifier la ponderation d'une ligne

Nom recommande :

- `ModifierPonderationLigneVersionReferentielProgramme`

Objet touche :

- `VersionReferentielProgramme`
- `PonderationEvaluation`

### UC-REF-EDIT-07 - Verifier la coherence avant publication

Nom recommande :

- `VerifierCoherenceVersionReferentielAvantPublication`

Role :

- controle explicite pre-publication
- peut etre appele avant `PublierVersionReferentiel`
- peut aussi etre reapplique implicitement au moment de la publication

### Use cases existants a completer

- [PublierVersionReferentiel.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/application/use-cases/referentiels/PublierVersionReferentiel.ts)
  - doit refuser une version incoherente ou verrouillee
- [ActiverVersionReferentiel.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/application/use-cases/referentiels/ActiverVersionReferentiel.ts)
  - reste strictement reserve a une version publiee

## Routes HTTP Necessaires

Les routes proposees ci-dessous restent coherentes avec l'architecture existante `referentiels-academiques.routes.ts`.

### 1. Creer une version de travail

- methode : `POST`
- route proposee : `/api/referentiels/programmes/:id/versions-travail`
- permission : `referentiel.write`
- payload :
  - `idVersionSource`
  - `codeVersion`
  - `anneeReference`
  - `motifPreparation` optionnel
- reponse :
  - version creee
  - contexte referentiel

### 2. Ajouter une ligne

- methode : `POST`
- route proposee : `/api/referentiels/versions/:id/lignes`
- permission : `referentiel.write`
- payload :
  - `idReferentielCours`
  - `ordreAffichage`
  - `obligatoire`
  - `aExamen`
  - `estCalculable`
  - `ponderation`
  - `domaine` optionnel
  - `sousDomaine` optionnel
- reponse :
  - version mise a jour
  - ligne ajoutee

### 3. Modifier une ligne

- methode : `PATCH`
- route proposee : `/api/referentiels/versions/:id/lignes/:idLigne`
- permission : `referentiel.write`
- payload :
  - champs editables seulement
- reponse :
  - version mise a jour
  - ligne mise a jour

### 4. Retirer une ligne

- methode : `DELETE`
- route proposee : `/api/referentiels/versions/:id/lignes/:idLigne`
- permission : `referentiel.write`
- reponse :
  - version mise a jour
  - identifiant retire

### 5. Reordonner les lignes

- methode : `POST`
- route proposee : `/api/referentiels/versions/:id/lignes/reordonner`
- permission : `referentiel.write`
- payload :
  - `lignes`
    - `idLigne`
    - `ordreAffichage`
- reponse :
  - version mise a jour
  - lignes reordonnees

### 6. Modifier une ponderation

- methode : `POST`
- route proposee : `/api/referentiels/versions/:id/lignes/:idLigne/ponderation`
- permission : `referentiel.write`
- payload :
  - `ponderation`
- reponse :
  - ligne mise a jour
  - version mise a jour

### 7. Verifier la coherence

- methode : `POST`
- route proposee : `/api/referentiels/versions/:id/verifier-coherence`
- permission : `referentiel.write`
- payload :
  - vide ou contexte minimal
- reponse :
  - `estCoherente`
  - erreurs
  - avertissements

## Permissions

Permission recommandee :

- `referentiel.write`

Justification :

- toutes les mutations officielles de ce module utilisent deja `referentiel.write`
- aucune preuve backend actuelle n'impose un nouveau sous-decoupage
- le controle fin doit donc rester dans :
  - la route
  - le contexte `Plateforme`
  - le verrouillage version non publiee
  - l'audit obligatoire

Verdict permission :

- ne pas creer de nouvelle permission a ce stade

## Invariants Metier A Faire Respecter

### Invariants de ligne

- ordre unique dans une version
- cours unique dans une version
- ponderation valide
- compatibilite avec la structure trimestrielle ou semestrielle
- si `aExamen = false`, les composantes examen doivent rester a zero ou absentes selon le modele retenu par `PonderationEvaluation`
- sous-domaine interdit sans domaine

### Invariants de version

- une version publiee est verrouillee
- une version active est verrouillee
- une version engagee dans une migration est verrouillee
- une version publiee doit rester complete et coherente
- une version non publiee ne doit jamais devenir active directement sans publication

### Invariants de workflow

- publication uniquement apres verification de coherence
- activation uniquement pour une version publiee
- migration uniquement apres comparaison et selection explicite

## Verrouillage Version Deja Migree

Le backend devra refuser l'edition d'une version deja engagee en migration.

La preuve technique disponible aujourd'hui est suffisante pour preparer ce verrouillage :

- les migrations tracent `idAncienneVersionReferentiel` et `idNouvelleVersionReferentiel`
- une version peut donc etre detectee comme deja engagee dans un historique de migration

Preuves :

- [MigrationReferentielProgramme.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/domain/aggregates/MigrationReferentielProgramme.ts)
- [AnalyserMigrationReferentiel.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/application/use-cases/migrations/AnalyserMigrationReferentiel.ts)
- [AppliquerMigrationReferentiel.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/application/use-cases/migrations/AppliquerMigrationReferentiel.ts)

Point de conception recommande :

- refuser la mutation si la version est referencee comme ancienne ou nouvelle version dans une migration non annullee

## Adaptation Frontend Recommandee

### Onglet `Referentiels programmes`

Elements a conserver :

- tableau de gauche des referentiels
- fiche resume a droite
- bouton `Ouvrir les lignes du programme`
- mode detail large interne au centre

### Comportement cible

Sur une version non publiee et si `referentiel.write` est effectif :

- afficher les actions d'edition
- afficher les modales ou panneaux de mutation

Sur une version publiee ou active :

- masquer les actions de mutation
  ou
- afficher des actions disabled avec message metier

Messages metier cibles :

- `Cette version est publiee et ne peut plus etre modifiee.`
- `Cette version est active et ne peut plus etre modifiee.`
- `Creez une nouvelle version de travail pour apporter des corrections.`

### Actions de detail ciblees

- `Ajouter une ligne`
- `Modifier`
- `Retirer`
- `Reordonner`
- `Modifier les ponderations`

Regle stricte :

- ne rien exposer tant que la route backend correspondante n'existe pas reellement

## UX/UI

Le frontend ne doit jamais afficher :

- `MRP`
- `PLAT-REF`
- `UUID`
- `payload`
- `backend`

Messages de succes cibles :

- `Les lignes ont ete reordonnees avec succes.`
- `Les ponderations ont ete mises a jour avec succes.`
- `La version de travail a ete creee avec succes.`

Messages de refus cibles :

- `Cette version est publiee et ne peut plus etre modifiee.`
- `Cette version est active et ne peut plus etre modifiee.`
- `Cette version a deja ete engagee dans une migration et ne peut plus etre modifiee.`

## Securite

Le frontend seul ne suffit jamais.

Le backend doit refuser toute mutation si :

- la permission `referentiel.write` manque
- le contexte n'est pas `Plateforme`
- la version est publiee
- la version est active
- la version est deja engagee en migration

Toute mutation doit etre auditée.

Toute mutation doit preserver l'historique.

## Plan Technique Recommande

### Phase 1 - Domaine

- enrichir `VersionReferentielProgramme` avec des mutateurs de version non publiee
- enrichir `ReferentielProgramme` avec la creation de version de travail
- ajouter les verifications de verrouillage

### Phase 2 - Application

- creer les use cases d'edition
- ajouter le use case de verification de coherence
- brancher l'audit

### Phase 3 - HTTP

- ajouter les validateurs
- ajouter les routes
- ajouter les controles de securite locale

### Phase 4 - Tests backend

- tests unitaires domaine
- tests use cases
- tests routes
- tests securite
- tests verrouillage version publiee / active / migree

### Phase 5 - Frontend

- afficher les actions seulement quand les routes sont reelles
- brancher le mode detail
- ajouter les confirmations et messages metier

## Verdict Final

L'implementation de l'edition des lignes officielles est legitime et coherente avec la doctrine EduSync si et seulement si :

- elle reste reservee a `Plateforme`
- elle reste limitee aux versions non publiees
- elle preserve l'historique
- elle interdit toute mutation sur version publiee ou active
- elle n'autorise jamais l'ecole a editer l'officiel

Le backend actuel ne supporte pas encore ce workflow de bout en bout.

En revanche, le domaine, les invariants existants et la doctrine actuelle offrent deja une base saine pour l'implanter proprement.
