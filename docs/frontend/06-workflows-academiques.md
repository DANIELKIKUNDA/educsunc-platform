# Phase 6 - Workflows Academiques

## Statut

Ce document ouvre la documentation detaillee des workflows academiques reels d'EduSync.

Il s'appuie sur :

- [00-doctrine-frontend.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/00-doctrine-frontend.md)
- [01-acteurs.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/01-acteurs.md)
- [02-permissions-effectives.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/02-permissions-effectives.md)
- [03-cas-utilisation.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/03-cas-utilisation.md)
- [04-workflows.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/04-workflows.md)
- [05-workflows-reels.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/05-workflows-reels.md)

Le backend reste la source officielle de verite.

## Chaine de Dependances Academiques Corrigee

La lecture officielle corrigee des dependances academiques est la suivante :

- `ACA-08`
  - fournit le socle academique officiel
  - en particulier :
    - `SectionScolaire`
    - `ClasseAcademique`
    - `OptionEtude`
- `ACA-09`
  - consomme le programme local et le referentiel officiel deja publie
  - permet de migrer un `ProgrammeNiveau` vers une nouvelle version officielle
- `ACA-03`
  - fournit le contexte annuel d'exploitation
  - en particulier l'`AnneeScolaire` active de l'ecole
- `ACA-04`
  - consomme le socle academique officiel et le contexte annuel
  - produit les `ClassePedagogique` exploitees localement par l'ecole
- `ACA-05`
  - consomme les `ClassePedagogique`
  - gere les responsables officiels de classe pedagogique

Cette chaine remplace la lecture precedente trop large de `ACA-04`.

## Workflow ACA-09

### Identifiant

`ACA-09`

### Nom

Migrer un programme local vers une nouvelle version du referentiel officiel

### Categorie

`Academique`

### Niveau de criticite

`Critique`

### Objectif metier

Permettre a l'equipe systeme de comparer deux versions officielles, d'analyser l'impact sur un `ProgrammeNiveau`, d'appliquer la migration, d'en conserver l'historique et de relancer les recalculs post-migration sans laisser une ecole inventer localement sa propre evolution de referentiel.

### Acteur principal

`MANAGER_SYSTEME`

### Acteurs secondaires

- `OPERATEUR_SYSTEME`
- `SUPPORT_SYSTEME`

### Preconditions

- un `ProgrammeNiveau` cible doit deja exister
- les versions officielles source et cible doivent exister
- l'acteur doit etre un role systeme autorise
- `referentiel.read` est requis pour les lectures
- `referentiel.write` est requis pour les mutations
- l'identite acteur est imposee par le contexte authentifie, pas declaree librement dans le corps HTTP

### Permissions effectives requises

- `referentiel.read`
  - lister les migrations d'un programme
  - consulter un rapport de migration
- `referentiel.write`
  - analyser une migration
  - appliquer une migration
  - annuler une migration non appliquee
  - relancer un recalcul post-migration

### Cas d'utilisation utilises

- `ListerMigrationsReferentielParProgrammeNiveau`
- `ConsulterRapportMigration`
- `AnalyserMigrationReferentiel`
- `AppliquerMigrationReferentiel`
- `AnnulerMigrationReferentiel`
- `RelancerRecalculApresMigration`

### Routes backend reelles

- `GET /api/migrations-referentiel`
- `GET /api/migrations-referentiel/:id`
- `POST /api/migrations-referentiel/analyser`
- `POST /api/migrations-referentiel/appliquer`
- `POST /api/migrations-referentiel/:id/annuler`
- `POST /api/migrations-referentiel/:id/relancer-recalcul`

### Sources backend

- routes :
  - [migrations-referentiel.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/interfaces/http/routes/migrations-referentiel.routes.ts)
- controleur :
  - [ControleurMigrationsReferentiel.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/interfaces/http/controllers/ControleurMigrationsReferentiel.ts)
- securite locale :
  - [AutorisationMigrationReferentielAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationMigrationReferentielAdapter.ts)
- tests :
  - [security-migrations-referentiel.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-migrations-referentiel.integration.spec.ts)
  - [migrations-referentiel.routes.test.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/tests/migrations-referentiel.routes.test.ts)

### Notes de lecture frontend

- `ACA-09` n'est pas un simple rapport de differences.
- le coeur metier est la migration historisee d'un `ProgrammeNiveau` local a partir d'une nouvelle version officielle.
- la tracabilite acteur ne doit plus etre saisie librement par le frontend.
- `ACA-09` depend directement de l'existence prealable de `ACA-07` et du socle officiel deja gere en `ACA-08`.

### Statut de figement

`ACA-09 FIGE`

## Workflow ACA-08

### Identifiant

`ACA-08`

### Nom

Administrer le socle academique officiel

### Categorie

`Academique`

### Niveau de criticite

`Important`

### Objectif metier

Permettre a l'equipe systeme d'administrer le socle academique officiel transverse consomme ensuite par les workflows locaux des ecoles, en particulier `SectionScolaire`, `ClasseAcademique` et `OptionEtude`, sans melanger cette responsabilite avec la gestion locale des `ClassePedagogique`.

### Acteur principal

`MANAGER_SYSTEME`

### Acteurs secondaires

- `OPERATEUR_SYSTEME`
- `SUPPORT_SYSTEME`

### Preconditions

- l'acteur doit porter une affectation systeme active
- l'acteur doit disposer de `referentiel.read` pour lire
- l'acteur doit disposer de `referentiel.write` pour creer
- le contexte de requete doit transporter un utilisateur authentifie
- le workflow ne repose pas sur un scope `ecole` local pour sa legitimite metier

### Permissions effectives requises

- `referentiel.read`
  - lister les `SectionScolaire`
  - lister les `ClasseAcademique`
  - lister les `OptionEtude`
- `referentiel.write`
  - creer une `SectionScolaire`
  - creer une `ClasseAcademique`
  - creer une `OptionEtude`

### Perimetre reel

- plateforme / systeme
- jamais lu comme un workflow de classe locale
- jamais lu comme un workflow d'ecole d'exploitation

### Cas d'utilisation utilises

- `CreerSectionScolaire`
- `ListerSectionsScolaires`
- `CreerClasseAcademique`
- `ListerClassesAcademiques`
- `CreerOptionEtude`
- `ListerOptionsEtudes`

### Routes backend reelles

- `POST /api/sections-scolaires`
- `GET /api/sections-scolaires`
- `POST /api/classes-academiques`
- `GET /api/classes-academiques`
- `POST /api/options-etudes`
- `GET /api/options-etudes`

### Sources backend

- routes :
  - [socle-academique.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/interfaces/http/routes/socle-academique.routes.ts)
- controleur :
  - [ControleurStructureScolaire.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/interfaces/http/controllers/ControleurStructureScolaire.ts)
- cas d'utilisation :
  - [CreerSectionScolaire.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/application/use-cases/structure/CreerSectionScolaire.ts)
  - [ListerSectionsScolaires.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/application/use-cases/structure/ListerSectionsScolaires.ts)
  - [CreerClasseAcademique.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/application/use-cases/structure/CreerClasseAcademique.ts)
  - [ListerClassesAcademiques.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/application/use-cases/structure/ListerClassesAcademiques.ts)
  - [CreerOptionEtude.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/application/use-cases/structure/CreerOptionEtude.ts)
  - [ListerOptionsEtudes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/application/use-cases/structure/ListerOptionsEtudes.ts)
- securite locale :
  - [AutorisationSocleAcademiqueAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationSocleAcademiqueAdapter.ts)
- tests :
  - [security-socle-academique.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-socle-academique.integration.spec.ts)
  - [socle-academique.routes.test.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/tests/socle-academique.routes.test.ts)

### Notes de lecture frontend

- `ACA-08` est le proprietaire documentaire des routes de `SectionScolaire`, `ClasseAcademique` et `OptionEtude`.
- `ACA-04` consomme ce socle, mais ne le possede pas.
- Le cycle reel actuellement atteste est volontairement minimal :
  - creation
  - consultation liste
- aucune mutation supplementaire ne doit etre inventee cote frontend tant qu'elle n'est pas branchee dans le backend.

### Statut de figement

`ACA-08 FIGE`

## Workflow ACA-03

### Identifiant

`ACA-03`

### Nom

Piloter l'annee scolaire de l'ecole

### Categorie

`Academique`

### Niveau de criticite

`Critique`

### Objectif metier

Permettre a l'ecole de creer, consulter, preparer, garantir, activer, basculer, modifier, cloturer et archiver ses annees scolaires de maniere coherente, sans laisser l'ecole sans annee exploitable et sans violer le cycle de vie metier de l'agregat `AnneeScolaire`.

### Acteur principal

`ADMINISTRATEUR_ECOLE`

### Acteurs secondaires

Aucun acteur secondaire n'est explicitement atteste pour ce workflow dans les sources backend retenues pour cette phase.

### Preconditions

- une `Ecole` cible doit exister dans le backend
- l'acteur doit intervenir dans le bon scope organisation/ecole
- le contexte actif doit etre coherent avec l'ecole manipulee
- les informations de tracabilite doivent etre fournies pour les actions d'ecriture :
  - `creePar`
  - `modifiePar`
