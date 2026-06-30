# Phase 7 - Workflows Pedagogiques

## Statut

Ce document ouvre la documentation detaillee des workflows pedagogiques reels d'EduSync.

Il s'appuie sur :

- [00-doctrine-frontend.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/00-doctrine-frontend.md)
- [01-acteurs.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/01-acteurs.md)
- [02-permissions-effectives.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/02-permissions-effectives.md)
- [03-cas-utilisation.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/03-cas-utilisation.md)
- [04-workflows.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/04-workflows.md)
- [05-workflows-reels.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/05-workflows-reels.md)
- [06-workflows-academiques.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/06-workflows-academiques.md)

Le backend reste la source officielle de verite.

## Lecture Transverse De Securite

Pour tous les workflows pedagogiques, la lecture correcte des permissions est maintenant :

- permission + perimetre metier

Et non :

- permission seule

Le backend partage `shared/security` sait maintenant porter :

- organisation
- ecole
- section

quand le workflow consommateur fournit effectivement ce perimetre.

Consequence importante :

- un acteur sectionnel comme `PREFET_ETUDES`, `DIRECTEUR_ETUDES`, `DIRECTEUR_DISCIPLINE`, `DIRECTEUR_PRIMAIRE` ou `DIRECTEUR_MATERNELLE` ne doit pas etre lu comme un acteur automatiquement autorise sur toute l'ecole
- un workflow qui ne fournit qu'un perimetre ecole ne peut pas pretendre verifier une restriction sectionnelle plus fine
- dans `PED-05`, la consultation statistique de classe applique maintenant cette restriction sectionnelle quand la classe permet de resoudre sa section
- la consultation statistique globale d'ecole reste, elle, reservee aux acteurs de perimetre reellement global

Consequence technique frontend maintenant figee :

- le BC pedagogique n'accepte plus de contexte de secours implicite pour compenser des headers absents
- quand un workflow attend l'identite utilisateur et le tenant courant, ces informations doivent etre transportees explicitement
- en pratique, les integrations frontend doivent fournir correctement les headers de contexte requis au lieu de supposer qu'un fallback backend completera la requete
- la lecture simple d'un bulletin et de son historique reapplique maintenant elle aussi un verrou local `permission + perimetre reel`

## Workflow PED-01

### Identifiant

`PED-01`

### Nom

Generer le bulletin

### Categorie

`Pedagogique`

### Niveau de criticite

`Critique`

### Objectif metier

Permettre la production d'un bulletin eleve a partir :

- d'un `BulletinEleve` actif deja existant
- d'un `ResultatBulletinEleve` consolide
- d'un `ProgrammeNiveau` local lisible et coherent avec la meme ecole
- du referentiel de cours du programme

afin de regenerer la structure academique du bulletin, d'y rattacher les blocs application/conduite, de versionner l'historique de generation, de publier les evenements associes, de projeter une sortie lisible par le frontend et, si demande, de preparer un export PDF.

### Acteur principal

`TITULAIRE` effectif

Lecture officielle de l'acteur :

- en `MATERNELLE` et en `PRIMAIRE`
  - `ENSEIGNANT responsable de classe`
  - = `TITULAIRE` effectif
- en `SECONDAIRE`
  - `ResponsabiliteClassePedagogique`
  - + `AffectationTitulariat` active
  - = `TITULAIRE` effectif

### Acteurs secondaires

Aucun acteur secondaire humain n'est explicitement atteste comme generateur du bulletin dans les preuves backend retenues pour PED-01.

En revanche, plusieurs acteurs sont attestes comme lecteurs aval des bulletins :

- `ENSEIGNANT`
  - lecture de ses bulletins
- `PREFET_ETUDES`
  - lecture des bulletins
- `DIRECTEUR_ETUDES`
  - lecture des bulletins
- `PARENT`
  - lecture de bulletins dans le cadre parent, sous contraintes propres
  - seulement pour les enfants effectivement rattaches au parent courant

### Preconditions

- un `BulletinEleve` actif doit deja exister pour :
  - `idEleve`
  - `idInscriptionScolaire`
  - `idAnneeScolaire`
- un `ResultatBulletinEleve` consolide doit deja exister pour :
  - `idEleve`
  - `idInscriptionScolaire`
- le `BulletinEleve` et le `ResultatBulletinEleve` doivent referencer :
  - le meme `idProgrammeNiveau`
  - la meme `versionReferentielProgramme`
- le `ProgrammeNiveau` demande doit etre lisible dans le bon scope `idEcole`
- le `ProgrammeNiveau` rattache au bulletin doit etre en statut `VALIDE`
- les cours references par les lignes du programme doivent exister dans le `Referentiel Academique`
- l'identite de l'acteur doit etre disponible pour la tracabilite :
  - `idUtilisateur`
- la demande doit fournir :
  - `idEleve`
  - `idInscriptionScolaire`
  - `idAnneeScolaire`
  - `typeGeneration`
- si l'on souhaite preparer un PDF dans le meme flux :
  - `preparerPdf = true`

### Permissions effectives requises

Lecture officielle frontend et securite partagee :

- permission effective `bulletins.generate`
- scope valide :
  - organisation
  - ecole
  - classe
  - annee scolaire
- titulariat effectif requis

Ce point est fortement atteste par la couche securite partagee et les tests globaux :

- `MATERNELLE` / `PRIMAIRE`
  - `ResponsabiliteClassePedagogique` valide -> `titulariat effectif`
- `SECONDAIRE`
  - `ResponsabiliteClassePedagogique` seule insuffisante
  - `AffectationTitulariat` seule insuffisante
  - combinaison des deux requise

Point de lecture important :

- cette exigence est attestee dans la couche securite globale et les tests de workflows proteges
- elle est desormais revalidee localement a l'interieur du `GenererBulletinEleveUseCase`
- la route HTTP documentaire `/bulletins/generer` reste legere, mais la generation ne peut plus reussir sans verification locale de `bulletins.generate` dans le bon scope et avec titulariat effectif

### Cas d'utilisation utilises

- `GenererBulletinEleve`

Cas d'utilisation techniques et lectures adjacentes mobilisees dans le meme parcours ou ses variantes :

- `ConsulterBulletinEleve`
  - pour la variante de telechargement PDF a partir d'une lecture existante

### Deroulement principal

Le deroulement principal retenu pour PED-01 est celui d'un titulaire effectif qui regenere le bulletin d'un eleve deja connu dans une annee scolaire donnee.

1. Le backend recoit une demande de generation de bulletin avec :
   - `idEleve`
   - `idInscriptionScolaire`
   - `idAnneeScolaire`
   - `typeGeneration`
   - `idUtilisateur`
   - `preparerPdf` eventuel
2. Le use case charge le `BulletinEleve` actif pour le triplet :
   - eleve
   - inscription scolaire
   - annee scolaire
3. Si aucun bulletin actif n'est retrouve, le backend echoue.
4. Le use case revalide localement que l'utilisateur demandeur peut generer le bulletin dans le bon scope :
   - permission `bulletins.generate`
   - ecole du bulletin
   - classe pedagogique du bulletin
   - annee scolaire du bulletin
   - titulariat effectif
5. Le use case charge le `ResultatBulletinEleve` consolide pour :
   - eleve
   - inscription scolaire
6. Si aucun resultat consolide n'est retrouve, le backend echoue.
7. Le backend verifie ensuite que le bulletin et le resultat consolides pointent vers :
   - la meme inscription scolaire
   - la meme ecole
   - la meme classe pedagogique
   - la meme annee scolaire
   - le meme `idProgrammeNiveau`
   - la meme `versionReferentielProgramme`
8. A partir du bulletin, le backend interroge le BC `referentiel-academique` pour lire le `ProgrammeNiveau` local dans la bonne ecole.
9. Si le programme niveau est introuvable, la generation est refusee.
10. Si le programme niveau existe mais n'est pas `VALIDE`, la generation est refusee.
11. Le backend verifie aussi que le programme niveau relu reference la meme version de referentiel que le bulletin actif.
12. Le backend relit ensuite les cours du programme dans l'ordre officiel du programme local.
13. Si aucun cours exploitable n'est retrouve, la generation est refusee.
14. Pour chaque cours du programme, le backend reconstruit une `LigneBulletinEleve`.
15. A partir du resultat consolide, le backend reconstruit les `BlocApplicationConduite` par periode.
16. Le `ServiceGenerationBulletin` demande au moteur de generer ou mettre a jour le `BulletinEleve`.
17. Le domaine :
    - remplace les lignes du bulletin
    - remplace les blocs application/conduite
    - met a jour la date de generation
    - met a jour l'acteur generateur
    - met le bulletin a l'etat `GENERE`
    - incremente la version technique
    - ajoute une entree d'historique
    - emet un evenement `BulletinGenere` ou `BulletinMisAJour`
18. Le bulletin est sauvegarde.
19. Les evenements du domaine sont publies si un `EventBusPort` est disponible.
20. Le bulletin est projete en `BulletinEleveOutput`.
21. La projection est placee en cache sous une cle derivee de l'eleve et de l'annee.
22. Si `preparerPdf = true`, le backend demande aussi la generation d'un PDF.
23. L'action est journalisee dans l'audit technique du BC.
24. Les evenements du bulletin sont ensuite purges de l'agregat en memoire.
25. Le use case retourne la projection du bulletin genere.

### Variantes

#### Variante 1 - Premiere generation du bulletin

- le bulletin existe mais ne porte encore aucune ligne
- la generation cree la premiere version exploitable
- le domaine emet `BulletinGenere`

#### Variante 2 - Regeneration d'un bulletin deja existant

- le bulletin existe deja avec des lignes
- la generation remplace la structure precedente
- le domaine emet `BulletinMisAJour`

#### Variante 3 - Generation avec preparation PDF immediate

- `preparerPdf = true`
- le use case genere d'abord le bulletin
- puis appelle le port PDF sur la projection de sortie
- le PDF est prepare dans le meme flux applicatif

#### Variante 4 - Telechargement PDF a partir d'une lecture existante

- ce parcours ne passe pas par `GenererBulletinEleve`
- le controleur relit d'abord le bulletin via `ConsulterBulletinEleve`
- puis appelle `BulletinPdfPort`
- cette variante est connexe a PED-01, mais distincte de la generation metier elle-meme

#### Variante 5 - Bulletin introuvable

- aucun `BulletinEleve` actif n'est retrouve pour l'eleve, l'inscription et l'annee
- le backend refuse la generation

#### Variante 6 - Resultat consolide introuvable

- aucun `ResultatBulletinEleve` consolide n'est retrouve pour l'eleve et l'inscription
- le backend refuse la generation

#### Variante 7 - Incoherence bulletin / resultat sur le programme

- le bulletin et le resultat ne referencent pas le meme `idProgrammeNiveau`
- le backend refuse la generation

#### Variante 8 - Incoherence bulletin / resultat sur la version de referentiel

- le bulletin et le resultat ne referencent pas la meme `versionReferentielProgramme`
- le backend refuse la generation

#### Variante 9 - Programme niveau introuvable dans le bon scope

- la lecture referentiel ne retrouve pas le `ProgrammeNiveau` demande dans l'ecole cible
- le backend refuse la generation

#### Variante 10 - Programme niveau non valide

- le programme niveau existe, mais reste `BROUILLON` ou est deja `ARCHIVE`
- le backend refuse la generation

#### Variante 11 - Cours reference introuvable

- une ligne du programme pointe vers un cours du referentiel introuvable
- l'adapter referentiel echoue explicitement

#### Variante 12 - Programme sans cours exploitables

- le programme niveau est retrouve mais aucun cours exploitable n'est disponible
- le backend refuse la generation

### Resultat attendu

En sortie de PED-01, le backend doit produire :

- un `BulletinEleve` mis a jour ou genere
- un etat `GENERE`
- une entree d'historique de generation
- une projection `BulletinEleveOutput`
- un cache de lecture mis a jour
- un audit technique de l'action
- des evenements de domaine publies si le bus est present

Resultat reellement observe dans le backend actuel :

- la structure des lignes de cours est regeneree depuis le `ProgrammeNiveau`
- les blocs application/conduite sont bien projetes
- l'historique de generation est bien alimente
- le PDF peut etre prepare
- le `ProgrammeNiveau` est reellement consomme via un adapter branche au BC `referentiel-academique`

Limite importante du backend actuel :

- les `LigneBulletinEleve` regenerees ne sont pas encore enrichies avec les cotes, totaux et styles detaillees a partir des resultats consolides
- le bulletin genere contient donc aujourd'hui une structure de lignes et des blocs application/conduite, mais pas encore une alimentation complete de toutes les colonnes visibles d'un bulletin final riche

### Contraintes backend

- le `BulletinEleve` actif est recherche par :
  - `idEleve`
  - `idInscriptionScolaire`
  - `idAnneeScolaire`
- le `ResultatBulletinEleve` consolide est recherche par :
  - `idEleve`
  - `idInscriptionScolaire`
- le use case impose explicitement :
  - egalite de `idProgrammeNiveau`
  - egalite de `versionReferentielProgramme`
- la lecture du `ProgrammeNiveau` local depend du bon `idEcole`
- le `ProgrammeNiveau` relu doit etre `VALIDE`
- le `ProgrammeNiveau` relu doit porter la meme `versionReferentielProgramme` que le bulletin actif
- la lecture des cours depend de la coherence des lignes du programme local
- aucun cours exploitable => generation refusee
- le use case passe obligatoirement par une transaction applicative
- le bulletin ne peut pas etre modifie s'il est `FINALISE`
- le workflow ne depend pas aujourd'hui :
  - d'une periode active calculee automatiquement
  - d'un examen courant derive de la date
  - d'une fenetre d'encodage automatique
- le workflow ne declenche aucune verification directe du BC `scolarite-eleves` pendant la generation
- le BC bulletins revalide desormais lui-meme l'autorisation locale de generation dans le use case
- le controle de coherence revalide explicitement :
  - inscription scolaire
  - ecole
  - classe pedagogique
  - annee scolaire
  - programme niveau
  - version de referentiel programme

