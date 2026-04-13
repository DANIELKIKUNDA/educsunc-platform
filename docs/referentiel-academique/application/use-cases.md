# Use cases du BC Referentiel Academique

Les use cases orchestrent les agregats, depots, policies, moteurs et services applicatifs. Ils ne contiennent pas de logique HTTP ni de logique SQL.

## Organisations

- `CreerOrganisation` : cree une organisation apres controle d'unicite du code et du nom.
- `RenommerOrganisation` : renomme une organisation apres controle d'unicite du nom.
- `ActiverOrganisation` : active une organisation existante.
- `DesactiverOrganisation` : desactive une organisation existante.
- `ConsulterOrganisation` : charge une organisation par identifiant.
- `ListerOrganisations` : liste les organisations avec pagination.

## Ecoles

- `CreerEcole` : cree une ecole rattachee a une organisation valide.
- `RenommerEcole` : modifie le nom d'une ecole.
- `ActiverEcole` : active une ecole existante.
- `DesactiverEcole` : desactive une ecole existante.
- `ChangerModeExploitationEcole` : change le mode d'exploitation.
- `ConsulterEcole` : charge une ecole par identifiant.
- `ListerEcoles` : liste les ecoles avec pagination.
- `ListerEcolesParOrganisation` : liste les ecoles rattachees a une organisation.

## Annees scolaires

- `CreerAnneeScolaire` : cree une annee scolaire planifiee pour une ecole.
- `ActiverAnneeScolaire` : active une annee planifiee en verifiant l'absence d'autre annee active.
- `CloturerAnneeScolaire` : cloture une annee active.
- `ArchiverAnneeScolaire` : archive une annee cloturee.
- `ConsulterAnneeScolaire` : charge une annee par identifiant.
- `ConsulterAnneeActiveParEcole` : retourne l'annee active d'une ecole.
- `ListerAnneesScolairesParEcole` : liste les annees d'une ecole.
- `PreparerAnneeScolaireSuivante` : cree l'annee suivante en statut planifie si elle n'existe pas.
- `GarantirAnneeScolaireActiveParEcole` : garantit qu'une ecole dispose d'une annee active exploitable.
- `BasculerAnneeScolaire` : cloture l'annee active et active immediatement l'annee suivante.

## Structure scolaire

- `CreerSectionScolaire` : cree une section de reference.
- `CreerOptionEtude` : cree une option d'etude.
- `CreerClasseAcademique` : cree une classe academique rattachee a une section et eventuellement a une option.
- `CreerClassePedagogique` : cree une classe pedagogique locale pour une ecole, une annee et une classe academique.
- `RenommerClassePedagogique` : renomme une classe pedagogique.
- `DesactiverClassePedagogique` : desactive une classe pedagogique.
- `ArchiverClassePedagogique` : archive une classe pedagogique.
- `ListerClassesAcademiques` : liste les classes academiques.
- `ListerClassesPedagogiquesParEcoleEtAnnee` : liste les classes pedagogiques d'une ecole pour une annee.
- `ListerOptionsEtudes` : liste les options d'etudes.

## Referentiels officiels

- `ImporterSectionsDepuisJson` : importe les sections de reference depuis une structure JSON validee.
- `ImporterOptionsDepuisJson` : importe les options d'etudes.
- `ImporterClassesAcademiquesDepuisJson` : importe les classes academiques en resolvant sections et options.
- `ImporterCoursAcademiquesDepuisJson` : importe les cours officiels.
- `ImporterProgrammesAcademiquesDepuisJson` : importe les referentiels programmes et leurs versions.
- `ImporterLignesProgrammeDepuisJson` : importe ou reconstruit les lignes de programme.
- `PublierVersionReferentiel` : publie une version de referentiel programme.
- `ActiverVersionReferentiel` : active une version via le root referentiel.
- `ComparerDeuxVersionsReferentiel` : compare deux versions de referentiel.
- `ConsulterReferentielProgramme` : charge un referentiel programme complet.
- `ListerReferentielsParClasseAcademique` : liste les referentiels d'une classe academique.

## Programmes niveau

- `InitialiserProgrammeNiveau` : initialise un programme local depuis une version officielle.
- `ValiderProgrammeNiveau` : valide un programme local et produit son etat local consolide.
- `ArchiverProgrammeNiveau` : archive un programme local valide.
- `ConsulterProgrammeNiveau` : charge un programme niveau par identifiant.
- `ListerProgrammesNiveauParEcoleEtAnnee` : liste les programmes locaux d'une ecole et d'une annee.
- `ProduireEtatLocalProgramme` : produit l'etat local d'un programme deja valide.

## Calendriers academiques

- `CreerCalendrierAcademique` : cree un calendrier unique pour une ecole et une annee.
- `ModifierPeriodeCalendrier` : remplace une periode d'un calendrier non verrouille.
- `ValiderCalendrierAcademique` : verifie la coherence globale du calendrier.
- `VerrouillerCalendrierAcademique` : verrouille un calendrier apres verification.
- `ConsulterCalendrierAcademique` : charge un calendrier par identifiant.

## Migrations de referentiel

- `AnalyserMigrationReferentiel` : detecte les differences entre versions pour un programme local.
- `AppliquerMigrationReferentiel` : applique une migration analysee et met a jour le programme.
- `AnnulerMigrationReferentiel` : annule une migration.
- `RelancerRecalculApresMigration` : relance le recalcul d'une migration.
- `ConsulterRapportMigration` : retourne le rapport d'une migration.

## Regles applicatives transversales

- Les operations critiques utilisent `PolicyAudit`.
- Plusieurs commandes critiques sont executees dans une transaction applicative.
- Les operations HTTP critiques sont protegees par idempotence au niveau interface.
- L'isolation tenant est appliquee au niveau routes, contexte d'execution et depots.