- pour les operations sur une annee existante, l'identifiant de l'annee cible doit etre connu
- pour les operations de liste, une pagination valide doit etre fournie
- pour preparer l'annee suivante, une annee active doit deja exister
- pour activer une annee, l'annee cible doit etre `PLANIFIEE`
- pour cloturer une annee, l'annee cible doit etre `ACTIVE`
- pour archiver une annee, l'annee cible doit etre `CLOTUREE`

### Permissions effectives requises

Le backend ne porte pas, dans les documents de permissions deja figes, une permission fine distincte du type `annees-scolaires.write`.

Le workflow repose donc sur les permissions effectives transverses suivantes :

- `referentiel.read`
  - pour consulter l'annee active
  - pour lister les annees scolaires d'une ecole
- `referentiel.write`
  - pour creer une annee scolaire
  - pour preparer l'annee suivante
  - pour garantir une annee active
  - pour basculer une annee scolaire
  - pour modifier une annee planifiee
  - pour activer une annee planifiee
  - pour cloturer une annee active
  - pour archiver une annee cloturee

### Cas d'utilisation utilises

- `CreerAnneeScolaire`
- `ConsulterAnneeActiveParEcole`
- `ListerAnneesScolairesParEcole`
- `PreparerAnneeScolaireSuivante`
- `GarantirAnneeScolaireActiveParEcole`
- `BasculerAnneeScolaire`
- `ModifierAnneeScolaire`
- `ActiverAnneeScolaire`
- `CloturerAnneeScolaire`
- `ArchiverAnneeScolaire`

### Deroulement principal

Le deroulement principal retenu pour ce workflow est le cycle nominal d'une ecole qui exploite deja une annee active et prepare la suivante sans rupture.

1. L'acteur consulte l'annee scolaire active de l'ecole.
2. L'acteur liste les annees scolaires existantes de l'ecole pour disposer de l'historique et de l'etat courant.
3. Tant qu'une annee active existe, l'acteur prepare l'annee scolaire suivante.
4. Le backend propose automatiquement une annee suivante a partir de l'annee active selon le cycle administratif RDC, sauf si des dates forcees sont fournies.
5. Si l'annee suivante existe deja avec le meme code, la preparation retourne l'annee existante sans en creer une nouvelle.
6. Si l'annee suivante a ete preparee et reste `PLANIFIEE`, l'acteur peut ajuster ses informations administratives avant activation.
7. Au moment de la transition annuelle, l'acteur bascule l'annee scolaire.
8. La bascule cloture l'annee active courante et active immediatement l'annee suivante dans une meme operation transactionnelle.
9. Apres la bascule, l'ecole dispose toujours d'une annee `ACTIVE`, l'annee precedente devient `CLOTUREE`, et l'historique reste coherent.
10. Quand la conservation administrative l'autorise, l'acteur peut archiver une annee precedemment cloturee.

### Variantes

#### Variante 1 - Creation initiale d'une annee scolaire

- l'ecole existe mais aucune annee n'a encore ete creee
- l'acteur cree explicitement une premiere annee scolaire
- cette annee est initialement `PLANIFIEE`
- elle peut ensuite etre activee manuellement

#### Variante 2 - Garantie automatique d'une annee active pour une ecole neuve

- l'ecole existe mais aucune annee n'existe encore
- l'acteur declenche `GarantirAnneeScolaireActiveParEcole`
- le backend cree et active automatiquement l'annee courante
- la sortie porte l'action `CREEE_ET_ACTIVEE`

#### Variante 3 - Garantie automatique a partir d'une unique annee planifiee

- aucune annee active n'existe
- une unique annee `PLANIFIEE` existe deja
- le backend active automatiquement cette annee
- la sortie porte l'action `PLANIFIEE_ACTIVEE`

#### Variante 4 - Garantie sans effet de mutation

- une annee active existe deja
- `GarantirAnneeScolaireActiveParEcole` retourne simplement cette annee
- la sortie porte l'action `EXISTANTE`

#### Variante 5 - Activation manuelle d'une annee planifiee

- l'acteur active explicitement une annee `PLANIFIEE`
- l'activation est refusee si une autre annee est deja active pour la meme ecole

#### Variante 6 - Bascule avec creation implicite de l'annee suivante

- une annee active existe
- aucune annee suivante planifiee n'existe encore
- si `creerSuivanteSiAbsente = true`, la bascule cree l'annee suivante puis l'active dans la meme operation

#### Variante 7 - Bascule apres preparation explicite

- une annee active existe
- une annee suivante `PLANIFIEE` existe deja
- la bascule reutilise cette annee, la rend `ACTIVE` et cloture l'annee courante

#### Variante 8 - Cloture manuelle d'une annee active

- l'acteur cloture explicitement une annee `ACTIVE`
- cette variante existe dans le backend mais laisse ensuite le pilotage responsable d'une future activation ou bascule

#### Variante 9 - Archivage d'une annee cloturee

- une annee `CLOTUREE` existe
- l'acteur l'archive explicitement
- le backend refuse toute tentative d'archivage d'une annee non cloturee

### Resultat attendu

En sortie de ce workflow, l'ecole doit disposer d'un cycle annuel coherent :

- au plus une annee `ACTIVE` exploitable pour l'ecole
- zero ou plusieurs annees `PLANIFIEES` tant que les regles de transition ne sont pas violees
- des annees historiques `CLOTUREES` ou `ARCHIVEES`
- une tracabilite complete des mutations importantes
- une continuite d'exploitation qui ne laisse pas l'ecole sans cadre annuel valide lors d'une bascule nominale

### Contraintes backend

- l'ecole cible doit exister, sinon le backend leve `ErreurEcoleInvalide`
- les entrees obligatoires doivent etre renseignees et valides
- les dates doivent etre valides
- la date de debut doit etre strictement anterieure a la date de fin
- une annee `PLANIFIEE` seule peut etre modifiee
- une annee `PLANIFIEE` seule peut etre activee
- une annee `ACTIVE` seule peut etre cloturee
- une annee `CLOTUREE` seule peut etre archivee
- une autre annee active dans la meme ecole interdit l'activation manuelle d'une annee differente
- `PreparerAnneeScolaireSuivante` exige une annee active source
- `GarantirAnneeScolaireActiveParEcole` refuse le choix automatique s'il existe plusieurs annees planifiees
- `GarantirAnneeScolaireActiveParEcole` refuse aussi les situations ambigues avec historique existant mais sans annee active ni annee planifiee unique
- `BasculerAnneeScolaire` refuse la bascule si aucune annee active n'existe
- `BasculerAnneeScolaire` refuse d'utiliser une annee suivante existante si elle n'est pas `PLANIFIEE`
- `BasculerAnneeScolaire` peut exiger une preparation explicite si `creerSuivanteSiAbsente = false`
- les operations majeures de mutation passent par la tracabilite `PolicyAudit`
- plusieurs routes critiques sont executees via le mecanisme idempotent des routes referentiel
- les routes sont executees sous controle tenant avec `idEcole` comme cle principale de scope

### Evenements importants

Points de transition metier importants observes dans le backend :

- creation d'une annee scolaire
- preparation de l'annee suivante
- activation d'une annee planifiee
- cloture d'une annee active
- archivage d'une annee cloturee
- bascule annuelle transactionnelle
- garantie automatique d'une annee active
- ecriture d'une entree de journal d'audit pour chaque mutation majeure

### Donnees manipulees

- `Ecole`
- `AnneeScolaire`
- `StatutAnneeScolaire`
  - `PLANIFIEE`
  - `ACTIVE`
  - `CLOTUREE`
  - `ARCHIVEE`
- code d'annee scolaire
- libelle d'annee scolaire
- dates de debut et de fin
- dates d'activation, de cloture et d'archivage
- donnees de tracabilite :
  - `creePar`
  - `modifiePar`
  - `creeLe`
  - `modifieLe`
- journal d'audit du referentiel academique

### Sources backend

- routes :
  - [annees-scolaires.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/interfaces/http/routes/annees-scolaires.routes.ts)
- agregat :
  - [AnneeScolaire.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/domain/aggregates/AnneeScolaire.ts)
- services applicatifs :
  - [ServiceCycleAnneeScolaireRdc.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/application/services/ServiceCycleAnneeScolaireRdc.ts)
- cas d'utilisation :
  - [CreerAnneeScolaire.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/application/use-cases/annees/CreerAnneeScolaire.ts)
  - [ConsulterAnneeActiveParEcole.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/application/use-cases/annees/ConsulterAnneeActiveParEcole.ts)
  - [ListerAnneesScolairesParEcole.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/application/use-cases/annees/ListerAnneesScolairesParEcole.ts)
  - [PreparerAnneeScolaireSuivante.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/application/use-cases/annees/PreparerAnneeScolaireSuivante.ts)
  - [GarantirAnneeScolaireActiveParEcole.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/application/use-cases/annees/GarantirAnneeScolaireActiveParEcole.ts)
  - [BasculerAnneeScolaire.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/application/use-cases/annees/BasculerAnneeScolaire.ts)
  - [ModifierAnneeScolaire.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/application/use-cases/annees/ModifierAnneeScolaire.ts)
  - [ActiverAnneeScolaire.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/application/use-cases/annees/ActiverAnneeScolaire.ts)
  - [CloturerAnneeScolaire.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/application/use-cases/annees/CloturerAnneeScolaire.ts)
  - [ArchiverAnneeScolaire.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/application/use-cases/annees/ArchiverAnneeScolaire.ts)