### Evenements importants

- `BulletinGenere`
- `BulletinMisAJour`
- ajout d'une entree `HistoriqueGenerationBulletin`
- ecriture d'une entree d'audit avec action `GENERER_BULLETIN`
- mise en cache de la projection du bulletin
- preparation optionnelle d'un `BulletinPdfGenere`

### Donnees manipulees

- `BulletinEleve`
- `ResultatBulletinEleve`
- `ProgrammeNiveau`
- `ReferentielProgramme`
- `ReferentielCours`
- `LigneBulletinEleve`
- `BlocApplicationConduite`
- `HistoriqueGenerationBulletin`
- `BulletinEleveOutput`
- `BulletinEleveReadModel`
- `BulletinPdfGenere`
- `idEleve`
- `idInscriptionScolaire`
- `idClassePedagogique`
- `idAnneeScolaire`
- `idProgrammeNiveau`
- `versionReferentielProgramme`
- `typeGeneration`
- `preparerPdf`

### Dependances aval eventuelles

- consommateur frontend principal :
  - lecture du `BulletinEleveOutput`
  - consultation du `BulletinEleveReadModel`
  - telechargement eventuel d'un `BulletinPdfGenere`
- dependance academique amont reelle :
  - BC `referentiel-academique`
  - `ProgrammeNiveau`
  - `ReferentielCours`
- dependance pedagogique amont reelle :
  - `ResultatBulletinEleve` consolide
- dependance securite reelle mais externe au BC :
  - `shared/security`
  - permission `bulletins.generate`
  - titulariat effectif
- dependance scolarite eleves indirecte :
  - `idInscriptionScolaire` est consomme comme cle de selection
  - aucune verification live du BC `scolarite-eleves` n'est faite pendant la generation

### Sources backend

- cas d'utilisation :
  - [GenererBulletinEleveUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/application/use-cases/GenererBulletinEleve/GenererBulletinEleveUseCase.ts)
  - [ConsulterBulletinEleveUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/application/use-cases/ConsulterBulletinEleve/ConsulterBulletinEleveUseCase.ts)
- services applicatifs :
  - [ServiceGenerationBulletin.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/application/services/ServiceGenerationBulletin.ts)
  - [ServiceProjectionLecture.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/application/services/ServiceProjectionLecture.ts)
  - [ServiceCacheBulletin.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/application/services/ServiceCacheBulletin.ts)
  - [ServiceAuditBulletin.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/application/services/ServiceAuditBulletin.ts)
- agregats et entites :
  - [BulletinEleve.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/domain/aggregates/BulletinEleve.ts)
  - [ResultatBulletinEleve.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/domain/aggregates/ResultatBulletinEleve.ts)
  - [LigneBulletinEleve.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/domain/entities/LigneBulletinEleve.ts)
  - [BlocApplicationConduite.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/domain/entities/BlocApplicationConduite.ts)
  - [HistoriqueGenerationBulletin.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/domain/entities/HistoriqueGenerationBulletin.ts)
- moteurs et evenements :
  - [MoteurGenerationBulletin.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/domain/services/MoteurGenerationBulletin.ts)
  - [BulletinGenere.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/domain/events/BulletinGenere.ts)
  - [BulletinMisAJour.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/domain/events/BulletinMisAJour.ts)
- interfaces HTTP :
  - [bulletins.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/interfaces/http/routes/bulletins.routes.ts)
  - [BulletinsController.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/interfaces/http/controllers/BulletinsController.ts)
  - [GenererBulletinValidator.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/interfaces/http/validators/GenererBulletinValidator.ts)
- projections et queries :
  - [BulletinMapper.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/application/mappers/BulletinMapper.ts)
  - [BulletinEleveOutput.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/application/dto/output/BulletinEleveOutput.ts)
  - [BulletinEleveReadModel.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/application/read-models/BulletinEleveReadModel.ts)
  - [PostgresBulletinEleveQuery.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/infrastructure/persistence/postgres/queries/PostgresBulletinEleveQuery.ts)
  - [BulletinPostgresMapper.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/infrastructure/persistence/postgres/mappers/BulletinPostgresMapper.ts)
- referentiel academique :
  - [ReferentielAcademiquePort.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/application/ports/out/ReferentielAcademiquePort.ts)
  - [ReferentielAcademiqueAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/infrastructure/adapters/ReferentielAcademiqueAdapter.ts)
  - [StatutProgrammeNiveau.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/domain/value-objects/StatutProgrammeNiveau.ts)
  - [ConsulterProgrammeNiveau.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/application/use-cases/programmes/ConsulterProgrammeNiveau.ts)
  - [ProgrammeNiveau.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/domain/aggregates/ProgrammeNiveau.ts)
- autorisation locale :
  - [AutorisationGenerationBulletinPort.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/application/ports/out/AutorisationGenerationBulletinPort.ts)
  - [AutorisationGenerationBulletinAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationGenerationBulletinAdapter.ts)
- preuves de securite :
  - [security-generation-pedagogique.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-generation-pedagogique.integration.spec.ts)
  - [security-bulletins.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-bulletins.integration.spec.ts)
  - [security-lecture-bulletins.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-lecture-bulletins.integration.spec.ts)
- PDF :
  - [BulletinPdfPort.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/application/ports/out/BulletinPdfPort.ts)
  - [BulletinPdfAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/infrastructure/adapters/BulletinPdfAdapter.ts)
  - [PdfBulletinService.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/infrastructure/services/PdfBulletinService.ts)
- securite partagee :
  - [SecurityCapacitesEffectivesService.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/security/application/services/SecurityCapacitesEffectivesService.ts)
  - [SecurityFacade.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/security/application/services/SecurityFacade.ts)
  - [security-bulletins.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-bulletins.integration.spec.ts)
  - [titulaire-workflow.e2e.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/e2e/titulaire-workflow.e2e.spec.ts)
  - [enseignant-workflow.e2e.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/e2e/enseignant-workflow.e2e.spec.ts)
  - [prefet-workflow.e2e.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/e2e/prefet-workflow.e2e.spec.ts)
  - [directeur-etudes-workflow.e2e.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/e2e/directeur-etudes-workflow.e2e.spec.ts)

### Notes de lecture frontend

- PED-01 doit etre lu comme un workflow de generation a partir de donnees deja consolidees, pas comme un workflow de calcul primaire des cotes.
- Le consommateur academique amont reel est `ACA-07` :
  - `ProgrammeNiveau` est deja consomme reellement dans le backend au niveau applicatif.
- Le workflow ne depend pas d'une periode active automatique.
- L'absence de `periode active` n'est donc pas bloquante pour PED-01.
- Le workflow ne doit pas etre lu comme une lecture simple :
  - il modifie l'etat du `BulletinEleve`
  - il historise
  - il emet des evenements
  - il met en cache
  - il peut preparer un PDF

Lecture officielle des droits de generation :

- `TITULAIRE` effectif : oui, acteur officiellement atteste
- `ENSEIGNANT` simple : non atteste comme generateur
- `PREFET_ETUDES` : non, seulement lecteur
- `DIRECTEUR_ETUDES` : non, seulement lecteur
- `DIRECTEUR_DISCIPLINE` : non atteste
- `ADMINISTRATEUR_ECOLE` : permission large presente dans les fixtures de test, mais non atteste comme generateur officiel de PED-01 et non retenu dans la doctrine workflow
- `ADMINISTRATEUR_ECOLE` n'est pas prouve ici comme generateur reel car les preuves globales de securite exigent aussi un titulariat effectif sur la classe cible

Nuance backend importante :

- dans la couche securite partagee et les tests globaux proteges, la generation exige bien :
  - `bulletins.generate`
  - scope valide
  - titulariat effectif
- le BC `bulletins-evaluations` revalide maintenant cette autorisation localement dans `GenererBulletinEleveUseCase`
- la route `/bulletins/generer` reste simple, mais la generation n'est plus possible sans ce second verrou metier local

Projections reelles exposees au frontend :

- generation :
  - `BulletinEleveOutput`
  - via `ServiceProjectionLecture` puis `BulletinMapper`
- consultation :
  - `BulletinEleveReadModel`
  - via `PostgresBulletinEleveQuery` puis `BulletinPostgresMapper`
- presentation HTTP :
  - `BulletinPresenter`
  - enveloppe la sortie dans `{ donnee: ... }`

Etat d'implementation reel de PED-01 :

- Reellement implemente :
  - chargement du bulletin actif
  - verification locale de `bulletins.generate` dans le bon scope
  - chargement du resultat consolide
  - verification de coherence bulletin/resultat sur :
    - inscription scolaire
    - ecole
    - classe pedagogique
    - annee scolaire
    - programme
    - version
  - lecture reelle du programme-niveau et des cours
  - refus explicite si le programme niveau est introuvable
  - refus explicite si le programme niveau n'est pas `VALIDE`
  - refus explicite si aucun cours exploitable n'est disponible
  - regeneration des lignes de structure
  - regeneration des blocs application/conduite
  - sauvegarde
  - historique de generation
  - publication d'evenements
  - projection de sortie
  - cache
  - audit
  - preparation optionnelle d'un PDF

- Partiellement implemente :
  - PDF reel, mais contenu minimal et non bulletin riche complet
  - projection frontend exploitable, mais sans alimentation complete des cotes et totaux par ligne

- Prepare seulement pour plus tard :
  - articulation avec une periode active ou une fenetre d'encodage automatique
  - enrichissement complet des lignes de bulletin avec toutes les valeurs pedagogiques detaillees
  - generation PDF plus complete et plus riche visuellement

### Notes de verrouillage

- Le workflow genere aujourd'hui une structure de bulletin exploitable, mais pas encore une alimentation complete des colonnes de notes sur chaque ligne.
- Le PDF est bien reel techniquement, mais sa richesse documentaire actuelle reste tres limitee.

### Statut de figement

`PED-01 FIGE`

## Workflow PED-02

### Identifiant

`PED-02`

### Nom

Encoder les cotes

### Categorie

`Pedagogique`

### Niveau de criticite

`Critique`

### Objectif metier

Permettre a l'enseignant concerne d'encoder, de modifier ou de vider une cote sur une `FicheCotationEleveCours` deja existante, dans une colonne autorisee et pendant une fenetre temporelle d'encodage valide, afin de mettre a jour les cotes du cours, recalculer les totaux derives, historiser la modification et projeter un etat de fiche exploitable par le frontend.

Lecture officielle de perimetre :

- `PED-02` repose uniquement sur :
  - encodage
  - modification
  - vidage
  - sur fiche existante
- aucune preuve backend supplementaire n'autorise aujourd'hui a etendre `PED-02` a :
  - creation de fiche
  - validation de fiche
  - cloture de fiche
  - reouverture de fiche

### Acteur principal

`ENSEIGNANT`

### Acteurs secondaires

- `TITULAIRE`
  - n'ouvre pas un droit distinct d'encodage
  - encode via ses capacites effectives d'`ENSEIGNANT`
- `PREFET_ETUDES`
  - acteur de controle et de lecture, pas acteur d'encodage atteste
- `DIRECTEUR_ETUDES`
  - acteur de controle et de lecture, pas acteur d'encodage atteste

Acteur explicitement non retenu pour PED-02 en l'etat des preuves backend :

- `ADMINISTRATEUR_ECOLE`
  - permission large visible dans les fixtures de securite globale
  - mais absence de preuve backend explicite suffisante pour le retenir comme acteur metier d'encodage des cotes

### Preconditions

- une `FicheCotationEleveCours` doit deja exister
- la fiche ne doit pas etre introuvable
- la version attendue fournie par le client doit correspondre a la version courante de la fiche
- l'identite de l'acteur doit etre disponible pour la tracabilite :
  - `idUtilisateur`
- la colonne demandee doit exister dans la fiche
- la colonne demandee ne doit pas etre une colonne de total calcule manuel
- si la colonne demandee est une colonne d'examen :
  - le cours doit porter `aExamen = true`
- un `CalendrierAcademique` local doit exister pour :
  - la meme ecole
  - la meme annee scolaire
- le calendrier local doit etre `verrouille`
- la date courante doit tomber dans la bonne fenetre d'encodage :
  - meme periode courante pour une colonne `P1` a `P6`
  - meme examen courant pour une colonne `EX1` a `EX3`

### Permissions effectives requises

Protection officiellement attestee par la couche securite partagee :

- permission effective `cotes.write`
- scope valide :
  - organisation
  - ecole
- absence de restriction bloquante sur les cotes

Lecture doctrinale importante :

- le backend audite prouve positivement l'encodage par `ENSEIGNANT`
- `TITULAIRE` encode via les memes capacites effectives d'`ENSEIGNANT`
- `PED-02` ne depend pas du titulariat effectif

Point d'architecture important :

- la protection d'autorisation est aujourd'hui attestee surtout dans la couche securite globale et les tests proteges
- le BC `bulletins-evaluations` n'ajoute pas de revalidation locale explicite de `cotes.write` dans les use cases d'encodage
- en revanche, le BC revalide localement les contraintes metier :
  - fiche existante
  - version
  - fenetre temporelle
  - colonne autorisee
  - examen autorise

### Cas d'utilisation utilises

- `EncoderCote`
- `ModifierCote`
- `ViderCote`

Cas d'utilisation adjacents ou techniques mobilises autour du meme espace de travail :

- `ConsulterFicheCotation`
  - pour relire une fiche a l'identifiant
- `CorrigerCote`
  - wrapper technique qui choisit entre modification et vidage
  - non expose comme workflow metier principal distinct dans l'etat actuel

### Deroulement principal

Le deroulement principal retenu pour PED-02 est celui d'un enseignant qui encode une cote sur une fiche deja existante.

1. Le backend recoit une demande d'encodage avec :
   - `idFicheCotationEleveCours`
   - `codeColonne`
   - `cote`
   - `versionAttendue`
   - `idUtilisateur`