- tests :
  - [orchestration-annee-scolaire.test.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/tests/orchestration-annee-scolaire.test.ts)

### Notes de lecture frontend

- Ce workflow doit etre lu comme un cycle metier annuel, pas comme une simple operation CRUD sur une entite.
- Le frontend devra respecter fortement la logique de statuts :
  - `PLANIFIEE`
  - `ACTIVE`
  - `CLOTUREE`
  - `ARCHIVEE`
- Les actions disponibles ne doivent jamais etre deduites d'un role brut seul.
- Le frontend devra s'appuyer sur les permissions effectives et sur l'etat courant de l'annee.
- La bascule annuelle est une operation critique et transactionnelle : elle ne doit pas etre traduite comme une simple edition.
- `GarantirAnneeScolaireActiveParEcole` est un mecanisme de securisation d'exploitation utile pour les cas de rattrapage ou d'initialisation, pas seulement une lecture.
- Ce workflow sert de socle a plusieurs autres workflows academiques :
  - structure scolaire locale
  - responsabilite de classe pedagogique
  - calendrier academique local
  - programme-niveau local

### Notes de verrouillage

- La granularite fine des permissions backend autour de l'annee scolaire n'est pas exposee comme un sous-ensemble distinct de `referentiel.read` et `referentiel.write` dans les documents de permissions deja figes.
- Les sources backend lues pour cette phase permettent de retenir `ADMINISTRATEUR_ECOLE` comme acteur principal du workflow, mais elles n'attestent pas encore, au meme niveau de preuve, d'un acteur secondaire officiel pour ce meme workflow.

### Statut de figement

`ACA-03 FIGE`

## Workflow ACA-04

### Identifiant

`ACA-04`

### Nom

Administrer la structure scolaire locale

### Categorie

`Academique`

### Niveau de criticite

`Critique`

### Objectif metier

Permettre a l'ecole de construire et maintenir sa structure d'exploitation locale en ouvrant, consultant, renommant, desactivant, archivant et exposant les `ClassePedagogique` rattachees a une ecole et a une annee active, a partir d'un socle academique officiel deja disponible.

### Acteur principal

`ADMINISTRATEUR_ECOLE`

### Acteurs secondaires

Aucun acteur secondaire n'est explicitement atteste pour ce workflow dans les sources backend retenues pour cette phase.

### Preconditions

- le socle academique officiel doit deja exister et etre exploitable, en amont de ce workflow :
  - `SectionScolaire`
  - `ClasseAcademique`
  - `OptionEtude` si necessaire
- une ecole cible doit exister pour toutes les operations portant sur la classe pedagogique locale
- l'acteur doit intervenir dans le bon scope organisation/ecole
- le contexte actif doit etre coherent avec l'ecole manipulee
- les informations de tracabilite doivent etre fournies pour les actions d'ecriture
- pour creer une classe pedagogique :
  - l'ecole cible doit exister
  - l'ecole doit etre active
  - l'annee scolaire cible doit exister
  - l'annee scolaire cible doit appartenir a l'ecole
  - l'annee scolaire cible doit etre `ACTIVE`
  - la classe academique cible doit exister
  - la classe academique cible doit etre active
- pour lister les classes pedagogiques :
  - l'ecole doit exister
  - l'annee scolaire doit exister
  - l'annee doit appartenir a l'ecole
  - une pagination valide doit etre fournie
- pour renommer, desactiver, archiver ou consulter les regles de frais d'une classe pedagogique :
  - l'identifiant de la classe pedagogique doit etre connu

### Permissions effectives requises

Le backend ne porte pas, dans les documents de permissions deja figes, un sous-decoupage officiel plus fin que `referentiel.read` et `referentiel.write` pour cette partie du BC.

Le workflow repose donc sur :

- `referentiel.read`
  - pour lister les classes pedagogiques par ecole et annee
  - pour consulter les regles de frais d'une classe pedagogique
- `referentiel.write`
  - pour creer une classe pedagogique
  - pour renommer une classe pedagogique
  - pour desactiver une classe pedagogique
  - pour archiver une classe pedagogique

### Cas d'utilisation utilises

- `CreerClassePedagogique`
- `ListerClassesPedagogiquesParEcoleEtAnnee`
- `RenommerClassePedagogique`
- `DesactiverClassePedagogique`
- `ArchiverClassePedagogique`
- `ConsulterReglesFraisClasse`

### Deroulement principal

Le deroulement principal retenu pour ACA-04 est celui d'une ecole qui prepare puis maintient ses classes pedagogiques locales pour une annee active, a partir d'un socle academique deja etabli.

1. L'acteur s'appuie sur le socle academique officiel deja disponible pour identifier la classe academique a exploiter localement.
2. L'acteur verifie qu'une annee scolaire active existe pour l'ecole concernee.
3. L'acteur ouvre une ou plusieurs classes pedagogiques locales dans l'ecole et pour cette annee active.
4. Lors de la creation d'une classe pedagogique, le backend verifie la coherence complete entre :
   - l'ecole
   - l'annee scolaire
   - la classe academique
   - le code local de classe
5. La classe pedagogique creee devient la classe reelle exploitee localement dans l'ecole pour l'annee en cours.
6. L'acteur peut lister les classes pedagogiques de l'ecole pour l'annee ciblee afin de piloter la structure effectivement ouverte.
7. Si necessaire, l'acteur renomme une classe pedagogique pour ajuster son libelle sans changer son rattachement structurel.
8. Si une classe ne doit plus etre exploitee, l'acteur peut la desactiver.
9. Si une classe doit sortir du perimetre courant de gestion, l'acteur peut l'archiver.
10. L'acteur peut consulter les regles de frais d'une classe pedagogique pour exposer les faits academiques consommes par les domaines aval, sans prendre lui-meme de decision de paiement.

### Variantes

#### Variante 1 - Creation d'une classe pedagogique locale

- l'ecole est active
- l'annee est active
- la classe academique est active
- aucune autre classe pedagogique de meme code n'existe dans le meme contexte ecole/annee
- le backend cree la classe pedagogique locale

#### Variante 2 - Listage des classes pedagogiques d'une ecole pour une annee

- l'acteur lit les classes pedagogiques locales sans mutation
- le backend verifie la coherence entre ecole et annee
- le listage utilise les contraintes de pagination prevues

#### Variante 3 - Renommage d'une classe pedagogique

- la classe pedagogique existe
- seul son libelle est modifie
- le backend ne change ni l'ecole, ni l'annee, ni la classe academique

#### Variante 4 - Desactivation d'une classe pedagogique

- la classe pedagogique existe
- si elle est active, elle devient inactive
- si elle est deja inactive, le backend retourne l'etat courant sans autre mutation

#### Variante 5 - Archivage d'une classe pedagogique

- la classe pedagogique existe
- si elle est deja archivee, le backend refuse l'operation
- sinon elle devient archivee et inactive

#### Variante 6 - Consultation des regles de frais d'une classe pedagogique

- la classe pedagogique existe
- le backend retourne les faits academiques necessaires au domaine paiements
- cette consultation n'emporte aucune decision de facturation

### Resultat attendu

En sortie de ce workflow, l'ecole doit disposer d'une structure d'exploitation locale exploitable :

- un ensemble coherent de classes pedagogiques ouvertes pour l'ecole et l'annee active
- des classes pedagogiques identifiables, renommables, desactivables et archivables selon leur cycle de vie
- des regles de frais consultables a partir de la classe pedagogique
- aucune incoherence structurelle entre la classe pedagogique locale et le socle academique officiel qu'elle consomme

### Contraintes backend

- les entrees obligatoires doivent etre renseignees et valides
- une classe pedagogique ne peut pas etre creee si son code existe deja dans le contexte ecole/annee
- une classe pedagogique locale ne peut etre creee que dans une ecole active
- une classe pedagogique locale ne peut etre creee que sur une annee scolaire active
- l'annee scolaire ciblee doit appartenir a l'ecole ciblee
- la classe academique ciblee doit etre active
- la classe academique ciblee doit deja appartenir au socle academique officiel exploitable
- les verifications de compatibilite structurelle entre section, classe academique et option sont des contraintes amont portees par le socle officiel et consommees ici indirectement via la classe academique
- le suffixe parallele d'une classe pedagogique, s'il existe, doit etre alphanumerique
- une classe archivee ne peut pas etre reactivee
- une classe archivee ne peut pas rester active
- l'archivage d'une classe pedagogique deja archivee est interdit
- les mutations critiques de structure locale passent par `PolicyAudit` lorsqu'elles sont prevues par les use cases
- la creation de classe pedagogique passe par une route idempotente et sous controle tenant `idEcole`
- plusieurs operations de lecture ou mutation locale s'executent avec `tenant_requis`

### Evenements importants

Points de transition metier importants observes dans le backend :

- creation d'une classe pedagogique locale
- renommage d'une classe pedagogique
- desactivation d'une classe pedagogique
- archivage d'une classe pedagogique
- consultation des regles de frais d'une classe pedagogique
- verifications de compatibilite structurelle par le moteur de structure scolaire

### Donnees manipulees

- `ClassePedagogique`
- `Ecole`
- `AnneeScolaire`
- identifiant de `ClasseAcademique` de rattachement
- donnees locales de classe pedagogique :
  - code local
  - libelle local
  - suffixe parallele
  - capacite d'accueil
  - statut actif/inactif
  - date d'archivage
- references structurelles amont consommees :
  - section scolaire de la classe academique
  - option d'etude eventuelle
  - type de structure d'evaluation
- faits academiques de frais lies a la classe pedagogique

### Sources backend

- routes :
  - [structure-scolaire.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/interfaces/http/routes/structure-scolaire.routes.ts)
- agregats :
  - [ClassePedagogique.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/domain/aggregates/ClassePedagogique.ts)
- services de domaine :
  - [MoteurStructureScolaire.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/domain/services/MoteurStructureScolaire.ts)
- cas d'utilisation :
  - [CreerClassePedagogique.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/application/use-cases/structure/CreerClassePedagogique.ts)
  - [ListerClassesPedagogiquesParEcoleEtAnnee.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/application/use-cases/structure/ListerClassesPedagogiquesParEcoleEtAnnee.ts)
  - [RenommerClassePedagogique.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/application/use-cases/structure/RenommerClassePedagogique.ts)
  - [DesactiverClassePedagogique.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/application/use-cases/structure/DesactiverClassePedagogique.ts)
  - [ArchiverClassePedagogique.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/application/use-cases/structure/ArchiverClassePedagogique.ts)
  - [ConsulterReglesFraisClasse.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/application/use-cases/structure/ConsulterReglesFraisClasse.ts)
- sources amont consommees :
  - [SectionScolaire.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/domain/aggregates/SectionScolaire.ts)
  - [ClasseAcademique.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/domain/aggregates/ClasseAcademique.ts)
  - [OptionEtude.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/domain/aggregates/OptionEtude.ts)
- tests :
  - [responsabilite-classe-pedagogique.test.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/tests/responsabilite-classe-pedagogique.test.ts)

### Notes de lecture frontend

- ACA-04 ne doit plus etre lu comme un workflow mixte de socle academique et de structure locale.
- Le coeur du workflow est la production et la maintenance des `ClassePedagogique` exploitees localement dans l'ecole.
- La `ClassePedagogique` est la charniere metier entre :
  - le socle academique officiel fourni par `ACA-08`
  - l'annee scolaire active
  - l'ecole
  - les futures responsabilites de classe
- Le frontend devra respecter explicitement la difference entre :
  - socle academique officiel
  - exploitation locale de l'ecole
- `SectionScolaire`, `ClasseAcademique` et `OptionEtude` doivent etre lus ici comme des donnees amont consommees, pas comme le coeur de responsabilite documentaire d'ACA-04.
- ACA-04 doit etre considere comme prerequis direct de ACA-05.
- Tant qu'une `ClassePedagogique` n'existe pas de maniere coherente, il ne peut pas exister de responsabilite officielle de classe pedagogique.
- La consultation des regles de frais doit etre lue comme une exposition de faits academiques vers les workflows financiers, pas comme un workflow de paiement.

### Notes de verrouillage

- Le backend conserve volontairement `referentiel.write` comme permission transverse commune a `ACA-08` et `ACA-04`.
- La separation effective ne repose pas sur la suppression de permissions, mais sur le branchement local des routes, du controleur et du perimetre documentaire.
- Les sources retenues pour cette phase attestent `ADMINISTRATEUR_ECOLE` comme acteur principal d'`ACA-04`, sans acteur secondaire officiel materialise au meme niveau de preuve.

### Statut de figement

`ACA-04 FIGE`

## Workflow ACA-05

### Identifiant

`ACA-05`

### Nom

Gerer la responsabilite de classe pedagogique

### Categorie

`Academique`

### Niveau de criticite

`Critique`

### Objectif metier

Permettre a l'ecole d'attribuer, consulter et retirer le responsable officiel d'une `ClassePedagogique`, de maniere coherente avec l'ecole, l'annee scolaire, la classe academique et la section scolaire, afin de produire la source de verite metier qui sera ensuite consommee par `shared/security` pour determiner le titulariat effectif et debloquer les workflows pedagogiques qui en dependent.

### Acteur principal

`ADMINISTRATEUR_ECOLE`

### Acteurs secondaires

- `ENSEIGNANT`
  - comme sujet de la responsabilite attribuee ou retiree
- `shared/security`
  - comme consommateur derive de la verite metier produite par ce workflow

### Preconditions

- une `ClassePedagogique` cible doit exister
- la `ClassePedagogique` doit deja etre issue d'ACA-04
- l'acteur doit intervenir dans le bon scope organisation/ecole
- le contexte actif doit etre coherent avec l'ecole manipulee
- pour l'attribution :
  - l'identifiant de la classe pedagogique doit etre connu
  - l'identifiant de l'utilisateur enseignant cible doit etre connu
  - les informations de tracabilite doivent etre fournies via `creePar`
  - l'utilisateur cible doit exister
  - l'utilisateur cible doit disposer d'une affectation active `ENSEIGNANT`
  - l'affectation active `ENSEIGNANT` doit etre dans la meme organisation
  - l'affectation active `ENSEIGNANT` doit etre dans la meme ecole
- pour le retrait :
  - l'identifiant de la classe pedagogique doit etre connu
  - l'identifiant de l'annee scolaire doit etre connu
- pour la consultation :
  - l'identifiant de la classe pedagogique doit etre connu
  - l'identifiant de l'annee scolaire doit etre connu
- la `ClassePedagogique` doit pouvoir etre resolue vers :
  - sa `ClasseAcademique`
  - sa `SectionScolaire`
  - son `AnneeScolaire`
  - son `Ecole`

### Permissions effectives requises

Le backend ne porte pas, dans les documents de permissions deja figes, une permission fine distincte du type `responsabilite-classe.write`.

Le workflow repose donc sur :

- `referentiel.read`
  - pour consulter le responsable actif d'une classe pedagogique pour une annee
- `referentiel.write`
  - pour attribuer un responsable de classe pedagogique
  - pour retirer un responsable de classe pedagogique

### Cas d'utilisation utilises

- `AttribuerResponsableClassePedagogique`
- `ConsulterResponsableClassePedagogique`
- `RetirerResponsableClassePedagogique`

### Deroulement principal

Le deroulement principal retenu pour ACA-05 est celui d'une ecole qui dispose deja d'une `ClassePedagogique` coherente et qui designe officiellement l'enseignant responsable de cette classe.

1. L'acteur identifie une `ClassePedagogique` existante, deja ouverte dans la bonne ecole et pour la bonne annee scolaire.
2. Le backend resout, a partir de cette `ClassePedagogique`, toute la chaine structurelle necessaire :
   - `ClasseAcademique`
   - `SectionScolaire`
   - `AnneeScolaire`
   - `Ecole`
3. Lors d'une attribution, le backend verifie qu'aucune responsabilite active n'existe deja pour cette meme classe pedagogique et cette meme annee scolaire.
4. Le backend verifie aussi la coherence complete entre :
   - la classe pedagogique
   - la classe academique
   - la section scolaire
   - l'annee scolaire
   - l'ecole
5. Le backend verifie ensuite l'eligibilite pedagogique et securite de l'utilisateur cible :
   - utilisateur existant
   - utilisateur actif
   - affectation active `ENSEIGNANT`
   - meme organisation
   - meme ecole
6. Si tout est coherent, le backend cree une `ResponsabiliteClassePedagogique` active, avec :
   - organisation
   - ecole
   - classe pedagogique
   - classe academique
   - section scolaire
   - annee scolaire
   - utilisateur enseignant
7. L'acteur peut consulter a tout moment le responsable actif d'une classe pedagogique pour une annee donnee.
8. Si le responsable doit changer ou disparaitre, l'acteur retire la responsabilite active.
9. Le retrait ne supprime pas la responsabilite : il la desactive et lui affecte une date de fin.
10. La responsabilite produite par ACA-05 devient alors consommable par `shared/security`.
11. `shared/security` utilise cette verite pour determiner le titulariat effectif selon la doctrine de section :
   - `MATERNELLE` / `PRIMAIRE` : `ResponsabiliteClassePedagogique` valide -> `titulaire effectif`
   - `SECONDAIRE` : `ResponsabiliteClassePedagogique` seule insuffisante
   - `SECONDAIRE` : `ResponsabiliteClassePedagogique` + `AffectationTitulariat` active -> `titulaire effectif`

### Variantes

#### Variante 1 - Attribution nominale d'un responsable de classe

- la classe pedagogique existe
- aucun responsable actif n'est encore porte pour cette classe et cette annee
- l'utilisateur cible est eligible comme `ENSEIGNANT` actif dans le bon scope
- le backend cree la responsabilite active

#### Variante 2 - Consultation positive d'une responsabilite active

- une responsabilite active existe pour la classe pedagogique et l'annee
- le backend la retourne avec sa projection enrichie :
  - sectionCode
  - sectionLibelle

#### Variante 3 - Consultation sans responsabilite active

- aucune responsabilite active n'existe pour la classe pedagogique et l'annee
- le backend retourne `null`