2. Le use case charge la `FicheCotationEleveCours` par identifiant.
3. Si la fiche est introuvable, le backend refuse l'operation.
4. Le backend verifie que `versionAttendue` correspond a la version courante de la fiche.
5. Si un port calendrier est branche, le backend determine la fenetre temporelle applicable a partir :
   - de l'ecole de la fiche
   - de l'annee scolaire de la fiche
   - de la colonne demandee
   - de la date courante
6. Le backend refuse l'encodage si :
   - aucun calendrier n'est trouve
   - le calendrier n'est pas verrouille
   - la colonne de periode ne correspond pas a la periode courante
   - la colonne d'examen ne correspond pas a l'examen courant
7. Le moteur d'encodage delegue ensuite l'action a la fiche.
8. La fiche verifie que la colonne demandee existe bien dans sa structure.
9. La fiche refuse toute saisie manuelle sur une colonne de total.
10. Si la colonne est de type examen, la fiche verifie que le cours autorise un examen.
11. La fiche enregistre la nouvelle cote, incremente sa version, historise la modification et marque la date/auteur de modification.
12. Le moteur recalcule ensuite les colonnes total derivees de la structure d'evaluation.
13. Les evenements de domaine sont publies si un `EventBusPort` est disponible.
14. La fiche mise a jour est sauvegardee.
15. Le backend projette la fiche en `FicheCotationOutput`.
16. L'action est journalisee dans l'audit technique du BC avec l'action `ENCODER_COTE`.
17. Les evenements de domaine sont ensuite purges de l'agregat en memoire.
18. Le use case retourne la projection de la fiche mise a jour.

### Variantes

#### Variante 1 - Modification d'une cote existante

- le workflow passe par `ModifierCoteUseCase`
- la cote cible existe deja
- les memes controles de version, de fenetre temporelle et de colonne autorisee s'appliquent
- l'action d'audit devient `MODIFIER_COTE`

#### Variante 2 - Vidage d'une cote existante

- le workflow passe par `ViderCoteUseCase`
- la valeur de la colonne devient `null`
- les memes controles de version, de fenetre temporelle et de colonne autorisee s'appliquent
- l'action d'audit devient `VIDER_COTE`

#### Variante 3 - Correction simple

- le backend porte un `CorrigerCoteUseCase`
- si la nouvelle valeur vaut `null`, il delegue a `ViderCote`
- sinon il delegue a `ModifierCote`
- cette variante existe techniquement, mais n'ouvre pas un workflow metier distinct de PED-02

#### Variante 4 - Fiche introuvable

- aucune fiche n'est retrouvee par identifiant
- le backend refuse l'operation

#### Variante 5 - Conflit de version

- `versionAttendue` ne correspond plus a la version courante
- le backend refuse l'operation
- l'agregat emet un evenement `ConflitEncodageCoteDetecte`

#### Variante 6 - Calendrier absent

- aucun calendrier academique local n'est disponible pour l'ecole et l'annee de la fiche
- le backend refuse l'encodage

#### Variante 7 - Calendrier non verrouille

- le calendrier existe mais n'est pas verrouille
- le backend refuse l'encodage

#### Variante 8 - Fenetre temporelle fermee

- la colonne demandee ne correspond pas a la periode courante
- ou la colonne examen ne correspond pas a l'examen courant
- le backend refuse l'encodage

#### Variante 9 - Colonne absente ou interdite

- la colonne n'existe pas dans la fiche
- ou il s'agit d'une colonne de total calcule
- le backend refuse l'operation

#### Variante 10 - Examen interdit

- la colonne visee est une colonne examen
- mais le cours ne porte pas `aExamen = true`
- le backend refuse l'operation

#### Variante 11 - Colonne proclamee

- l'agregat porte bien une logique de verrouillage des colonnes proclamees
- et des variantes controlees `modifierCoteControlee` / `viderCoteControlee`
- mais les use cases courants de PED-02 appellent seulement les variantes simples
- l'ouverture d'un workflow pedagogique de correction controlee reste donc hors perimetre de PED-02 a ce stade

### Resultat attendu

En sortie de PED-02, le backend doit produire :

- une `FicheCotationOutput` mise a jour
- une nouvelle version technique de la fiche
- un recalcul des colonnes total derivees
- une trace d'historique de modification
- des evenements de domaine si un bus est branche
- une trace d'audit technique

Resultat reellement observe dans le backend actuel :

- la cote cible est bien ecrite, modifiee ou videe
- les totaux sont bien recalcules automatiquement
- le statut d'echec par colonne peut etre redetecte
- l'historique des modifications est bien alimente
- la projection retournee est exploitable directement par le frontend

### Contraintes backend

- l'encodage porte sur une fiche existante seulement
- aucune creation de fiche n'est incluse dans PED-02
- aucune validation de fiche n'est incluse dans PED-02
- aucune cloture de fiche n'est incluse dans PED-02
- aucune reouverture de fiche n'est incluse dans PED-02
- la fenetre temporelle est calculee a partir de la date courante du serveur, pas d'une date metier fournie par le client
- `EncoderCoteUseCase` porte une logique d'idempotence
- `ModifierCoteUseCase` et `ViderCoteUseCase` ne portent pas cette meme logique d'idempotence applicative
- la fiche transporte deja les donnees academiques necessaires a l'encodage :
  - `idProgrammeNiveau`
  - `idReferentielCours`
  - `typeStructureEvaluation`
  - `aExamen`
  - `versionReferentielProgramme`
- l'encodage ne relit pas en direct :
  - `ProgrammeNiveau`
  - `ReferentielCours`
  - `Colonnes autorisees`
- ces donnees sont deja snapshottees dans la fiche
- les listes de fiches et lectures par classe restent encore documentaires / placeholders cote HTTP
- la lecture par identifiant d'une fiche est bien reelle

### Evenements importants

- `CoteEncodee`
- `CoteModifiee`
- `CoteVidee`
- `ConflitEncodageCoteDetecte`
- `EchecCoteDetecte`
- `HistoriqueModificationCoteCree`
- `TotalColonneRecalcule`
- ecriture d'une entree d'audit avec action :
  - `ENCODER_COTE`
  - `MODIFIER_COTE`
  - `VIDER_COTE`

### Donnees manipulees

- `FicheCotationEleveCours`
- `CoteColonneBulletin`
- `HistoriqueModificationCote`
- `FicheCotationOutput`
- `FicheCotationReadModel`
- `CodeColonneBulletin`
- `TypeStructureEvaluation`
- `EtatProclamation`
- `idFicheCotationEleveCours`
- `idEleve`
- `idInscriptionScolaire`
- `idClassePedagogique`
- `idAnneeScolaire`
- `idReferentielCours`
- `idProgrammeNiveau`
- `versionReferentielProgramme`
- `idUtilisateur`
- `versionAttendue`

### Dependances aval eventuelles

- consommateur frontend principal :
  - mutation retournee en `FicheCotationOutput`
  - consultation d'une fiche par identifiant
- dependance academique amont reelle :
  - `ACA-06`
  - `CalendrierAcademique` verrouille
  - periode courante
  - examen courant
- dependance academique snapshottee dans la fiche :
  - `ProgrammeNiveau`
  - `ReferentielCours`
  - `typeStructureEvaluation`
  - `aExamen`
- dependance securite reelle :
  - couche securite partagee globale
  - permission `cotes.write`
- dependance pedagogique interne :
  - recalcul des totaux de structure

### Sources backend

- cas d'utilisation :
  - [EncoderCoteUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/application/use-cases/EncoderCote/EncoderCoteUseCase.ts)
  - [ModifierCoteUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/application/use-cases/ModifierCote/ModifierCoteUseCase.ts)
  - [ViderCoteUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/application/use-cases/ViderCote/ViderCoteUseCase.ts)
  - [CorrigerCoteUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/application/use-cases/CorrigerCote/CorrigerCoteUseCase.ts)
  - [ConsulterFicheCotationUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/application/use-cases/ConsulterFicheCotation/ConsulterFicheCotationUseCase.ts)
- agregats et entites :
  - [FicheCotationEleveCours.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/domain/aggregates/FicheCotationEleveCours.ts)
  - [CoteColonneBulletin.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/domain/entities/CoteColonneBulletin.ts)
  - [HistoriqueModificationCote.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/domain/entities/HistoriqueModificationCote.ts)
- policies et moteurs :
  - [MoteurEncodageCotes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/domain/services/MoteurEncodageCotes.ts)
  - [PolicyFenetreEncodageCotes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/domain/policies/PolicyFenetreEncodageCotes.ts)
  - [PolicyCoursSansExamen.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/domain/policies/PolicyCoursSansExamen.ts)
  - [PolicyColonneInterdite.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/domain/policies/PolicyColonneInterdite.ts)
  - [PolicyColonneTotalCalculee.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/domain/policies/PolicyColonneTotalCalculee.ts)
  - [PolicyColonneProclameeVerrouillee.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/domain/policies/PolicyColonneProclameeVerrouillee.ts)
- calendrier :
  - [FenetreEncodageCalendrierPort.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/application/ports/out/FenetreEncodageCalendrierPort.ts)
  - [FenetreEncodageCalendrierAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/FenetreEncodageCalendrierAdapter.ts)
  - [DeterminerFenetreCalendrier.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/application/use-cases/calendriers/DeterminerFenetreCalendrier.ts)
  - [MoteurFenetreCalendrier.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/domain/services/MoteurFenetreCalendrier.ts)
- interfaces HTTP :
  - [encodage-cotes.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/interfaces/http/routes/encodage-cotes.routes.ts)
  - [EncodageCotesController.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/interfaces/http/controllers/EncodageCotesController.ts)
  - [EncoderCoteValidator.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/interfaces/http/validators/EncoderCoteValidator.ts)
  - [ModifierCoteValidator.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/interfaces/http/validators/ModifierCoteValidator.ts)
  - [ViderCoteValidator.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/interfaces/http/validators/ViderCoteValidator.ts)
  - [FichesCotationController.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/interfaces/http/controllers/FichesCotationController.ts)
  - [fiches-cotation.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/interfaces/http/routes/fiches-cotation.routes.ts)
- projections et queries :
  - [FicheCotationMapper.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/application/mappers/FicheCotationMapper.ts)
  - [FicheCotationOutput.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/application/dto/output/FicheCotationOutput.ts)
  - [LigneFicheCotationOutput.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/application/dto/output/LigneFicheCotationOutput.ts)
  - [FicheCotationReadModel.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/application/read-models/FicheCotationReadModel.ts)
  - [PostgresFicheCotationQuery.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/infrastructure/persistence/postgres/queries/PostgresFicheCotationQuery.ts)
  - [FicheCotationPostgresMapper.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/infrastructure/persistence/postgres/mappers/FicheCotationPostgresMapper.ts)
  - [FicheCotationPresenter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/interfaces/http/presenters/FicheCotationPresenter.ts)
- securite partagee :
  - [PolicyEncodageCotes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/security/domain/policies/PolicyEncodageCotes.ts)
  - [GlobalTestBootstrap.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/setup/GlobalTestBootstrap.ts)
  - [security-bulletins.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-bulletins.integration.spec.ts)
  - [enseignant-workflow.e2e.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/e2e/enseignant-workflow.e2e.spec.ts)
  - [titulaire-workflow.e2e.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/e2e/titulaire-workflow.e2e.spec.ts)
  - [prefet-workflow.e2e.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/e2e/prefet-workflow.e2e.spec.ts)
  - [directeur-etudes-workflow.e2e.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/e2e/directeur-etudes-workflow.e2e.spec.ts)
- tests applicatifs :
  - [BulletinsUseCases.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/tests/application/use-cases/BulletinsUseCases.spec.ts)

### Notes de lecture frontend

- PED-02 doit etre lu comme un workflow de mutation sur fiche existante, pas comme un workflow de creation de fiche
- le coeur metier du workflow est maintenant double :
  - controle structurel de la fiche
  - controle temporel via `ACA-06`
- la fiche est deja un snapshot pedagogique exploitable :
  - la plupart des dependances academiques ne sont pas relues en direct pendant l'encodage
- le calendrier, en revanche, est desormais consomme reellement au moment de l'encodage

Lecture officielle des droits d'encodage :

- `ENSEIGNANT` : oui, acteur principal atteste
- `TITULAIRE` : oui, mais via ses capacites effectives d'`ENSEIGNANT`
- `PREFET_ETUDES` : non, acteur de controle
- `DIRECTEUR_ETUDES` : non, acteur de controle
- `ADMINISTRATEUR_ECOLE` : non retenu comme acteur metier d'encodage

Projections reelles exposees au frontend :

- mutation :
  - `FicheCotationOutput`
  - via `ServiceProjectionLecture` puis `FicheCotationMapper`
- consultation d'une fiche :
  - `FicheCotationReadModel`
  - via `PostgresFicheCotationQuery` puis `FicheCotationPostgresMapper`
- presentation HTTP :
  - `FicheCotationPresenter`
  - enveloppe la sortie dans `{ donnee: ... }`

Limites connues du backend actuel pour PED-02 :

- pas de revalidation locale explicite de `cotes.write` dans les use cases du BC
- pas de lecture liste/classe pleinement implementee pour les fiches
- pas de workflow complet de correction controlee expose au meme niveau que les trois mutations principales

### Notes de verrouillage

- Le BC protege aujourd'hui surtout l'autorisation d'encodage via la couche securite globale, pas via un second verrou local explicite dans les use cases.
- La consultation d'une fiche par identifiant est reelle, mais les listes de fiches restent encore placeholders cote HTTP.
- Le domaine porte deja des variantes controlees pour les colonnes proclamees, mais leur ouverture en workflow pedagogique autonome reste ulterieure.

### Statut de figement

`PED-02 FIGE`

## Workflow PED-03

### Identifiant

`PED-03`

### Nom

Generer la proclamation

### Categorie

`Pedagogique`