#### Variante 4 - Retrait nominal d'une responsabilite active

- une responsabilite active existe
- le backend la desactive
- une `dateFin` est posee
- la version metier est incrementee

#### Variante 5 - Attribution refusee pour unicite violee

- une responsabilite active existe deja pour cette classe pedagogique et cette annee
- le backend refuse la nouvelle attribution

#### Variante 6 - Attribution refusee pour incoherence structurelle

- la chaine resolue a partir de la classe pedagogique n'est pas coherente
- le backend refuse l'attribution si l'une des coherences suivantes echoue :
  - meme ecole
  - meme annee scolaire
  - classe academique coherente
  - section scolaire coherente

#### Variante 7 - Attribution refusee pour ineligibilite enseignant

- l'utilisateur cible n'existe pas
- ou n'est pas actif
- ou ne porte pas une affectation active `ENSEIGNANT`
- ou n'est pas dans la meme organisation
- ou n'est pas dans la meme ecole
- le backend refuse l'attribution

#### Variante 8 - Retrait refuse faute de responsabilite active

- aucune responsabilite active n'est trouvee pour la classe pedagogique et l'annee
- le backend leve une erreur

### Resultat attendu

En sortie de ce workflow, l'ecole doit disposer d'une verite metier officielle et consultable sur le responsable de chaque `ClassePedagogique` :

- au plus un responsable actif par classe pedagogique et par annee scolaire
- une responsabilite toujours scopee par :
  - organisation
  - ecole
  - classe pedagogique
  - classe academique
  - section scolaire
  - annee scolaire
- une responsabilite consultable par classe et annee
- une responsabilite retirable sans destruction brute de l'historique
- une source de verite exploitable par `shared/security` pour le titulariat effectif
- une source de verite reservee a un `ENSEIGNANT` actif du bon scope

### Contraintes backend

- l'identifiant de classe pedagogique est obligatoire pour attribuer, consulter et retirer
- l'identifiant d'annee scolaire est obligatoire pour consulter et retirer
- l'identifiant de l'utilisateur enseignant est obligatoire pour attribuer
- la classe pedagogique ciblee doit exister
- la classe academique rattachee doit exister
- la section scolaire rattachee doit exister
- l'annee scolaire rattachee doit exister
- l'ecole rattachee doit exister
- l'utilisateur cible doit exister
- l'utilisateur cible doit disposer d'une affectation active
- l'utilisateur cible doit disposer d'une affectation active `ENSEIGNANT`
- l'affectation active `ENSEIGNANT` doit etre dans la meme organisation que la classe pedagogique
- l'affectation active `ENSEIGNANT` doit etre dans la meme ecole que la classe pedagogique
- une seule responsabilite active est autorisee par `ClassePedagogique` et `AnneeScolaire`
- la responsabilite doit rester dans la meme ecole que la classe pedagogique
- la responsabilite doit rester dans la meme annee scolaire que la classe pedagogique
- la classe academique de la responsabilite doit correspondre a celle de la classe pedagogique
- la section scolaire de la responsabilite doit correspondre a celle de la classe academique
- une responsabilite active ne peut pas deja porter de `dateFin`
- le retrait d'une responsabilite deja inactive est interdit au niveau de l'agregat
- le retrait ne detruit pas l'objet : il le desactive
- les routes de ce workflow s'executent sous `tenant_requis`

### Evenements importants

Points de transition metier importants observes dans le backend :

- attribution d'un responsable officiel de classe pedagogique
- creation d'une `ResponsabiliteClassePedagogique` active
- consultation du responsable actif d'une classe et d'une annee
- retrait d'une responsabilite active
- desactivation de la responsabilite et pose d'une date de fin
- consommation de la responsabilite par `shared/security`
- derivation du `titulariat effectif` a partir de la responsabilite, selon la section
- controle d'eligibilite `ENSEIGNANT` avant attribution

### Donnees manipulees

- `ResponsabiliteClassePedagogique`
- `ClassePedagogique`
- `ClasseAcademique`
- `SectionScolaire`
- `AnneeScolaire`
- `Ecole`
- `Organisation`
- `idUtilisateurEnseignant`
- `active`
- `dateDebut`
- `dateFin`
- `sectionCode`
- `sectionLibelle`

### Sources backend

- routes :
  - [structure-scolaire.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/interfaces/http/routes/structure-scolaire.routes.ts)
- agregats :
  - [ResponsabiliteClassePedagogique.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/domain/aggregates/ResponsabiliteClassePedagogique.ts)
- policies de domaine :
  - [PolicyResponsabiliteClassePedagogique.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/domain/policies/PolicyResponsabiliteClassePedagogique.ts)
  - [PolicyEligibiliteResponsableClassePedagogique.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/domain/policies/PolicyEligibiliteResponsableClassePedagogique.ts)
- cas d'utilisation :
  - [AttribuerResponsableClassePedagogique.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/application/use-cases/structure/AttribuerResponsableClassePedagogique.ts)
  - [ConsulterResponsableClassePedagogique.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/application/use-cases/structure/ConsulterResponsableClassePedagogique.ts)
  - [RetirerResponsableClassePedagogique.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/application/use-cases/structure/RetirerResponsableClassePedagogique.ts)
- ports applicatifs :
  - [VerifierEligibiliteResponsableClassePedagogiquePort.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/application/ports/VerifierEligibiliteResponsableClassePedagogiquePort.ts)
- pont vers security :
  - [EligibiliteResponsableClassePedagogiqueAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/EligibiliteResponsableClassePedagogiqueAdapter.ts)
  - [ResponsabiliteClassePedagogiqueAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/ResponsabiliteClassePedagogiqueAdapter.ts)
  - [PolicyTitulariatEffectifParSection.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/security/domain/policies/PolicyTitulariatEffectifParSection.ts)
  - [SecurityCapacitesEffectivesService.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/security/application/services/SecurityCapacitesEffectivesService.ts)
- tests :
  - [responsabilite-classe-pedagogique.test.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/tests/responsabilite-classe-pedagogique.test.ts)
  - [PolicyTitulariatEffectifParSection.test.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/security/tests/domain/PolicyTitulariatEffectifParSection.test.ts)
  - [SecurityCapacitesEffectivesService.test.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/security/tests/application/SecurityCapacitesEffectivesService.test.ts)

### Notes de lecture frontend

- ACA-05 est la charniere officielle entre l'academique et le pedagogique.
- Il ne faut pas le lire comme une simple affectation decorative de responsable.
- La verite metier produite ici est consommee par `shared/security`.
- Cette verite a un effet direct sur :
  - le titulariat effectif
  - les permissions effectives
  - les futurs workflows pedagogiques
- Regle officielle primaire et maternelle :
  - un `ENSEIGNANT` responsable de classe devient `titulaire effectif` si la section est reconnue comme `MATERNELLE` ou `PRIMAIRE`
  - la source du titulariat effectif est alors `RESPONSABILITE_CLASSE`
- Regle officielle secondaire :
  - la responsabilite de classe pedagogique ne suffit pas a elle seule a ouvrir le titulariat effectif
  - `AffectationTitulariat` seule ne suffit pas non plus
  - le titulariat effectif exige la combinaison :
    - `ResponsabiliteClassePedagogique` valide
    - `AffectationTitulariat` active
  - la source du titulariat effectif est alors `AFFECTATION_TITULARIAT`
- Le frontend ne devra jamais recalculer seul ces regles.
- Le frontend devra consommer le resultat effectif deja produit par le backend.
- ACA-05 est le prerequis direct de plusieurs futurs workflows pedagogiques, notamment ceux qui dependent du titulaire effectif.

### Notes de verrouillage

- Les documents de permissions deja figes ne detaille pas encore un sous-decoupage plus fin de `referentiel.write` pour isoler specifiquement la gestion des responsabilites de classe.
- Le workflow est documente ici comme academique parce qu'il vit dans `referentiel-academique`, mais ses effets reels debordent immediatement sur la securite et le pedagogique.

### Statut de figement

`ACA-05 FIGE`

## Workflow ACA-06

### Identifiant

`ACA-06`

### Nom

Gerer le calendrier academique local

### Categorie

`Academique`

### Niveau de criticite

`Important`

### Objectif metier

Permettre a l'ecole de creer, consulter, ajuster, valider et verrouiller son `CalendrierAcademique` local pour une `AnneeScolaire` donnee, afin de disposer d'un cadre temporel fiable pour l'exploitation pedagogique et scolaire.

### Acteur principal

`ADMINISTRATEUR_ECOLE`

### Acteurs secondaires

- `referentiel-academique`
  - comme BC proprietaire du calendrier local
- futurs workflows pedagogiques et scolaires
  - comme consommateurs aval du cadre temporel produit

### Preconditions

- l'ecole cible doit exister
- l'annee scolaire cible doit exister
- l'annee scolaire cible doit appartenir a l'ecole cible
- le contexte actif doit etre coherent avec l'ecole manipulee
- pour la creation :
  - `idEcole` doit etre connu
  - `idAnneeScolaire` doit etre connu
  - `typeStructureEvaluation` doit etre fourni
  - `dateDebutAnnee` et `dateFinAnnee` doivent etre fournies
  - la liste des periodes doit etre fournie
  - `creePar` doit etre fourni