### Niveau de criticite

`Critique`

### Objectif metier

Permettre la production officielle d'une `ProclamationClasse` pour une classe pedagogique, une annee scolaire et une colonne de bulletin donnees, a partir d'une proclamation d'abord initialisee en brouillon puis alimentee par les `ResultatBulletinEleve` consolides, les identites reelles des eleves et les abandons reels de scolarite.

Lecture officielle de perimetre :

- `PED-03` couvre maintenant :
  - initialisation d'une `ProclamationClasse` brouillon
  - generation effective de la proclamation
  - projection des classes, non classes, abandons et statistiques
- `PED-03` ne couvre pas encore comme workflows applicatifs distincts :
  - validation de proclamation
  - verrouillage de proclamation
  - annulation de proclamation
  - export PDF reel

### Acteur principal

`TITULAIRE`

### Acteurs secondaires

- `PREFET_ETUDES`
  - acteur de lecture et de controle, pas generateur explicitement atteste
- `DIRECTEUR_ETUDES`
  - acteur de lecture et de controle, pas generateur explicitement atteste
- `ENSEIGNANT`
  - non prouve comme generateur simple de proclamation dans le backend audite

Acteur explicitement non retenu pour PED-03 en l'etat des preuves backend :

- `ADMINISTRATEUR_ECOLE`
  - permission large visible dans certaines fixtures de securite
  - mais absence de preuve backend explicite suffisante pour le retenir comme acteur metier principal de proclamation

### Preconditions

- une colonne de proclamation cible doit etre choisie :
  - `P1` a `P6`
  - `EX1` a `EX3`
  - `TOTAL_S1`
  - `TOTAL_S2`
  - `TOTAL_T1`
  - `TOTAL_T2`
  - `TOTAL_T3`
  - `TOTAL_GENERAL`
- une proclamation brouillon doit d'abord etre initialisee pour :
  - la meme classe pedagogique
  - la meme annee scolaire
  - la meme colonne
- aucune autre proclamation active ne doit deja exister pour ce meme contexte
- des `ResultatBulletinEleve` consolides doivent exister pour la classe et l'annee
- les informations scolarite reelles des eleves doivent etre lisibles
- la version du referentiel programme doit etre connue au moment de l'initialisation

### Permissions effectives requises

Protection officiellement attestee par la couche securite partagee sur la generation :

- permission effective `proclamations.generate`
- scope valide :
  - organisation
  - ecole
  - classe
  - annee scolaire
- titulariat effectif requis

Lecture doctrinale importante :

- le backend audite atteste positivement la generation de proclamation par `TITULAIRE`
- aucune preuve backend equivalente n'atteste `ENSEIGNANT` simple comme generateur de proclamation

Point d'architecture important :

- la protection reste attestee par la couche securite globale et les tests proteges
- le BC `bulletins-evaluations` revalide maintenant aussi localement `proclamations.generate`
- cette revalidation locale est appliquee :
  - a l'initialisation de proclamation
  - a la generation de proclamation
  - avec le bon perimetre :
    - ecole
    - classe
    - annee scolaire
    - titulariat effectif

### Cas d'utilisation utilises

- `InitialiserProclamationClasse`
- `GenererProclamationClasse`
- `ConsulterProclamationClasse`

Cas d'utilisation adjacents ou techniques mobilises autour du meme espace de travail :

- `GenererSyntheseResultatsEcole`
  - workflow aval consommateur des statistiques de proclamation
  - initialise puis consolide une `SyntheseResultatsEcole` a partir des proclamations reelles d'une ecole, avec identites reelles de classes
  - revalide localement `proclamations.generate` sur les classes consolidees
  - persiste reellement la synthese dans l'infrastructure composee
  - peut aussi produire un export PDF concret de synthese
- `DeclarerAbandon`
  - use case voisin, mais distinct de la generation de proclamation

### Deroulement principal

Le deroulement principal retenu pour PED-03 est celui d'un titulaire qui initialise puis genere une proclamation officielle.

1. Le backend recoit une demande d'initialisation avec :
   - `idClassePedagogique`
   - `idAnneeScolaire`
   - `idEcole`
   - `codeColonne`
   - `versionReferentielProgramme`
   - `creePar`
2. Le backend revalide localement que l'utilisateur demandeur peut initialiser la proclamation :
   - permission `proclamations.generate`
   - bonne ecole
   - bonne classe
   - bonne annee scolaire
3. Le use case recherche une proclamation deja existante pour ce meme contexte.
4. Si une proclamation non annulee existe deja, le backend refuse l'initialisation.
5. Sinon, le backend cree une `ProclamationClasse` en etat `BROUILLON`.
6. Le type de proclamation est derive de `codeColonne` :
   - `PERIODE`
   - `EXAMEN`
   - `SEMESTRE`
   - `TRIMESTRE`
   - `ANNUEL`
7. La proclamation brouillon est sauvegardee.
8. Un evenement `ProclamationClasseInitialisee` est publie si un `EventBusPort` est disponible.
9. Le backend projette la proclamation brouillon.
10. Lors de la generation, le backend recharge la proclamation par :
   - classe
   - colonne
   - annee
11. Si la proclamation est introuvable, le backend refuse l'operation.
12. Le backend revalide localement que l'utilisateur demandeur peut generer la proclamation :
   - permission `proclamations.generate`
   - bonne ecole
   - bonne classe
   - bonne annee scolaire
13. Le backend relit tous les `ResultatBulletinEleve` de la classe et de l'annee.
14. Pour chaque resultat, le backend relit l'identite eleve dans `scolarite-eleves`.
15. Si l'identite d'un eleve est introuvable, la generation est refusee.
16. Le backend relit la colonne demandee dans chaque resultat consolide.
17. Si la colonne est absente d'un resultat, la generation est refusee.
18. Le backend construit les `LigneProclamationClasse`.
19. Si une colonne est marquee `estNonClasse`, le backend construit aussi un `EleveNonClasseProclamation` reel et le transporte jusqu'a la projection finale.
20. Le backend relit les abandons reels par eleve et par annee via `scolarite-eleves`.
21. Les abandons detectes sont transportes comme `EleveAbandonProclamation`.
22. L'agregat genere officiellement la proclamation :
   - lignes classees
   - non classes
   - abandons
   - historique de generation
23. Le service statistiques recalcule les effectifs et taux de proclamation.
24. La proclamation est sauvegardee.
25. Les evenements de domaine sont publies si un `EventBusPort` est disponible.
26. Le backend projette la sortie finale en `ProclamationClasseOutput`.
27. Les evenements sont ensuite purges de l'agregat en memoire.

### Variantes

#### Variante 1 - Proclamation deja initialisee

- une proclamation non annulee existe deja pour le meme contexte
- le backend refuse une nouvelle initialisation

#### Variante 2 - Proclamation introuvable a la generation

- aucune proclamation brouillon n'existe pour la classe, l'annee et la colonne
- le backend refuse la generation

#### Variante 3 - Donnees scolarite introuvables

- une identite eleve est introuvable dans `scolarite-eleves`
- le backend refuse la generation
- aucun nom fictif n'est plus injecte

#### Variante 4 - Colonne resultat absente

- un resultat consolide ne porte pas la colonne demandee
- le backend refuse la generation

#### Variante 5 - Eleves non classes

- une colonne resultat est marquee `estNonClasse`
- l'eleve est detecte
- transporte
- projete
- puis compte dans les statistiques finales

#### Variante 6 - Eleves abandon

- un abandon est trouve dans le parcours scolaire de l'eleve pour la meme annee
- l'eleve est transporte dans `abandons`
- il reste visible mais hors classement

#### Variante 7 - Consultation ou export PDF reel

- `ConsulterProclamationClasse` relit une proclamation deja persistee
- `telechargerPdf` relit d'abord la proclamation
- puis appelle un vrai port PDF de proclamation
- le backend produit un document exportable concret a partir des donnees reelles de proclamation

### Resultat attendu

En sortie de PED-03, le backend doit produire :

- une `ProclamationClasseOutput`
- une liste `lignes`
- une liste `nonClasses`
- une liste `abandons`
- des `statistiques` coherentes
- une proclamation persistee
- un historique de generation complete

### Contraintes backend

- aucune proclamation active du meme contexte ne peut etre initialisee une seconde fois
- la generation depend d'une proclamation prealablement initialisee
- une proclamation ne peut pas etre vide
- aucune identite eleve fictive n'est autorisee dans la generation finale
- les `NON_CLASSE` doivent etre effectivement transportes dans :
  - l'agregat
  - la persistence
  - la projection
  - les statistiques
- `telechargerPdf` est maintenant un vrai export PDF de proclamation
- le cycle `valider` / `verrouiller` / `annuler` existe dans l'agregat mais pas encore comme workflows applicatifs distincts

### Evenements importants

- `ProclamationClasseInitialisee`
- `ProclamationClasseGeneree`
- `NonClassesProclamationDetectes`
- `AbandonsProclamationDetectes`
- `StatistiquesProclamationCalculees`

### Donnees manipulees

- `ProclamationClasse`
- `ResultatBulletinEleve`
- `ResultatColonneBulletin`
- `LigneProclamationClasse`
- `EleveNonClasseProclamation`
- `EleveAbandonProclamation`
- `HistoriqueGenerationProclamation`
- `StatistiquesProclamationClasse`
- donnees reelles de `scolarite-eleves` :
  - identite eleve
  - inscription
  - affectation active
  - parcours / abandon par annee

### Sources backend

- [InitialiserProclamationClasseUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/application/use-cases/InitialiserProclamationClasse/InitialiserProclamationClasseUseCase.ts)
- [GenererProclamationClasseUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/application/use-cases/GenererProclamationClasse/GenererProclamationClasseUseCase.ts)
- [ConsulterProclamationClasseUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/application/use-cases/ConsulterProclamationClasse/ConsulterProclamationClasseUseCase.ts)
- [ProclamationClasse.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/domain/aggregates/ProclamationClasse.ts)
- [ScolariteElevesAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/infrastructure/adapters/ScolariteElevesAdapter.ts)
- [proclamations.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/interfaces/http/routes/proclamations.routes.ts)
- [ProclamationsController.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/interfaces/http/controllers/ProclamationsController.ts)
- [InitialiserProclamationValidator.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/interfaces/http/validators/InitialiserProclamationValidator.ts)
- [GenererProclamationValidator.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/interfaces/http/validators/GenererProclamationValidator.ts)
- [ProclamationMapper.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/application/mappers/ProclamationMapper.ts)
- [ProclamationClasseOutput.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/application/dto/output/ProclamationClasseOutput.ts)
- [AutorisationGenerationProclamationAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationGenerationProclamationAdapter.ts)
- [ProclamationPdfPort.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/application/ports/out/ProclamationPdfPort.ts)
- [ProclamationPdfAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/infrastructure/adapters/ProclamationPdfAdapter.ts)
- [PdfProclamationService.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/infrastructure/services/PdfProclamationService.ts)
- [security-generation-pedagogique.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-generation-pedagogique.integration.spec.ts)

### Notes de lecture frontend

- `PED-03` est maintenant ouvrable parce que les trois dettes bloquantes precedentes sont fermees :
  - initialisation reelle de proclamation
  - lecture scolarite reelle pour l'identite et l'abandon
  - transport reel des `NON_CLASSE`
- le backend revalide maintenant aussi localement `proclamations.generate` sur :
  - l'initialisation
  - la generation
  - avec le bon perimetre classe + annee + ecole
- la generation ne relit pas en direct `ACA-06` ni `ACA-07`
- la version du programme reste un snapshot porte par la proclamation
- la consommation scolarite est devenue reelle sur les points utiles a la proclamation :
  - identite eleve
  - affectation active
  - abandon par annee

Projections reelles exposees au frontend :

- mutation / lecture :
  - `ProclamationClasseOutput`
  - via `ServiceProjectionProclamation` puis `ProclamationMapper`
- consultation :
  - `ProclamationClasseReadModel`
  - via `PostgresProclamationClasseQuery`
- presentation HTTP :
  - `ProclamationPresenter`
  - enveloppe la sortie dans `{ donnee: ... }`

Limites connues du backend actuel pour PED-03 :

- le PDF de proclamation est reel techniquement, mais sa richesse documentaire pourra encore evoluer avec les futures maquettes officielles
- pas de workflow applicatif distinct pour `valider`, `verrouiller`, `annuler`
- la methode `consulterClassePedagogique` du port scolarite n'est pas necessaire a PED-03 lui-meme, mais elle est desormais consommee par le workflow aval de synthese pour projeter les vraies classes

### Notes de verrouillage

- Le cycle `valider` / `verrouiller` / `annuler` doit-il rester latent dans l'agregat ou ouvrir plus tard de vrais workflows pedagogiques distincts ?
- Le PDF de proclamation doit-il evoluer vers un modele imprime plus riche et plus proche des maquettes officielles ?

### Statut de figement

`PED-03 FIGE`

## Workflow PED-04

### Identifiant

`PED-04`

### Nom

Generer la synthese des resultats de l'ecole

### Categorie

`Pedagogique`

### Niveau de criticite

`Important`

### Objectif metier

Permettre la production d'une synthese officielle des resultats d'une ecole a partir :

- d'une `SyntheseResultatsEcole` prealablement initialisee
- des `ProclamationClasse` reelles deja generees
- des identites reelles de classes pedagogiques
- des statistiques consolidees par classe

afin de produire une vue ecole exploitable, consultable et exportable en PDF.

### Acteur principal

`TITULAIRE` effectif

Lecture officielle de l'acteur :

- la generation locale de synthese revalide `proclamations.generate`
- cette revalidation est appliquee sur chaque classe pedagogique consolidee
- la synthese reste donc alignee sur la meme exigence metier que la proclamation

### Acteurs secondaires

Aucun acteur secondaire humain n'est explicitement atteste comme generateur principal de la synthese dans les preuves backend retenues.

Acteurs de lecture ou de controle possibles dans l'etat actuel du backend :

- `PREFET_ETUDES`
- `DIRECTEUR_ETUDES`

### Preconditions

- une `SyntheseResultatsEcole` doit deja avoir ete initialisee pour :
  - `idEcole`
  - `idAnneeScolaire`
  - `codeColonne`
- aucune autre synthese active du meme contexte ne doit exister
- au moins une `ProclamationClasse` exploitable doit exister pour :
  - la meme ecole
  - la meme annee scolaire
  - la meme colonne
- chaque proclamation source doit porter :
  - un `idClassePedagogique` reel
  - des statistiques reelles
- le backend doit pouvoir relire chaque classe pedagogique pour obtenir son libelle reel
- l'identite de l'acteur demandeur doit etre disponible pour la tracabilite :
  - `idUtilisateur`

### Permissions effectives requises

Lecture officielle frontend et securite partagee :

- permission effective `proclamations.generate`
- scope valide par classe consolidee :
  - ecole
  - classe
  - annee scolaire
- titulariat effectif requis sur les classes consolidees

Point de lecture important :

- la securite globale protege deja le parcours
- le backend revalide desormais aussi localement `proclamations.generate`
- cette revalidation locale est appliquee :
  - a l'initialisation de synthese
  - a la generation de synthese
  - sur l'ensemble des classes portees par les proclamations sources

### Cas d'utilisation utilises

- `InitialiserSyntheseResultatsEcole`
- `GenererSyntheseResultatsEcole`
- `ConsulterSyntheseResultatsEcole`

Cas d'utilisation adjacents ou techniques mobilises autour du meme espace de travail :

- `GenererProclamationClasse`
  - workflow amont obligatoire
- `telechargerPdf`
  - variante de lecture/export de la synthese deja produite

### Deroulement principal

Le deroulement principal retenu pour PED-04 est celui d'un titulaire qui initialise puis genere une synthese ecole a partir des proclamations reelles.

1. Le backend recoit une demande d'initialisation avec :
   - `idEcole`
   - `idAnneeScolaire`
   - `codeColonne`
   - `typeSynthese`
   - `creePar`
2. Le backend relit d'abord les proclamations reelles du bon contexte afin d'en deduire les classes consolidees.
3. Le backend revalide localement que l'utilisateur demandeur peut initialiser la synthese sur chacune de ces classes :
   - permission `proclamations.generate`
   - bonne ecole
   - bonne annee scolaire
   - chacune des classes pedagogiques consolidees
4. Le use case recherche une synthese deja existante pour ce meme contexte.
5. Si une synthese existe deja, le backend refuse l'initialisation.
6. Sinon, le backend cree une `SyntheseResultatsEcole` initiale.
7. La synthese initialisee est sauvegardee.
8. Un evenement `SyntheseResultatsEcoleInitialisee` est publie si un `EventBusPort` est disponible.
9. Lors de la generation, le backend recharge la synthese par :
   - ecole
   - colonne
10. Si la synthese est introuvable, le backend refuse l'operation.
11. Le backend relit ensuite toutes les `ProclamationClasse` de la bonne :
   - ecole
   - annee scolaire
   - colonne
12. Si aucune proclamation exploitable n'est retrouvee, le backend refuse la generation.
13. Le backend revalide localement que l'utilisateur demandeur peut generer la synthese pour les classes consolidees :
   - permission `proclamations.generate`
   - bonne ecole
   - bonne annee scolaire
   - chacune des classes pedagogiques consolidees
14. Pour chaque proclamation source, le backend relit la classe pedagogique reelle afin d'obtenir :
   - `idClassePedagogique`
   - `libelleClasse`
15. Si une classe pedagogique est introuvable, le backend refuse la generation.
16. Le backend transforme chaque proclamation en ligne de synthese avec ses statistiques reelles :
   - inscrits
   - participants
   - classes
   - non classes
   - abandons
   - reussites
   - echecs
   - taux
17. Le domaine consolide ensuite les totaux ecole.
18. La `SyntheseResultatsEcole` est mise a jour avec :
   - ses lignes reelles
   - ses totaux reels
   - son historique de generation
19. La synthese est sauvegardee.
20. Les evenements de domaine sont publies si un `EventBusPort` est disponible.
21. Le backend projette la sortie finale en `SyntheseEcoleOutput`.
22. La synthese peut ensuite etre consultee.
23. Une variante d'export PDF concret peut etre declenchee sur cette projection.

### Variantes

#### Variante 1 - Synthese deja initialisee

- une synthese existe deja pour la meme ecole, la meme annee et la meme colonne
- le backend refuse une nouvelle initialisation

#### Variante 1 bis - Utilisateur non autorise a l'initialisation

- l'utilisateur ne satisfait pas la revalidation locale `proclamations.generate`
- le backend refuse l'initialisation

#### Variante 2 - Synthese introuvable a la generation

- aucune synthese initialisee n'existe pour le contexte demande
- le backend refuse la generation

#### Variante 3 - Aucune proclamation exploitable

- aucune proclamation reelle ne correspond a :
  - la bonne ecole
  - la bonne annee scolaire
  - la bonne colonne
- le backend refuse la generation

#### Variante 4 - Classe pedagogique introuvable

- une proclamation source pointe vers une classe pedagogique non resoluble
- le backend refuse la generation

#### Variante 5 - Utilisateur non autorise localement

- l'utilisateur ne satisfait pas la revalidation locale `proclamations.generate`
- le backend refuse la generation

#### Variante 6 - Consultation de synthese

- le backend relit une synthese deja persistee
- la projette dans un read model de consultation

#### Variante 7 - Export PDF concret

- le backend relit la synthese
- projette la sortie
- puis demande a `SynthesePdfPort` de produire un vrai export PDF

### Resultat attendu

En sortie de PED-04, le backend doit produire :

- une `SyntheseEcoleOutput`
- une liste `lignes` avec vraies classes pedagogiques
- des `totaux` consolides a l'echelle ecole
- une synthese persistee
- un historique de generation
- un export PDF concret si la variante PDF est utilisee

### Contraintes backend

- aucune synthese active du meme contexte ne peut etre initialisee une seconde fois
- la generation depend d'une synthese prealablement initialisee
- aucune synthese vide n'est autorisee
- aucune classe fictive n'est autorisee dans les lignes finales
- la generation depend uniquement de proclamations reelles du bon :
  - contexte ecole
  - contexte annee
  - contexte colonne
- la revalidation locale de securite doit reussir sur toutes les classes consolidees
- la persistance composee de l'application est desormais reelle pour la synthese
- le PDF de synthese est maintenant un vrai document structure :
  - regroupement par section
  - tableau reel par classes
  - total section
  - total ecole

### Evenements importants

- `SyntheseResultatsEcoleInitialisee`
- `SyntheseResultatsEcoleGeneree`

### Donnees manipulees

- `SyntheseResultatsEcole`
- `ProclamationClasse`
- `LigneSyntheseResultatsEcole`
- `TotauxSyntheseResultatsEcole`
- donnees reelles de `scolarite-eleves` / referentiel amont pour les classes :
  - `idClassePedagogique`
  - `libelleClasse`
  - `idSectionScolaire`
  - `sectionCode`
  - `sectionLibelle`

### Sources backend

- [InitialiserSyntheseResultatsEcoleUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/application/use-cases/InitialiserSyntheseResultatsEcole/InitialiserSyntheseResultatsEcoleUseCase.ts)
- [GenererSyntheseResultatsEcoleUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/application/use-cases/GenererSyntheseResultatsEcole/GenererSyntheseResultatsEcoleUseCase.ts)
- [ConsulterSyntheseResultatsUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/application/use-cases/ConsulterSyntheseResultats/ConsulterSyntheseResultatsUseCase.ts)
- [SyntheseResultatsEcole.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/domain/aggregates/SyntheseResultatsEcole.ts)
- [AutorisationGenerationSynthesePort.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/application/ports/out/AutorisationGenerationSynthesePort.ts)
- [AutorisationGenerationSyntheseAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationGenerationSyntheseAdapter.ts)
- [SynthesePdfPort.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/application/ports/out/SynthesePdfPort.ts)
- [SynthesePdfAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/infrastructure/adapters/SynthesePdfAdapter.ts)
- [PdfSyntheseService.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/infrastructure/services/PdfSyntheseService.ts)
- [PostgresDepotSyntheseResultatsEcole.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/infrastructure/persistence/postgres/depots/PostgresDepotSyntheseResultatsEcole.ts)
- [PostgresDepotProclamationClasse.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/infrastructure/persistence/postgres/depots/PostgresDepotProclamationClasse.ts)
- [ScolariteElevesAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/infrastructure/adapters/ScolariteElevesAdapter.ts)
- [syntheses.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/interfaces/http/routes/syntheses.routes.ts)
- [SyntheseResultatsController.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/interfaces/http/controllers/SyntheseResultatsController.ts)
- [InitialiserSyntheseValidator.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/interfaces/http/validators/InitialiserSyntheseValidator.ts)
- [security-generation-pedagogique.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-generation-pedagogique.integration.spec.ts)

### Notes de lecture frontend

- `PED-04` est maintenant ouvrable parce que les dettes bloquantes precedentes sont fermees :
  - initialisation reelle de synthese
  - relecture correcte des proclamations sources
  - vraies identites de classes
  - revalidation locale de `proclamations.generate`
  - persistance reelle de synthese
  - export PDF concret
- l'initialisation et la generation sont maintenant toutes deux gouvernees par la meme doctrine :
  - permission `proclamations.generate`
  - bon perimetre ecole + classe + annee scolaire
- `PED-04` est un workflow aval direct de `PED-03`
- le backend ne consolide plus aucune classe fictive
- la synthese transporte maintenant aussi le perimetre sectionnel reel de chaque classe

Projections reelles exposees au frontend :

- mutation / lecture :
  - `SyntheseEcoleOutput`
  - via `SyntheseMapper`
- consultation :
  - `SyntheseResultatsEcoleReadModel`
  - via `PostgresSyntheseResultatsEcoleQuery`
- presentation HTTP :
  - `SynthesePresenter`
  - enveloppe la sortie dans `{ donnee: ... }`

Limites connues du backend actuel pour PED-04 :

- pas de workflow applicatif distinct pour `valider`, `verrouiller`, `annuler` une synthese
- pas encore de template documentaire calibre pixel par pixel sur un modele source officiel unique

### Notes de verrouillage

- Le cycle `valider` / `verrouiller` / `annuler` doit-il rester latent dans l'agregat ou ouvrir plus tard de vrais workflows applicatifs ?
- Le PDF de synthese doit-il un jour etre cale exactement sur un package template officiel source comme les autres documents ?

### Statut de figement

`PED-04 FIGE`

## Workflow PED-05

### Identifiant

`PED-05`

### Nom

Consulter les statistiques pedagogiques consolidees

### Categorie

`Pedagogique`

### Niveau de criticite

`Important`

### Objectif metier

Permettre la consultation autorisee des statistiques pedagogiques deja calculees a partir :

- des `ProclamationClasse` reelles pour la lecture classe
- des `SyntheseResultatsEcole` reelles pour la lecture ecole
- des listes detaillees de :
  - `NON_CLASSE`
  - `abandons`

afin de fournir une lecture exploitable des resultats :

- par classe
- par ecole
- par liste detaillee

sans relancer de recalcul metier lourd au moment de la consultation.

### Acteur principal

`PREFET_ETUDES`

Lecture officielle de l'acteur :

- c'est l'acteur pedagogique de controle le plus explicitement atteste positivement pour la consultation statistique de classe
- cette consultation reste strictement limitee a sa section autorisee

### Acteurs secondaires

- `DIRECTEUR_ETUDES`
  - peut consulter des statistiques de classe dans sa section secondaire
  - n'est pas atteste comme lecteur des statistiques globales d'ecole
- `TITULAIRE` effectif
  - peut consulter les statistiques de sa propre classe titulaire pour la bonne annee scolaire
- `DIRECTEUR_DISCIPLINE`
  - peut consulter les statistiques de classe dans la section secondaire autorisee
  - n'est pas atteste comme lecteur des statistiques globales d'ecole

Acteurs explicitement non retenus en l'etat des preuves backend :

- `ENSEIGNANT` simple
- `PARENT`
- `ADMINISTRATEUR_ECOLE`
- `PROMOTEUR_ORGANISATION`
- `DIRECTEUR_PRIMAIRE`
- `DIRECTEUR_MATERNELLE`

### Preconditions

- pour les statistiques de classe :
  - une `ProclamationClasse` reelle doit exister pour :
    - la bonne classe
    - la bonne annee scolaire
    - la bonne colonne
  - les statistiques de proclamation doivent deja avoir ete calculees
- pour les statistiques d'ecole :
  - une `SyntheseResultatsEcole` reelle doit exister pour :
    - la bonne ecole
    - la bonne annee scolaire
    - la bonne colonne
- pour les listes `non-classes` :
  - des `NON_CLASSE` reels doivent deja avoir ete projetes depuis la proclamation
- pour les listes `abandons` :
  - les abandons reels doivent deja avoir ete exposes dans le flux de proclamation / scolarite
- l'identite de l'utilisateur demandeur doit etre disponible
- le tenant ecole actif doit etre coherent

### Permissions effectives requises

Permission commune :

- permission effective `bulletins.read`

Lecture classe / non-classes / abandons :

- bon perimetre metier parmi les suivants :
  - `TITULAIRE` effectif de la bonne classe et de la bonne annee
  - role pedagogique sectionnel avec bonne section resolue depuis la classe

Lecture ecole :

- perimetre global uniquement :
  - aucun acteur positif officiellement retenu dans l'etat courant des preuves backend

Lecture doctrinale importante :