- pour la modification d'une periode :
  - l'identifiant du calendrier doit etre connu
  - la periode cible doit exister dans ce calendrier
  - `modifiePar` doit etre fourni
- pour la validation :
  - l'identifiant du calendrier doit etre connu
  - `validePar` doit etre fourni
- pour le verrouillage :
  - l'identifiant du calendrier doit etre connu
  - `verrouillePar` doit etre fourni

### Permissions effectives requises

Le backend ne porte pas, dans les documents de permissions deja figes, une permission fine distincte du type `calendrier-academique.write`.

Le workflow repose donc sur :

- `referentiel.read`
  - pour consulter un calendrier academique par identifiant
  - pour consulter le calendrier d'une ecole pour une annee
- `referentiel.write`
  - pour creer un calendrier academique
  - pour modifier une periode de calendrier
  - pour valider un calendrier academique
  - pour verrouiller un calendrier academique

### Cas d'utilisation utilises

- `CreerCalendrierAcademique`
- `ConsulterCalendrierParEcoleEtAnnee`
- `ConsulterCalendrierAcademique`
- `ModifierPeriodeCalendrier`
- `ValiderCalendrierAcademique`
- `VerrouillerCalendrierAcademique`

### Deroulement principal

Le deroulement principal retenu pour ACA-06 est celui d'une ecole qui formalise progressivement son calendrier academique local pour une annee scolaire deja connue.

1. L'acteur part d'une `Ecole` et d'une `AnneeScolaire` deja existantes et coherentes.
2. Le backend verifie que l'annee scolaire fournie appartient bien a l'ecole cible.
3. Lors de la creation, le backend construit un `CalendrierAcademique` local avec :
   - ecole
   - annee scolaire
   - type de structure d'evaluation
   - bornes annuelles
   - liste des periodes
4. Le backend verifie qu'il n'existe qu'un seul `CalendrierAcademique` par ecole et par annee scolaire.
5. Le backend verifie la coherence temporelle complete du calendrier :
   - debut annuel strictement avant la fin annuelle
   - periodes incluses dans les bornes annuelles
   - absence de chevauchement
   - ordre strictement croissant
   - unicite des codes de periode
   - unicite des ordres de periode
   - compatibilite entre les periodes et la structure d'evaluation
6. Si la creation est valide, le backend persiste le calendrier local.
7. L'acteur peut ensuite consulter soit :
   - le calendrier par `idCalendrierAcademique`
   - le calendrier d'une ecole pour une annee
8. Tant que le calendrier n'est pas verrouille, l'acteur peut remplacer une periode existante par une version mise a jour.
9. Le backend revalide alors la coherence complete du calendrier apres modification.
10. L'acteur peut demander une validation explicite du calendrier pour verifier qu'il est globalement coherent.
11. Cette validation ne cree pas, dans le backend actuel, un etat metier persistant distinct.
12. L'acteur peut enfin verrouiller le calendrier.
13. Une fois verrouille, le calendrier devient stable et ne peut plus etre modifie librement.

### Variantes

#### Variante 1 - Creation nominale d'un calendrier local

- l'ecole existe
- l'annee scolaire existe
- l'annee appartient a l'ecole
- aucun calendrier n'existe encore pour ce couple ecole/annee
- le backend cree le calendrier

#### Variante 2 - Consultation positive par ecole et annee

- un calendrier existe pour l'ecole et l'annee
- le backend retourne ce calendrier

#### Variante 3 - Consultation sans calendrier

- aucun calendrier n'existe encore pour l'ecole et l'annee
- le backend retourne `null`

#### Variante 4 - Consultation positive par identifiant

- le calendrier existe
- le backend retourne le calendrier correspondant

#### Variante 5 - Modification nominale d'une periode

- le calendrier existe
- la periode cible existe
- le calendrier n'est pas verrouille
- la nouvelle periode preserve la coherence globale
- le backend remplace la periode et persiste le calendrier mis a jour

#### Variante 6 - Validation nominale d'un calendrier

- le calendrier existe
- sa coherence globale est validee
- le backend retourne le calendrier apres controle
- aucun etat persistant `valide` n'est ecrit

#### Variante 7 - Verrouillage nominal d'un calendrier

- le calendrier existe
- sa coherence globale est validee
- le backend verrouille le calendrier

#### Variante 8 - Creation refusee pour unicite violee

- un calendrier existe deja pour la meme ecole et la meme annee scolaire
- le backend refuse la creation

#### Variante 9 - Operation refusee pour incoherence temporelle

- la chronologie annuelle ou celle des periodes est invalide
- ou des periodes se chevauchent
- ou une periode sort des bornes annuelles
- ou un code/ordre est duplique
- ou la structure semestrielle contient des periodes incompatibles
- le backend refuse l'operation

#### Variante 10 - Modification refusee sur calendrier verrouille

- le calendrier est deja verrouille
- le backend refuse la modification

#### Variante 11 - Consultation, validation ou verrouillage refuses faute de calendrier

- le calendrier cible est introuvable
- le backend leve une erreur

### Resultat attendu

En sortie de ce workflow, l'ecole doit disposer d'un cadre temporel officiel, coherent et consultable pour son annee scolaire :

- au plus un `CalendrierAcademique` par ecole et par annee scolaire
- un calendrier scope par :
  - ecole
  - annee scolaire
  - structure d'evaluation
- des periodes ordonnees, non chevauchantes et incluses dans les bornes annuelles
- un calendrier consultable par identifiant ou par couple ecole/annee
- un calendrier modifiable tant qu'il n'est pas verrouille
- un calendrier stabilise apres verrouillage
- aucune notion metier persistante de `periode active` n'est encore stockee comme etat autonome
- en revanche, le backend sait desormais deriver a la demande :
  - la periode courante
  - l'examen courant
  - l'absence de periode courante
- ce cadre verrouille devient consommable par les workflows pedagogiques d'encodage des cotes

### Contraintes backend

- `idEcole` est obligatoire pour creer et consulter par ecole/annee
- `idAnneeScolaire` est obligatoire pour creer et consulter par ecole/annee
- l'identifiant du calendrier est obligatoire pour consulter par identifiant, modifier, valider et verrouiller
- l'ecole cible doit exister
- l'annee scolaire cible doit exister
- l'annee scolaire cible doit appartenir a l'ecole cible
- un seul calendrier academique est autorise par ecole et par annee scolaire
- `dateDebutAnnee` doit etre strictement anterieure a `dateFinAnnee`
- chaque `PeriodeCalendrier` doit avoir :
  - un code non vide
  - un libelle non vide
  - un ordre strictement positif
  - un type valide
  - des dates valides
- les periodes doivent rester dans les bornes de l'annee
- deux periodes ne peuvent pas se chevaucher
- les ordres doivent etre strictement croissants
- les codes de periode doivent etre uniques
- les ordres de periode doivent etre uniques
- une periode de type `PERIODE` doit avoir un code commencant par `P`
- une periode de type `EXAMEN` doit avoir un code commencant par `EX`
- une structure `SEMESTRIEL` ne peut pas contenir `P5`, `P6` ou `EX3`
- une structure `SEMESTRIEL` ne peut pas depasser quatre periodes pedagogiques
- un calendrier verrouille ne peut plus etre modifie librement
- seul un calendrier verrouille est desormais exploitable pour gouverner temporellement l'encodage des cotes
- la validation seule ne verrouille pas le calendrier
- la validation seule n'introduit aucun etat persistant `valide`
- les routes de creation et de consultation par ecole/annee s'executent sous `tenant_requis`

### Evenements importants

Points de transition metier importants observes dans le backend :

- creation d'un `CalendrierAcademique` local
- consultation du calendrier local d'une ecole pour une annee
- consultation d'un calendrier par identifiant
- remplacement d'une periode de calendrier existante
- validation explicite de la coherence globale du calendrier
- verrouillage du calendrier
- stabilisation du cadre temporel local apres verrouillage
- derivation de la periode courante a partir d'une date de reference
- derivation de l'examen courant a partir d'une date de reference
- consommation du calendrier verrouille par les workflows d'encodage des cotes

### Donnees manipulees

- `CalendrierAcademique`
- `PeriodeCalendrier`
- `Ecole`
- `AnneeScolaire`
- `TypeStructureEvaluation`
- `TypePeriodeCalendrier`
- `dateDebutAnnee`
- `dateFinAnnee`
- `code`
- `libelle`
- `ordre`
- `verrouille`
- `version`

### Sources backend

- routes :
  - [calendriers-academiques.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/interfaces/http/routes/calendriers-academiques.routes.ts)
- controleur :
  - [ControleurCalendriersAcademiques.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/interfaces/http/controllers/ControleurCalendriersAcademiques.ts)
- agregats et entites :
  - [CalendrierAcademique.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/domain/aggregates/CalendrierAcademique.ts)
  - [PeriodeCalendrier.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/domain/entities/PeriodeCalendrier.ts)
- policies et moteur :
  - [PolicyCalendrier.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/domain/policies/PolicyCalendrier.ts)
  - [MoteurCalendrierAcademique.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/domain/services/MoteurCalendrierAcademique.ts)