- permission seule = insuffisante
- le backend revalide localement le perimetre reel avant chaque lecture statistique
- `PREFET_ETUDES` et `DIRECTEUR_ETUDES` ne lisent pas l'ecole entiere par simple `bulletins.read`
- ils doivent respecter leur perimetre sectionnel quand le workflow consulte une classe
- `DIRECTEUR_DISCIPLINE` n'est lisible positivement ici que parce que la lecture statistique reste effectivement prouvee dans l'etat courant
- `ADMINISTRATEUR_ECOLE` n'est plus retenu comme lecteur positif du workflow pedagogique apres correction doctrinale
- `PROMOTEUR_ORGANISATION` n'est pas retenu non plus comme lecteur pedagogique officiellement prouve dans l'etat courant

### Cas d'utilisation utilises

- `ConsulterStatistiquesClasse`
- `ConsulterStatistiquesEcole`
- `ConsulterNonClasses`
- `ConsulterAbandons`

Cas d'utilisation adjacents ou techniques mobilises autour du meme espace de travail :

- `ConsulterSyntheseResultatsEcole`
  - base de lecture pour les statistiques globales d'ecole
- `ConsulterProclamationClasse`
  - base de lecture pour les statistiques de classe
- `telechargerPdf` via `ExportsBulletinController`
  - variante documentaire
  - reutilise le PDF de synthese deja produit par `PED-04`

### Deroulement principal

Le deroulement principal retenu pour PED-05 est celui d'un prefet des etudes qui consulte les statistiques consolidees d'une classe de sa section.

1. Le backend recoit une demande de lecture avec :
   - `idClassePedagogique`
   - `idAnneeScolaire`
   - `codeColonne`
   - `idUtilisateur`
   - `idEcole`
   - `idOrganisation` eventuel
2. Le controleur valide les parametres HTTP et les transforme en input applicatif propre.
3. Le use case `ConsulterStatistiquesClasse` demarre.
4. Le backend revalide localement l'autorisation statistique.
5. Si la classe permet de resoudre une section reelle :
   - le backend compare cette section au perimetre pedagogique de l'acteur demandeur
6. Si l'utilisateur est un porteur de perimetre global d'ecole / organisation :
   - le backend accepte la lecture avec `bulletins.read` sur le bon scope global
7. Sinon, si l'utilisateur est un superviseur pedagogique de section :
   - le backend exige la bonne section
   - puis valide `bulletins.read` avec ce perimetre sectionnel
8. Sinon, si l'utilisateur est `ENSEIGNANT`, le backend verifie un vrai titulariat effectif :
   - meme classe
   - meme annee scolaire
   - meme ecole
9. Si aucun de ces perimetres n'est satisfait, la lecture est refusee.
10. Une fois l'autorisation locale validee, le use case interroge la query de statistiques de classe.
11. La query relit la `ProclamationClasse` de reference et en extrait les statistiques deja calculees.
12. Si aucune statistique de classe n'est disponible pour ce contexte, le backend renvoie une erreur de lecture introuvable.
13. Le backend projette la sortie dans un `StatistiquesClasseReadModel`.
14. Le presenter HTTP enveloppe la reponse sous la forme `{ donnee: ... }`.

### Variantes

#### Variante 1 - Consultation des statistiques globales d'ecole

- le backend recoit :
  - `idEcole`
  - `idAnneeScolaire`
  - `codeColonne`
- le use case `ConsulterStatistiquesEcole` revalide localement un perimetre global
- les roles sectionnels seuls sont refuses
- la query relit la `SyntheseResultatsEcole`
- la sortie expose les totaux consolides de l'ecole

#### Variante 2 - Consultation des non classes

- le backend relit la liste des `NON_CLASSE` pour :
  - la bonne classe
  - la bonne annee
  - la bonne colonne
- la meme autorisation locale de classe est appliquee
- la sortie est paginee par le presenter HTTP

#### Variante 3 - Consultation des abandons

- le backend relit la liste des abandons de la classe pour la bonne annee
- la meme autorisation locale de classe est appliquee
- la sortie est paginee par le presenter HTTP

#### Variante 4 - Utilisateur non autorise localement

- le perimetre reel de l'acteur ne correspond pas au contexte demande
- le backend refuse la lecture statistique

#### Variante 5 - Statistiques de classe introuvables

- aucune proclamation exploitable n'existe pour :
  - la bonne classe
  - la bonne annee
  - la bonne colonne
- le backend refuse la lecture avec une erreur de query

#### Variante 6 - Statistiques d'ecole introuvables

- aucune synthese exploitable n'existe pour :
  - la bonne ecole
  - la bonne annee
  - la bonne colonne
- le backend refuse la lecture avec une erreur de query

#### Variante 7 - Export statistiques

- le backend ne construit pas un document statistique autonome distinct
- `exporterStatistiques` reutilise le PDF de synthese pedagogique
- cette variante reste donc une lecture documentaire aval de `PED-04`

### Resultat attendu

En sortie de PED-05, le backend doit produire selon la lecture :

- un `StatistiquesClasseReadModel`
- un `StatistiquesEcoleReadModel`
- une liste de `NonClasseReadModel`
- une liste de `AbandonReadModel`
- une enveloppe HTTP coherente :
  - `{ donnee: ... }`
  - ou `{ donnee: [...], meta: ... }`

### Contraintes backend

- aucune statistique n'est recalculee dans `PED-05`
- la lecture de classe depend de la proclamation deja generee
- la lecture d'ecole depend de la synthese deja generee
- la lecture ecole n'est pas ouverte aux acteurs sectionnels seuls
- la lecture classe applique une vraie restriction de section quand la classe permet de resoudre sa section
- un `ENSEIGNANT` simple sans titulariat effectif ne peut pas consulter les statistiques de classe
- l'export statistiques reste adosse au PDF de synthese et non a un document statistique autonome

### Evenements importants

PED-05 est un workflow de consultation.

Il ne publie pas d'evenement metier dedie dans le backend actuel.

### Donnees manipulees

- `StatistiquesClasseReadModel`
- `StatistiquesEcoleReadModel`
- `NonClasseReadModel`
- `AbandonReadModel`
- `ProclamationClasse`
- `SyntheseResultatsEcole`
- donnees de perimetre securite :
  - utilisateur
  - ecole
  - organisation
  - section resolue depuis la classe
  - classe
  - annee scolaire

### Sources backend

- [ConsulterStatistiquesClasseUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/application/use-cases/ConsulterStatistiquesClasse/ConsulterStatistiquesClasseUseCase.ts)
- [ConsulterStatistiquesEcoleUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/application/use-cases/ConsulterStatistiquesEcole/ConsulterStatistiquesEcoleUseCase.ts)
- [ConsulterNonClassesUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/application/use-cases/ConsulterNonClasses/ConsulterNonClassesUseCase.ts)
- [ConsulterAbandonsUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/application/use-cases/ConsulterAbandons/ConsulterAbandonsUseCase.ts)
- [AutorisationConsultationStatistiquesPort.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/application/ports/out/AutorisationConsultationStatistiquesPort.ts)
- [AutorisationConsultationStatistiquesAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationConsultationStatistiquesAdapter.ts)
- [StatistiquesBulletinController.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/interfaces/http/controllers/StatistiquesBulletinController.ts)
- [statistiques.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/interfaces/http/routes/statistiques.routes.ts)
- [ConsulterStatistiquesValidator.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/interfaces/http/validators/ConsulterStatistiquesValidator.ts)
- [PostgresStatistiquesClasseQuery.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/infrastructure/persistence/postgres/queries/PostgresStatistiquesClasseQuery.ts)
- [PostgresStatistiquesEcoleQuery.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/infrastructure/persistence/postgres/queries/PostgresStatistiquesEcoleQuery.ts)
- [PostgresNonClassesQuery.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/infrastructure/persistence/postgres/queries/PostgresNonClassesQuery.ts)
- [PostgresAbandonsQuery.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/infrastructure/persistence/postgres/queries/PostgresAbandonsQuery.ts)
- [security-statistiques.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-statistiques.integration.spec.ts)
- [StatistiquesUseCases.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/tests/application/use-cases/StatistiquesUseCases.spec.ts)
- [StatistiquesRoutes.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/tests/interfaces/routes/StatistiquesRoutes.spec.ts)
- [ExportsBulletinController.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/interfaces/http/controllers/ExportsBulletinController.ts)

### Notes de lecture frontend

- `PED-05` est maintenant documentable proprement parce que :
  - la securite locale de consultation statistique existe
  - les use cases applicatifs sont explicites
  - les validateurs HTTP sont dedies
  - la restriction `permission + perimetre` est effectivement appliquee
- `PED-05` est un workflow de lecture aval :
  - classe -> depend de `PED-03`
  - ecole -> depend de `PED-04`
- il ne faut pas l'interpreter comme un workflow de recalcul
- l'export statistiques n'est pas un document autonome :
  - il reutilise le PDF de synthese de `PED-04`

Projections reelles exposees au frontend :

- `StatistiquesClasseReadModel`
- `StatistiquesEcoleReadModel`
- `NonClasseReadModel`
- `AbandonReadModel`
- presentation HTTP :
  - `StatistiquesPresenter`
  - `PaginationPresenter`

Limites connues du backend actuel pour PED-05 :

- pas de document PDF statistique autonome distinct de la synthese
- pas d'evenement metier dedie, ce qui reste coherent pour un pur workflow de consultation
- la resolution de section depend de la possibilite de resoudre correctement la classe pedagogique amont

### Notes de verrouillage

- Faut-il a terme produire un PDF statistique autonome, distinct du PDF de synthese ?
- Le workflow doit-il rester un bloc de consultation specialisee ou ouvrir plus tard un espace de pilotage plus large ?

### Statut de figement

`PED-05 FIGE`

## Workflow PED-06

### Identifiant

`PED-06`

### Nom

Consulter et recalculer le classement de classe

### Categorie

`Pedagogique`

### Niveau de criticite

`Important`

### Objectif metier

Permettre :

- la consultation autorisee d'un classement de classe deja calcule
- le recalcul autorise d'un classement a partir des `ResultatBulletinEleve` consolides

pour une :

- classe pedagogique
- annee scolaire
- colonne de bulletin

afin de produire un ordre officiel des eleves classables, d'exclure les `NON_CLASSE`, d'attribuer les rangs, puis d'exposer une projection lisible par le frontend.

### Acteur principal

`TITULAIRE` effectif

Lecture officielle de l'acteur :

- l'acteur mutationnel reellement atteste pour `PED-06` est le `TITULAIRE` effectif
- le recalcul du classement exige :
  - permission effective `bulletins.generate`
  - bonne ecole
  - bonne classe
  - bonne annee scolaire
  - titulariat effectif actif

### Acteurs secondaires

- `PREFET_ETUDES`
  - peut consulter le classement d'une classe de sa section
  - n'est pas atteste comme acteur de recalcul
- `DIRECTEUR_ETUDES`
  - est accepte par la policy locale de consultation sur le meme perimetre sectionnel
  - n'est pas atteste comme acteur de recalcul

Acteurs explicitement non retenus pour le recalcul :

- `ENSEIGNANT` simple
- `PREFET_ETUDES`
- `DIRECTEUR_ETUDES`
- `ADMINISTRATEUR_ECOLE`
- `PROMOTEUR_ORGANISATION`

### Preconditions

- pour la consultation :
  - un classement doit deja exister pour :
    - `idClassePedagogique`
    - `idAnneeScolaire`
    - `codeColonne`
- pour le recalcul :
  - au moins un `ResultatBulletinEleve` consolide doit exister pour :
    - la bonne classe
    - la bonne annee scolaire
- l'identite du demandeur doit etre disponible :
  - `idUtilisateur`
- le contexte de securite doit fournir :
  - `idEcole`
  - `idOrganisation` eventuel
- la demande doit fournir :
  - `idClassePedagogique`
  - `idAnneeScolaire`
  - `codeColonne`

Lecture importante :

- un classement preexistant n'est plus obligatoire pour le recalcul
- s'il est absent, le backend l'initialise automatiquement au premier recalcul

### Permissions effectives requises

Consultation :

- permission effective `bulletins.read`
- perimetre metier valide parmi :
  - `TITULAIRE` effectif de la bonne classe et de la bonne annee
  - role pedagogique sectionnel avec bonne section resolue depuis la classe
  - porteur d'un perimetre global d'ecole / organisation

Recalcul :

- permission effective derivee `bulletins.generate`
- bonne ecole
- bonne classe
- bonne annee scolaire
- titulariat effectif requis

Lecture doctrinale importante :

- permission seule = insuffisante
- `PED-06` reapplique localement `shared/security`
- la consultation reuse la meme doctrine `permission + perimetre` que `PED-05`
- le recalcul ajoute un verrou plus fort :
  - titulariat effectif
  - + `bulletins.generate`

### Cas d'utilisation utilises

- `ConsulterClassementClasse`
- `RecalculerClassementClasse`

Cas d'utilisation techniques ou amont mobilises dans le meme espace :

- `RecalculerResultatEleve`
  - alimente en amont les resultats consolides exploites par le classement
- `GenererBulletinEleve`
  - sa saga peut enchaîner un recalcul de classement avec la vraie classe du resultat

### Deroulement principal

Le deroulement principal retenu pour PED-06 est celui d'un titulaire effectif qui recalcule le classement officiel de sa classe pour une colonne donnee.

1. Le backend recoit une demande de recalcul avec :
   - `idClassePedagogique`
   - `idAnneeScolaire`
   - `codeColonne`
   - `idUtilisateur`
   - `idEcole`
   - `idOrganisation` eventuel
2. Le controleur valide les donnees HTTP et construit un input applicatif propre.
3. Le use case `RecalculerClassementClasse` demarre.
4. Le backend revalide localement l'autorisation de recalcul :
   - `bulletins.read` dans le bon scope ecole
   - capacites effectives de l'utilisateur
   - presence de `bulletins.generate`
   - titulariat effectif sur la bonne classe et la bonne annee
5. Si l'utilisateur ne satisfait pas ce perimetre, le backend refuse le recalcul.
6. Le use case tente de relire un `ClassementColonneClasse` deja existant pour :
   - la classe
   - la colonne
   - l'annee scolaire
7. Le backend relit ensuite tous les `ResultatBulletinEleve` consolides de la classe pour l'annee.
8. Si aucun resultat exploitable n'est disponible, le backend echoue.
9. Si aucun classement n'existe encore, le use case initialise automatiquement un nouveau `ClassementColonneClasse`.
10. Pour chaque resultat eleve, le backend relit la colonne demandee.
11. Le backend enrichit la ligne avec :
    - `idEleve`
    - sexe pedagogique si disponible via `scolarite-eleves`
    - total
    - maximum
    - pourcentage
    - rang source eventuel
    - marqueur `estNonClasse`
12. Le `MoteurClassementBulletin` demande a l'agregat de recalculer le classement.
13. Le domaine :
    - exclut les `NON_CLASSE`
    - ordonne les eleves par total puis pourcentage
    - attribue les rangs avec gestion des egalites
    - met a jour la date de calcul
    - incremente la version
    - emet :
      - `ClassementColonneRecalcule`
      - `RangsAttribues`
      - `ElevesNonClassesExclusClassement` si necessaire
14. Le classement est sauvegarde.
15. Les evenements de domaine sont publies si le bus est disponible.
16. Le classement est projete en `ClassementClasseOutput`.
17. Les evenements sont purges de l'agregat en memoire.
18. Le use case retourne la projection du classement recalcule.

### Variantes

#### Variante 1 - Consultation d'un classement existant

- le backend recoit :
  - `idClassePedagogique`
  - `idAnneeScolaire`
  - `codeColonne`
  - `idUtilisateur`
  - `idEcole`
- le use case `ConsulterClassementClasse` revalide localement le perimetre de lecture
- la query relit le classement deja calcule
- la sortie expose un `ClassementClasseOutput`

#### Variante 2 - Premier recalcul sans classement preexistant

- aucun classement n'existe encore pour le contexte demande
- le use case cree automatiquement un agregat de classement
- puis applique le recalcul complet

#### Variante 3 - Consultation de section

- un `PREFET_ETUDES` ou `DIRECTEUR_ETUDES` consulte une classe
- le backend resout d'abord la section reelle de cette classe
- la lecture n'est autorisee que si la section correspond au perimetre de l'acteur

#### Variante 4 - Resultats consolides introuvables

- aucun `ResultatBulletinEleve` exploitable n'existe pour la classe et l'annee
- le backend refuse le recalcul

#### Variante 5 - Utilisateur non autorise localement

- l'utilisateur ne satisfait pas :
  - la permission requise
  - ou le bon perimetre
  - ou le titulariat effectif
- le backend refuse la consultation ou le recalcul

#### Variante 6 - Classement introuvable en consultation

- la lecture demande un classement qui n'a jamais ete calcule
- le backend retourne une erreur de query introuvable

### Resultat attendu

En sortie de PED-06, le backend doit produire selon le cas :

- un `ClassementClasseOutput`
- des lignes de classement ordonnees
- des rangs coherents
- l'exclusion des `NON_CLASSE`
- une sauvegarde persistante du classement recalcule
- des evenements de domaine publies si le bus est present

### Contraintes backend

- aucune consultation n'est autorisee sans revalidation locale du perimetre
- aucun recalcul n'est autorise sans titulariat effectif
- aucun recalcul n'est autorise sans `bulletins.generate`
- le classement est toujours scope par :
  - classe
  - annee scolaire
  - colonne
- l'absence de classement preexistant n'est plus bloquante
- l'absence de resultats consolides reste bloquante
- les `NON_CLASSE` sont exclus du classement final
- la persistance du classement est maintenant reelle en PostgreSQL compose, avec fallback memoire pour les contextes de test non relies
- il n'existe pas aujourd'hui de PDF dedie au classement

### Evenements importants

- `ClassementColonneRecalcule`
- `RangsAttribues`
- `ElevesNonClassesExclusClassement`

### Donnees manipulees

- `ClassementColonneClasse`
- `LigneClassementEleve`
- `ResultatBulletinEleve`
- `ClassementClasseOutput`
- `ClassementClasseReadModel`
- donnees de securite :
  - `idUtilisateur`
  - `idOrganisation`
  - `idEcole`
  - `idClassePedagogique`
  - `idAnneeScolaire`
- donnees amont scolarite :
  - `sexe`

### Dependances aval eventuelles

- consommateur frontend principal :
  - lecture du `ClassementClasseOutput`
  - lecture du `ClassementClasseReadModel`
- dependance pedagogique amont reelle :
  - `ResultatBulletinEleve` consolide
- dependance securite reelle :
  - `shared/security`
  - permission `bulletins.read`
  - permission derivee `bulletins.generate`
  - titulariat effectif
- dependance scolarite eleves optionnelle :
  - enrichissement du sexe pedagogique dans les lignes
- dependance aval indirecte :
  - la saga de generation du bulletin peut declencher un recalcul de classement avec la vraie classe du resultat

### Sources backend

- cas d'utilisation :
  - [ConsulterClassementClasseUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/application/use-cases/ConsulterClassementClasse/ConsulterClassementClasseUseCase.ts)
  - [RecalculerClassementClasseUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/application/use-cases/RecalculerClassementClasse/RecalculerClassementClasseUseCase.ts)
- agregat et entite :
  - [ClassementColonneClasse.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/domain/aggregates/ClassementColonneClasse.ts)
  - [LigneClassementEleve.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/domain/entities/LigneClassementEleve.ts)
- moteur et evenements :
  - [MoteurClassementBulletin.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/domain/services/MoteurClassementBulletin.ts)
  - [ClassementColonneRecalcule.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/domain/events/ClassementColonneRecalcule.ts)
  - [RangsAttribues.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/domain/events/RangsAttribues.ts)
  - [ElevesNonClassesExclusClassement.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/domain/events/ElevesNonClassesExclusClassement.ts)
- autorisation locale :
  - [AutorisationClassementPort.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/application/ports/out/AutorisationClassementPort.ts)
  - [AutorisationClassementAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationClassementAdapter.ts)
- interfaces HTTP :
  - [classements.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/interfaces/http/routes/classements.routes.ts)
  - [ClassementsController.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/interfaces/http/controllers/ClassementsController.ts)
  - [ConsulterClassementValidator.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/interfaces/http/validators/ConsulterClassementValidator.ts)
  - [RecalculClassementValidator.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/interfaces/http/validators/RecalculClassementValidator.ts)
- projections et queries :
  - [ClassementMapper.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/application/mappers/ClassementMapper.ts)
  - [ClassementClasseOutput.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/application/dto/output/ClassementClasseOutput.ts)
  - [ClassementClasseReadModel.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/application/read-models/ClassementClasseReadModel.ts)
  - [PostgresClassementClasseQuery.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/infrastructure/persistence/postgres/queries/PostgresClassementClasseQuery.ts)
  - [ClassementPostgresMapper.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/infrastructure/persistence/postgres/mappers/ClassementPostgresMapper.ts)
- persistance et chaine amont :
  - [PostgresDepotClassementColonneClasse.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/infrastructure/persistence/postgres/depots/PostgresDepotClassementColonneClasse.ts)
  - [SagaGenerationBulletin.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/application/sagas/SagaGenerationBulletin.ts)
- preuves tests :
  - [ClassementsUseCases.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/tests/application/use-cases/ClassementsUseCases.spec.ts)
  - [ClassementsRoutes.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/tests/interfaces/routes/ClassementsRoutes.spec.ts)
  - [security-classements.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-classements.integration.spec.ts)
  - [BulletinsSagas.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/tests/application/sagas/BulletinsSagas.spec.ts)
  - [BulletinsPostgres.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/tests/infrastructure/persistence/BulletinsPostgres.spec.ts)

### Notes de lecture frontend

- `PED-06` est maintenant documentable proprement parce que :
  - l'initialisation implicite du classement au premier recalcul est geree backend
  - la securite locale existe
  - la doctrine `permission + perimetre` est appliquee
  - la chaine amont depuis la saga bulletin ne transporte plus une classe vide
  - la persistance du classement est maintenant reelle
- `PED-06` ne doit pas etre lu comme un document imprimable :
  - il n'existe pas de PDF dedie au classement
  - le classement reste un objet de calcul, de lecture et de projection
- la consultation et le recalcul ne portent pas la meme exigence :
  - consultation = `bulletins.read` + perimetre
  - recalcul = `bulletins.generate` + titulariat effectif

Projections reelles exposees au frontend :

- mutation / lecture :
  - `ClassementClasseOutput`
  - via `ClassementMapper`
- consultation :
  - `ClassementClasseReadModel`
  - via `PostgresClassementClasseQuery`
- presentation HTTP :
  - `ClassementPresenter`
  - enveloppe la sortie dans `{ donnee: ... }`

Limites connues du backend actuel pour PED-06 :

- pas de PDF classement autonome
- le classement n'est pas un workflow documentaire officiel
- le sexe pedagogique des lignes depend d'un enrichissement scolarite optionnel au moment du recalcul

### Notes de verrouillage

- Faut-il un jour transformer le classement en document officiel imprimable, ou doit-il rester un objet de lecture et de pilotage ?
- La lecture globale de certains acteurs transverses doit-elle etre davantage prouvee par des tests E2E dedies, ou la policy locale actuelle suffit-elle ?

### Statut de figement

`PED-06 FIGE`

## Workflow PED-07

### Identifiant

`PED-07`

### Nom

Encoder la conduite

### Categorie

`Pedagogique`

### Niveau de criticite

`Important`

### Objectif metier

Permettre l'encodage ou la modification de la conduite d'un eleve sur une periode simple a partir d'un `ResultatBulletinEleve` consolide existant, avec historisation de la mutation, publication d'un evenement de domaine et projection immediate du nouvel etat.

Lecture doctrinale importante :

- `application` n'est pas un workflow humain
- `application` reste une donnee calculee automatiquement
- `PED-07` couvre uniquement la conduite

### Acteur principal

`TITULAIRE` effectif

### Acteurs secondaires

- `DIRECTEUR_DISCIPLINE`
  - uniquement dans la section secondaire de son ecole
  - jamais hors section

Acteurs explicitement refuses :

- `ENSEIGNANT` simple non titulaire
- `ADMINISTRATEUR_ECOLE`

### Preconditions

- un `ResultatBulletinEleve` consolide doit deja exister pour `idResultatBulletinEleve`
- la demande doit fournir :
  - `idResultatBulletinEleve`
  - `codePeriode`
  - `pointsConduite`
  - `idUtilisateur`
- le contexte de securite doit permettre de retrouver :
  - `idEcole`
  - `idClassePedagogique`
  - `idAnneeScolaire`

### Permissions effectives requises

- permission `cotes.write`
- puis revalidation locale du perimetre metier

Pour `TITULAIRE` :

- bonne ecole
- bonne classe
- bonne annee scolaire
- titulariat effectif actif

Pour `DIRECTEUR_DISCIPLINE` :

- bonne ecole
- bonne section secondaire
- bonne classe resolue dans cette section

### Cas d'utilisation utilises

- `EncoderConduite`

### Deroulement principal

1. Le backend recoit une demande d'encodage de conduite.
2. Le validateur HTTP construit un `EncoderConduiteInput`.
3. Le use case relit le `ResultatBulletinEleve` par son identifiant reel.
4. Si le resultat est introuvable, le backend echoue.
5. Le use case revalide localement `cotes.write` avec le bon perimetre metier.
6. Le `MoteurApplicationConduite` met a jour la conduite sur la periode demandee.
7. Si une conduite existait deja, la mutation devient une modification du dernier etat.
8. Le resultat consolide est sauvegarde.
9. Une `HistoriqueEncodageConduite` immutable est persistee avec :
   - ancienne valeur
   - nouvelle valeur
   - auteur
   - date
10. Le domaine emet `ConduitePeriodeEncodee`.
11. Les evenements sont publies sur le bus si disponible.
12. Le resultat est projete en `ResultatBulletinOutput`.

### Variantes

#### Variante 1 - Premier encodage

- aucune conduite n'existe encore pour la periode
- l'historique persiste `ancienne valeur = null`

#### Variante 2 - Modification d'une conduite deja encodee

- une conduite existe deja pour la periode
- les nouveaux points remplacent les anciens
- l'auteur et la date d'encodage sont mis a jour
- l'historique persiste l'ancien et le nouveau score

#### Variante 3 - Utilisateur refuse

- `ENSEIGNANT` simple non titulaire -> refuse
- `ADMINISTRATEUR_ECOLE` -> refuse
- `DIRECTEUR_DISCIPLINE` hors section -> refuse
- `TITULAIRE` hors classe ou hors annee -> refuse

### Resultat attendu

- conduite mise a jour sur le resultat consolide
- projection `ResultatBulletinOutput` mise a jour
- evenement `ConduitePeriodeEncodee`
- historique metier immutable de conduite
- trace d'audit consultable via la lecture d'audit conduite

### Contraintes backend

- le workflow est borne a la mutation `conduite`
- `application` reste calculee automatiquement
- les lectures `GET /conduite/:idEleve` et `GET /application/:idEleve` restent encore vides
- l'autorisation est revalidee localement dans le BC
- la conduite peut etre modifiee apres premier encodage
- l'historique stocke le vrai avant/apres

### Evenements importants

- `ConduitePeriodeEncodee`

### Donnees manipulees

- `ResultatBulletinEleve`
- `ConduitePeriode`
- `HistoriqueEncodageConduite`
- `ResultatBulletinOutput`
- `AuditConduiteReadModel`

### Dependances aval eventuelles

- integration naturelle dans `PED-01` lors de la projection bulletin
- audit BC via :
  - `GET /audit/conduite`

### Sources backend