- cas d'utilisation :
  - [CreerCalendrierAcademique.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/application/use-cases/calendriers/CreerCalendrierAcademique.ts)
  - [ConsulterCalendrierParEcoleEtAnnee.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/application/use-cases/calendriers/ConsulterCalendrierParEcoleEtAnnee.ts)
- [ConsulterCalendrierAcademique.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/application/use-cases/calendriers/ConsulterCalendrierAcademique.ts)
- [ModifierPeriodeCalendrier.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/application/use-cases/calendriers/ModifierPeriodeCalendrier.ts)
- [ValiderCalendrierAcademique.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/application/use-cases/calendriers/ValiderCalendrierAcademique.ts)
- [VerrouillerCalendrierAcademique.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/application/use-cases/calendriers/VerrouillerCalendrierAcademique.ts)
- [DeterminerFenetreCalendrier.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/application/use-cases/calendriers/DeterminerFenetreCalendrier.ts)
- services applicatifs :
  - [OrchestrateurCalendrierAcademique.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/application/services/OrchestrateurCalendrierAcademique.ts)
- services domaine :
  - [MoteurFenetreCalendrier.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/domain/services/MoteurFenetreCalendrier.ts)
- consommateurs aval backend :
  - [FenetreEncodageCalendrierAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/FenetreEncodageCalendrierAdapter.ts)
  - [PolicyFenetreEncodageCotes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/domain/policies/PolicyFenetreEncodageCotes.ts)
  - [EncoderCoteUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/application/use-cases/EncoderCote/EncoderCoteUseCase.ts)
  - [ModifierCoteUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/application/use-cases/ModifierCote/ModifierCoteUseCase.ts)
  - [ViderCoteUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/application/use-cases/ViderCote/ViderCoteUseCase.ts)
- tests :
  - [orchestration-annee-scolaire.test.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/tests/orchestration-annee-scolaire.test.ts)
  - [fenetre-calendrier.test.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/tests/fenetre-calendrier.test.ts)

### Notes de lecture frontend

- ACA-06 produit un cadre temporel local, pas une simple liste de periodes decoratives.
- Le calendrier academique local est un prerequis fort pour plusieurs futurs workflows pedagogiques et scolaires.
- La validation est aujourd'hui un controle explicite de coherence, pas un etat metier persistant distinct.
- Le verrouillage est la vraie transition metier : il signale qu'on sort de la phase d'ajustement libre.
- Depuis la fermeture de `DETTE-CAL-01`, le calendrier academique local n'est plus seulement preparatoire :
  - il est maintenant consomme reellement par l'encodage des cotes
  - via une derivation backend de la periode courante et de l'examen courant
- Le frontend ne devra pas inventer des periodes ou assouplir des regles que le backend interdit.
- La structure d'evaluation doit etre lue comme une contrainte de calendrier, pas seulement comme une information d'affichage.
- Le backend sait maintenant deduire automatiquement :
  - la periode courante
  - l'examen courant
  - l'absence de periode courante
- En revanche, il ne porte toujours pas :
  - une notion persistante autonome de `periode active`
  - une fenetre d'encodage etendue apres la periode ou l'examen
  - une logique de date limite post-periode
- La lecture correcte est donc :
  - calendrier verrouille -> exploitable pour l'encodage
  - colonne de periode -> autorisee seulement pendant sa periode courante
  - colonne examen -> autorisee seulement pendant son examen courant
- ACA-06 depend directement de :
  - ACA-03 pour l'annee scolaire
  - l'ecole active du contexte

### Notes de verrouillage

- Les documents de permissions deja figes ne detaille pas encore un sous-decoupage plus fin de `referentiel.write` pour distinguer creation, modification, validation et verrouillage du calendrier.
- Le backend porte maintenant une derivation de la periode courante et de l'examen courant, mais pas encore une politique plus riche de delai post-periode ou de fenetre administrative prolongee.
- Les futurs workflows pedagogiques devront encore preciser s'il faut, a terme, autoriser un encodage apres la fin stricte d'une periode ou d'un examen.

### Statut de figement

`ACA-06 FIGE`

## Workflow ACA-07

### Identifiant

`ACA-07`

### Nom

Gerer le programme-niveau local

### Categorie

`Academique`

### Niveau de criticite

`Important`

### Objectif metier

Permettre a l'ecole d'initialiser, consulter, valider, archiver et lire l'etat local d'un `ProgrammeNiveau` derive d'un `ReferentielProgramme` officiel, afin de disposer d'un programme exploitable localement pour une classe academique, une annee scolaire et une ecole donnees, et de fournir une base academique locale consommable par les workflows pedagogiques aval deja branches ou prepares.

### Acteur principal

`ADMINISTRATEUR_ECOLE`

### Acteurs secondaires

- `referentiel-academique`
  - comme BC proprietaire du programme local
- futurs workflows pedagogiques
  - comme consommateurs aval du programme niveau valide

### Preconditions

- l'ecole cible doit exister
- l'annee scolaire cible doit exister
- l'annee scolaire cible doit appartenir a l'ecole cible
- la classe academique cible doit exister
- le referentiel programme source doit exister
- la version du referentiel programme source doit exister dans ce referentiel
- le referentiel programme doit correspondre a la classe academique cible
- le contexte actif doit etre coherent avec l'ecole manipulee
- pour l'initialisation :
  - `idEcole` doit etre connu
  - `idAnneeScolaire` doit etre connu
  - `idClasseAcademique` doit etre connu
  - `idReferentielProgramme` doit etre connu
  - `idVersionReferentielProgramme` doit etre connu
  - `creePar` doit etre fourni
- pour la validation :
  - l'identifiant du programme niveau doit etre connu
  - `validePar` doit etre fourni
- pour l'archivage :
  - l'identifiant du programme niveau doit etre connu
  - `archivePar` doit etre fourni
- pour la production de l'etat local :
  - l'identifiant du programme niveau doit etre connu
  - le programme doit deja etre valide

### Permissions effectives requises

Le backend ne porte pas, dans les documents de permissions deja figes, une permission fine distincte du type `programme-niveau.write`.

Le workflow repose donc sur :

- `referentiel.read`
  - pour consulter un programme niveau
  - pour lister les programmes niveau d'une ecole pour une annee
  - pour produire l'etat local d'un programme deja valide
- `referentiel.write`
  - pour initialiser un programme niveau
  - pour valider un programme niveau
  - pour archiver un programme niveau

### Cas d'utilisation utilises

- `InitialiserProgrammeNiveau`
- `ConsulterProgrammeNiveau`
- `ListerProgrammesNiveauParEcoleEtAnnee`
- `ValiderProgrammeNiveau`
- `ArchiverProgrammeNiveau`
- `ProduireEtatLocalProgramme`

### Deroulement principal

Le deroulement principal retenu pour ACA-07 est celui d'une ecole qui prepare un programme local a partir d'un referentiel officiel deja connu, puis le rend exploitable apres validation.

1. L'acteur part d'une `Ecole`, d'une `AnneeScolaire`, d'une `ClasseAcademique` et d'un `ReferentielProgramme` officiel deja coherents entre eux.
2. Lors de l'initialisation, le backend verifie :
   - l'existence de l'ecole
   - l'existence de l'annee scolaire
   - le rattachement de l'annee a l'ecole
   - l'existence de la classe academique
   - l'existence du referentiel programme
   - la coherence entre referentiel programme et classe academique
   - l'existence de la version officielle demandee
3. Le backend cree alors un `ProgrammeNiveau` en statut `BROUILLON`.
4. Le `MoteurProgrammeLocal` initialise ses lignes locales a partir de la version officielle du referentiel.
5. Le backend persiste ce programme local et journalise l'operation.
6. L'acteur peut consulter le programme niveau par identifiant ou lister les programmes niveau d'une ecole pour une annee.
7. Tant que le programme est en `BROUILLON`, il n'est pas encore exploitable localement.
8. Lors de la validation, le backend recharge le programme, recharge son referentiel programme, puis verifie qu'aucun autre `ProgrammeNiveau` valide n'existe deja pour le meme triplet :
   - ecole
   - annee scolaire
   - classe academique
9. Le backend verifie ensuite la coherence locale du programme avec la structure du referentiel officiel.
10. Si tout est coherent, le programme passe de `BROUILLON` a `VALIDE`.
11. Une fois valide, l'acteur peut demander la production de l'etat local du programme.
12. Le backend retourne alors une synthese exploitable contenant notamment :
   - le statut
   - les lignes
   - le nombre de lignes actives dans l'ecole
   - le nombre de lignes non calculables
   - le nombre de lignes obsoletes
13. Si le programme ne doit plus etre exploite, l'acteur peut l'archiver.
14. Le backend n'autorise l'archivage que pour un programme deja `VALIDE`.

### Variantes

#### Variante 1 - Initialisation nominale d'un programme local

- l'ecole existe
- l'annee existe et appartient a l'ecole
- la classe academique existe
- le referentiel programme existe et correspond a la classe academique
- la version de referentiel existe
- le backend cree un programme `BROUILLON` et initialise ses lignes

#### Variante 2 - Consultation positive d'un programme niveau

- le programme existe
- le backend retourne le programme niveau

#### Variante 3 - Liste nominale des programmes niveau d'une ecole pour une annee

- l'ecole existe
- l'annee existe et appartient a l'ecole
- le backend retourne la liste paginee

#### Variante 4 - Validation nominale d'un programme brouillon

- le programme existe
- le referentiel programme associe existe
- aucun autre programme valide n'existe deja pour le meme contexte
- la coherence locale est valide
- le backend fait passer le programme en `VALIDE`

#### Variante 5 - Production nominale de l'etat local

- le programme existe
- le programme est deja valide
- le backend retourne l'etat local consolide

#### Variante 6 - Archivage nominal d'un programme valide

- le programme existe
- le programme est `VALIDE`
- le backend le fait passer en `ARCHIVE`

#### Variante 7 - Initialisation refusee pour incoherence amont

- l'ecole, l'annee, la classe academique, le referentiel ou la version sont introuvables
- ou l'annee n'appartient pas a l'ecole
- ou le referentiel ne correspond pas a la classe academique
- le backend refuse l'initialisation

#### Variante 8 - Validation refusee pour collision de programme valide

- un autre programme `VALIDE` existe deja pour la meme ecole, la meme annee et la meme classe academique
- le backend refuse la validation

#### Variante 9 - Production de l'etat local refusee tant que le programme est brouillon

- le programme existe mais reste en `BROUILLON`
- le backend refuse l'exploitation locale

#### Variante 10 - Archivage refuse pour statut invalide

- le programme n'est pas `VALIDE`
- le backend refuse l'archivage

### Resultat attendu

En sortie de ce workflow, l'ecole doit disposer d'une instance locale de programme exploitable de facon cadree :

- un `ProgrammeNiveau` scope par :
  - ecole
  - annee scolaire
  - classe academique
  - referentiel programme
  - version de referentiel
- un cycle de vie explicite :
  - `BROUILLON`
  - `VALIDE`
  - `ARCHIVE`
- un programme non exploitable tant qu'il n'est pas valide
- au plus un programme `VALIDE` par ecole, annee scolaire et classe academique
- un etat local consultable seulement apres validation

### Contraintes backend

- `idEcole` est obligatoire pour initialiser et lister
- `idAnneeScolaire` est obligatoire pour initialiser et lister
- `idClasseAcademique` est obligatoire pour initialiser
- `idReferentielProgramme` est obligatoire pour initialiser
- `idVersionReferentielProgramme` est obligatoire pour initialiser
- l'identifiant du programme niveau est obligatoire pour consulter, valider, archiver et produire l'etat local
- l'ecole cible doit exister
- l'annee scolaire cible doit exister
- l'annee scolaire cible doit appartenir a l'ecole cible
- la classe academique cible doit exister
- le referentiel programme source doit exister
- le referentiel programme doit viser la meme classe academique que le programme local
- la version officielle doit exister dans le referentiel programme cible
- un programme local est cree initialement en statut `BROUILLON`
- seul un programme `BROUILLON` peut etre initialise depuis le referentiel
- seul un programme `BROUILLON` peut etre valide
- un programme ne peut pas etre valide sans lignes
- seul un programme `VALIDE` peut etre archive
- un programme `ARCHIVE` ne peut pas etre migre
- l'etat local ne peut etre produit que pour un programme deja valide
- une seule ligne locale par cours est autorisee dans un meme programme
- au plus un programme `VALIDE` est autorise pour une meme ecole, une meme annee et une meme classe academique
- les routes d'initialisation, de validation, d'archivage et de liste s'executent sous `tenant_requis`

### Evenements importants

Points de transition metier importants observes dans le backend :

- creation d'un `ProgrammeNiveau` local en brouillon
- initialisation des lignes locales depuis une version officielle
- consultation d'un programme niveau
- listage des programmes niveau d'une ecole pour une annee
- validation du programme local
- production de l'etat local d'exploitation
- archivage du programme local

### Donnees manipulees

- `ProgrammeNiveau`
- `ReferentielProgramme`
- `VersionReferentielProgramme`
- `LigneProgrammeNiveau`
- `LigneReferentielProgramme`
- `Ecole`
- `AnneeScolaire`
- `ClasseAcademique`
- `StatutProgrammeNiveau`
- `idReferentielProgramme`
- `idVersionReferentielProgramme`
- `valideLe`
- `validePar`
- `archiveLe`

### Sources backend

- routes :
  - [programmes-niveau.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/interfaces/http/routes/programmes-niveau.routes.ts)
- controleur :
  - [ControleurProgrammesNiveau.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/interfaces/http/controllers/ControleurProgrammesNiveau.ts)
- validateurs :
  - [programme-niveau.validator.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/interfaces/http/validators/programme-niveau.validator.ts)
- agregats et entites :
  - [ProgrammeNiveau.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/domain/aggregates/ProgrammeNiveau.ts)
  - [ReferentielProgramme.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/domain/aggregates/ReferentielProgramme.ts)
  - [VersionReferentielProgramme.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/domain/aggregates/VersionReferentielProgramme.ts)
  - [LigneProgrammeNiveau.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/domain/entities/LigneProgrammeNiveau.ts)
- policies et moteur :
  - [PolicyProgrammeLocal.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/domain/policies/PolicyProgrammeLocal.ts)
  - [MoteurProgrammeLocal.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/domain/services/MoteurProgrammeLocal.ts)
- cas d'utilisation :
  - [InitialiserProgrammeNiveau.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/application/use-cases/programmes/InitialiserProgrammeNiveau.ts)
  - [ConsulterProgrammeNiveau.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/application/use-cases/programmes/ConsulterProgrammeNiveau.ts)
  - [ListerProgrammesNiveauParEcoleEtAnnee.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/application/use-cases/programmes/ListerProgrammesNiveauParEcoleEtAnnee.ts)
  - [ValiderProgrammeNiveau.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/application/use-cases/programmes/ValiderProgrammeNiveau.ts)
  - [ArchiverProgrammeNiveau.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/application/use-cases/programmes/ArchiverProgrammeNiveau.ts)
  - [ProduireEtatLocalProgramme.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/application/use-cases/programmes/ProduireEtatLocalProgramme.ts)
- tests :
  - [VerificationBcReferentielAcademique.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/tests/VerificationBcReferentielAcademique.ts)
  - [execution-http-referentiel-academique.test.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/tests/execution-http-referentiel-academique.test.ts)

### Notes de lecture frontend

- ACA-07 doit etre lu comme un workflow de cycle de vie du programme local, pas comme un editeur complet de lignes locales.
- Le backend actuel expose :
  - initialisation
  - consultation
  - liste
  - validation
  - archivage
  - production de l'etat local
- Le backend n'expose pas encore, dans les routes actuelles, de cas d'usage direct d'ajustement fin des lignes locales.
- Le statut `BROUILLON` signifie que le programme existe, mais n'est pas encore exploitable localement.
- Le statut `VALIDE` est le veritable point d'entree des futurs workflows consommateurs.
- L'etat local est une projection metier utile pour les workflows pedagogiques, mais elle n'est pas editable en direct ici.
- Le consommateur reel actuellement identifie est le BC `Bulletins & Evaluations`, via [GenererBulletinEleveUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/application/use-cases/GenererBulletinEleve/GenererBulletinEleveUseCase.ts).
- Cette consommation est reelle au niveau applicatif :
  - le use case appelle `consulterProgrammeNiveau(...)`
  - puis `listerCoursProgramme(...)`
- L'integration infrastructure est maintenant branchee reellement :
  - [ReferentielAcademiqueAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/infrastructure/adapters/ReferentielAcademiqueAdapter.ts) relit effectivement le `ProgrammeNiveau` local et les cours du programme.
- Les workflows `Cotation`, `Proclamations` et `Statistiques` doivent etre lus, a ce stade, comme des consommateurs prepares ou prevus seulement, pas comme des consommateurs reellement branches a `ProgrammeNiveau`.

### Dependances aval eventuelles

- Consommateur reel actuellement identifie :
  - BC `Bulletins & Evaluations`
  - [GenererBulletinEleveUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/application/use-cases/GenererBulletinEleve/GenererBulletinEleveUseCase.ts)
  - consommation reelle de `ProgrammeNiveau` au niveau applicatif
  - integration infrastructure reellement branchee via [ReferentielAcademiqueAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/infrastructure/adapters/ReferentielAcademiqueAdapter.ts)
- Consommateurs prepares ou prevus seulement :
  - `Cotation`
  - `Proclamations`
  - `Statistiques`
- En consequence, ACA-07 ne doit pas etre lu comme une dependance pedagogique uniforme deja finalisee.
- Il doit etre lu comme :
  - une base locale academique pleinement geree dans le BC `referentiel-academique`
  - deja consommee reellement par `Bulletins & Evaluations`
  - avec une integration infrastructure maintenant effective pour la generation de bulletin
  - et seulement preparee pour d'autres workflows pedagogiques aval

### Notes de verrouillage

- Le moteur de domaine sait adapter localement des lignes, mais cette capacite n'est pas exposee aujourd'hui comme cas d'usage HTTP distinct du workflow ACA-07.
- Les documents de permissions deja figes ne detaille pas encore un sous-decoupage plus fin de `referentiel.write` pour isoler initialisation, validation et archivage.
- Le backend porte un vrai etat local synthese, mais les futurs workflows pedagogiques devront encore preciser comment ils consomment les lignes non calculables ou obsoletes.

### Statut de figement

`ACA-07 FIGE`