- [EncoderConduiteUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/application/use-cases/EncoderConduite/EncoderConduiteUseCase.ts)
- [AutorisationConduitePort.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/application/ports/out/AutorisationConduitePort.ts)
- [AutorisationConduiteAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationConduiteAdapter.ts)
- [MoteurApplicationConduite.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/domain/services/MoteurApplicationConduite.ts)
- [ConduitePeriode.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/domain/entities/ConduitePeriode.ts)
- [HistoriqueEncodageConduite.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/domain/entities/HistoriqueEncodageConduite.ts)
- [ConduitePeriodeEncodee.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/domain/events/ConduitePeriodeEncodee.ts)
- [AuditConduiteQuery.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/application/queries/AuditConduiteQuery.ts)
- [PostgresAuditConduiteQuery.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/infrastructure/persistence/postgres/queries/PostgresAuditConduiteQuery.ts)
- [ConduiteApplicationController.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/interfaces/http/controllers/ConduiteApplicationController.ts)
- [conduite.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/interfaces/http/routes/conduite.routes.ts)
- [AuditBulletinController.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/interfaces/http/controllers/AuditBulletinController.ts)
- [audit.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/interfaces/http/routes/audit.routes.ts)
- [security-conduite.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-conduite.integration.spec.ts)
- [ConduiteUseCases.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/tests/application/use-cases/ConduiteUseCases.spec.ts)
- [ConduiteRoutes.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/tests/interfaces/routes/ConduiteRoutes.spec.ts)
- [BulletinsEnterpriseEntities.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/tests/domain/entities/BulletinsEnterpriseEntities.spec.ts)

### Notes de lecture frontend

- `PED-07` ne doit pas etre lu comme un workflow mixte `conduite + application`
- `application` reste une projection calculee
- les ecrans futurs ne doivent donc ouvrir une action utilisateur que sur la conduite
- les lectures directes `conduite` / `application` restent encore a enrichir si l'on veut un workflow de consultation autonome

### Statut de figement

`PED-07 FIGE`

## Workflow PED-08

### Identifiant

`PED-08`

### Nom

Consulter le centre d'analyse pedagogique des resultats consolides

### Categorie

`Pedagogique`

### Niveau de criticite

`Important`

### Objectif metier

Permettre la consultation securisee du centre d'analyse pedagogique base sur `ResultatBulletinEleve`, afin d'exposer au frontend :

- le resultat consolide d'un eleve
- les diagnostics d'echec
- les non-classes
- les echecs et echecs profonds
- les cours problematiques
- les comparatifs de classes
- l'evolution des resultats
- les dossiers de perequation
- les dossiers de repechage
- les dossiers de deliberation
- les dossiers de seconde session

Lecture importante de perimetre :

- `PED-08` est un workflow de consultation et d'analyse
- il n'est pas un moteur de decision finale
- les blocs `deliberation` et `seconde session` exposent aujourd'hui des dossiers analytiques reels, pas encore des decisions finales porteuses d'un cycle autonome

### Acteur principal

`TITULAIRE` effectif

### Acteurs secondaires

- `PREFET_ETUDES`
  - lecture des classes de sa section secondaire
- `DIRECTEUR_ETUDES`
  - lecture des classes de sa section secondaire

Acteurs explicitement exclus du perimetre d'ouverture retenu :

- `ENSEIGNANT` simple non titulaire
- `ADMINISTRATEUR_ECOLE`
- `PROMOTEUR_ORGANISATION`
- `DIRECTEUR_DISCIPLINE`
- `DIRECTEUR_PRIMAIRE`
- `DIRECTEUR_MATERNELLE`
- lecture globale implicite sans perimetre de classe

### Preconditions

- un `ResultatBulletinEleve` consolide doit deja exister pour la lecture eleve
- les analyses de classe doivent disposer :
  - d'une `idClassePedagogique`
  - d'une `idAnneeScolaire`
  - d'une `codeColonne`
- les dossiers `perequation`, `repechage`, `deliberation` et `seconde session` sont limites au `SECONDAIRE`
- les criteres d'analyse pedagogique doivent etre resolvables via la configuration pedagogique parametree
- le contexte HTTP doit permettre de retrouver :
  - `idUtilisateur`
  - `idOrganisation` eventuel
  - `idEcole`

### Permissions effectives requises

Le workflow applique maintenant une lecture uniforme :

- permission `bulletins.read`
- puis revalidation locale `permission + perimetre`

Pour `TITULAIRE` :

- bonne ecole
- bonne classe
- bonne annee scolaire
- titulariat effectif actif

Pour `PREFET_ETUDES` et `DIRECTEUR_ETUDES` :

- bonne ecole
- bonne section secondaire
- bonne classe resolue dans cette section

Point important :

- `consulterResultat`
- `consulterDiagnostics`
- `consulterNonClasses`
- et tous les blocs analytiques ajoutes

appliquent maintenant la meme doctrine locale de securite.

### Cas d'utilisation utilises

- `ConsulterResultatEleve`
- `ConsulterDiagnosticsResultat`
- `ConsulterNonClasses`
- `ConsulterEchecsClasse`
- `ConsulterEchecsProfondsClasse`
- `ConsulterCoursProblematique`
- `ConsulterEvolutionResultat`
- `ConsulterComparatifClasses`
- `ConsulterPerequationClasse`
- `ConsulterRepechageClasse`
- `ConsulterDeliberationClasse`
- `ConsulterSecondeSessionClasse`

### Deroulement principal

Le deroulement principal retenu pour PED-08 est celui d'un acteur pedagogique autorise qui consulte le centre d'analyse d'un eleve ou d'une classe.

1. Le backend recoit une demande de lecture dans l'espace `resultats`.
2. Le controleur route la demande vers le use case ou la lecture analytique adaptee.
3. Si la demande vise un resultat eleve, le backend relit le vrai `ResultatBulletinEleve`.
4. Si le resultat est introuvable, le backend echoue.
5. Le use case revalide localement la consultation avec :
   - `bulletins.read`
   - le bon perimetre ecole / classe / annee
   - la restriction sectionnelle quand elle s'applique
6. Pour les vues analytiques de classe, le backend lit les donnees specialisees deja consolidees :
   - echecs
   - echecs profonds
   - cours problematiques
   - comparatif
   - evolution
   - non-classes
7. Pour les vues secondaires, le backend applique en plus la contrainte :
   - `SECONDAIRE` uniquement
8. Les donnees relues sont projetees en read models et sorties HTTP stables.
9. Le frontend recoit un espace de consultation coherent, sans mutation ni decision finale.

### Variantes

#### Variante 1 - Consultation du resultat consolide eleve

- route :
  - `GET /resultats/:idEleve/:idAnneeScolaire`
- retourne un `ResultatBulletinOutput`

#### Variante 2 - Consultation des diagnostics d'echec

- route :
  - `GET /resultats/diagnostics`
- relit les diagnostics reellement portes par le resultat consolide

#### Variante 3 - Consultation des non-classes

- route :
  - `GET /resultats/non-classes`
- relit les non-classes de la classe et de la colonne demandees

#### Variante 4 - Consultation des analyses de base

- routes :
  - `GET /resultats/echecs`
  - `GET /resultats/echecs-profonds`
  - `GET /resultats/cours-problematiques`
  - `GET /resultats/comparatif-classes`
  - `GET /resultats/evolution/:idEleve/:idAnneeScolaire`

#### Variante 5 - Consultation des dossiers du secondaire

- routes :
  - `GET /resultats/perequation`
  - `GET /resultats/repechage`
  - `GET /resultats/deliberation`
  - `GET /resultats/seconde-session`
- refusees hors `SECONDAIRE`

#### Variante 6 - Utilisateur non autorise localement

- `ENSEIGNANT` simple non titulaire -> refuse
- acteur hors section -> refuse
- `TITULAIRE` hors classe ou hors annee -> refuse

### Resultat attendu

En sortie de PED-08, le backend doit produire :

- un `ResultatBulletinOutput` pour la lecture eleve
- des read models d'analyse pedagogique pour les listes specialisees
- une exposition HTTP stable pour tout l'espace `resultats`
- une lecture uniformement securisee par `permission + perimetre`

### Contraintes backend

- `ResultatBulletinEleve` est le centre metier reel de l'analyse
- la route principale `resultats` lit bien maintenant le resultat consolide, pas le bulletin
- les criteres d'analyse pedagogique sont maintenant parametres, plus portes en dur dans le moteur
- les analyses de base reutilisent les diagnostics et snapshots deja presents
- les vues `perequation`, `repechage`, `deliberation` et `seconde session` sont bornees au `SECONDAIRE`
- l'espace `resultats` reste un espace de lecture
- il n'existe pas encore de moteur complet de decision finale pour :
  - deliberation
  - seconde session

### Evenements importants

Aucun evenement metier nouveau n'est emis par PED-08 lui-meme, car il s'agit d'un workflow de consultation.

Les donnees exposees proviennent en revanche de mutations et recalculs deja historises en amont :

- recalcul de resultat
- declaration non-classe
- encodage conduite
- generation bulletin
- generation proclamation

### Donnees manipulees

- `ResultatBulletinEleve`
- `ResultatColonneBulletin`
- `DiagnosticEchec`
- `SnapshotResultatBulletin`
- `ConduitePeriode`
- `ApplicationPeriode`
- `ResultatBulletinOutput`
- `DiagnosticEchecReadModel`
- `NonClasseReadModel`
- read models analytiques :
  - echecs
  - echecs profonds
  - cours problematiques
  - comparatif classes
  - evolution
  - perequation
  - repechage
  - deliberation
  - seconde session

### Dependances aval eventuelles

- consommateur frontend principal :
  - ecrans de consultation et d'analyse pedagogique
- dependances pedagogiques amont reelles :
  - `ResultatBulletinEleve`
  - `DiagnosticEchec`
  - `SnapshotResultatBulletin`
- dependance securite reelle :
  - `shared/security`
  - `AutorisationConsultationStatistiquesAdapter`
- dependance academique de parametrage :
  - `CriteresAnalysePedagogique`
- dependance sectionnelle :
  - resolution de la section reelle de la classe pour les blocs secondaires

### Sources backend

- agregat et sorties :
  - [ResultatBulletinEleve.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/domain/aggregates/ResultatBulletinEleve.ts)
  - [ResultatBulletinOutput.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/application/dto/output/ResultatBulletinOutput.ts)
- cas d'utilisation :
  - [ConsulterResultatEleveUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/application/use-cases/ConsulterResultatEleve/ConsulterResultatEleveUseCase.ts)
  - [ConsulterDiagnosticsResultatUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/application/use-cases/ConsulterDiagnosticsResultat/ConsulterDiagnosticsResultatUseCase.ts)
  - [ConsulterNonClassesUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/application/use-cases/ConsulterNonClasses/ConsulterNonClassesUseCase.ts)
  - [ConsulterEchecsClasseUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/application/use-cases/ConsulterEchecsClasse/ConsulterEchecsClasseUseCase.ts)
  - [ConsulterEchecsProfondsClasseUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/application/use-cases/ConsulterEchecsProfondsClasse/ConsulterEchecsProfondsClasseUseCase.ts)
  - [ConsulterCoursProblematiqueUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/application/use-cases/ConsulterCoursProblematiques/ConsulterCoursProblematiqueUseCase.ts)
  - [ConsulterEvolutionResultatUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/application/use-cases/ConsulterEvolutionResultat/ConsulterEvolutionResultatUseCase.ts)
  - [ConsulterComparatifClassesUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/application/use-cases/ConsulterComparatifClasses/ConsulterComparatifClassesUseCase.ts)
  - [ConsulterPerequationClasseUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/application/use-cases/ConsulterPerequationClasse/ConsulterPerequationClasseUseCase.ts)
  - [ConsulterRepechageClasseUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/application/use-cases/ConsulterRepechageClasse/ConsulterRepechageClasseUseCase.ts)
  - [ConsulterDeliberationClasseUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/application/use-cases/ConsulterDeliberationClasse/ConsulterDeliberationClasseUseCase.ts)
  - [ConsulterSecondeSessionClasseUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/application/use-cases/ConsulterSecondeSessionClasse/ConsulterSecondeSessionClasseUseCase.ts)
- interfaces HTTP :
  - [resultats.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/interfaces/http/routes/resultats.routes.ts)
  - [ResultatsBulletinController.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/interfaces/http/controllers/ResultatsBulletinController.ts)
- autorisation locale :
  - [AutorisationConsultationStatistiquesPort.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/application/ports/out/AutorisationConsultationStatistiquesPort.ts)
  - [AutorisationConsultationStatistiquesAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationConsultationStatistiquesAdapter.ts)
  - [SectionClassePedagogiqueAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/SectionClassePedagogiqueAdapter.ts)
- criteres et diagnostics :
  - [CriteresAnalysePedagogique.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/domain/entities/CriteresAnalysePedagogique.ts)
  - [MoteurDiagnosticPedagogique.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/domain/services/MoteurDiagnosticPedagogique.ts)
- preuves tests :
  - [ResultatsUseCases.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/tests/application/use-cases/ResultatsUseCases.spec.ts)
  - [ResultatsRoutes.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/tests/interfaces/routes/ResultatsRoutes.spec.ts)
  - [CriteresAnalysePedagogiqueUseCases.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/tests/application/use-cases/CriteresAnalysePedagogiqueUseCases.spec.ts)
  - [security-resultats.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-resultats.integration.spec.ts)

### Notes de lecture frontend

- `PED-08` doit etre lu comme le centre d'analyse pedagogique de `ResultatBulletinEleve`
- il ne faut pas le confondre avec :
  - `PED-01` bulletin
  - `PED-03` proclamation
  - `PED-05` statistiques consolidees
- `PED-08` expose une lecture fine orientee eleve et classe, la ou :
- `PED-05` expose surtout des consolidations statistiques
- les blocs `deliberation` et `seconde session` sont documentables parce qu'ils existent reellement en lecture analytique
- ils ne doivent pas etre presentes comme des moteurs complets de decision finale tant qu'aucun backend ne porte encore ce cycle autonome

### Statut de figement

`PED-08 FIGE`
