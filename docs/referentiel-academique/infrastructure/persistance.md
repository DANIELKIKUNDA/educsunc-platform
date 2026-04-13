# Persistance du BC Referentiel Academique

L'infrastructure de persistance actuelle est PostgreSQL. Elle est encapsulee dans la couche infrastructure du BC et expose des depots conformes aux contrats du domaine.

## Composants PostgreSQL

- `ClientPoolPostgresReferentielAcademique` : acces pool PostgreSQL.
- `ClientPostgresReferentielAcademique` : contrat de client SQL.
- `BaseDepotPostgresReferentielAcademique` : base commune des depots.
- `PostgresUnitOfWork` : execution transactionnelle.
- `TransactionManager` : gestion explicite de transaction.
- `MigrateurPostgresReferentielAcademique` : execution des migrations du BC.
- `FabriqueInfrastructurePostgresReferentielAcademique` : composition de l'infrastructure PostgreSQL.

## Migrations

Migrations presentes :

- `Migration_001_TablesGlobalesReferentielAcademique`
- `Migration_002_TablesLocalesEcoleReferentielAcademique`
- `Migration_003_TablesTechniquesAssocieesReferentielAcademique`
- `Migration_004_AlignementVersionsReferentielProgramme`
- `Migration_005_NettoyageLegacyReferentielProgramme`
- `Migration_006_RlsTablesLocalesReferentielAcademique`
- `Migration_007_AjoutAbreviationOptionsEtudes`
- `Migration_008_AjoutClassificationLignesProgramme`

Role des migrations :

- Creer les tables globales de reference.
- Creer les tables locales par ecole.
- Creer les tables techniques associees.
- Aligner le modele referentiel/version/lignes.
- Nettoyer les colonnes legacy du root referentiel programme.
- Activer RLS sur les tables locales.
- Ajouter les evolutions additives de donnees de reference.

## Tables globales de reference

Les tables globales stockent les donnees partagees :

- organisations
- ecoles
- sections scolaires
- options d'etudes
- classes academiques
- referentiels cours
- referentiels programmes
- versions de referentiel programme
- lignes de referentiel programme

Principes :

- Les donnees de reference sont stables et reutilisables.
- Les versions de programme portent les lignes officielles.
- Le root `referentiels_programmes` ne porte plus les donnees versionnees legacy.

## Tables locales ecole

Les tables locales stockent les donnees dependantes d'une ecole :

- annees scolaires
- classes pedagogiques
- programmes niveau
- lignes programme niveau
- calendriers academiques
- periodes calendrier
- migrations de referentiel programme
- lignes de diff migration
- transformations de notes

Principes :

- Les tables locales portent un rattachement tenant, notamment via `id_ecole`.
- Les depots filtrent les lectures/ecritures selon le contexte tenant.
- Les contraintes SQL completent les invariants applicatifs.

## Tables techniques associees

Tables techniques notables :

- `audit_logs` : journalisation des actions critiques.
- Table de stockage d'idempotence HTTP.
- Tables de suivi de migrations PostgreSQL du BC.

## Contraintes importantes

- Cles primaires sur les identifiants.
- Cles etrangeres entre agregats persistants et entites associees.
- Index d'unicite sur les codes et contextes necessaires.
- Unicite d'une annee active par ecole.
- Unicite d'une version active ou d'un code version selon le modele versionne.
- Unicite des classes pedagogiques dans un contexte ecole/annee.
- Unicite du calendrier par ecole et annee.
- Verrouillage optimiste via les champs de version metier dans les depots concernes.

## RLS PostgreSQL

La migration RLS active la securite au niveau ligne pour les tables locales.

Comportement :

- `ENABLE ROW LEVEL SECURITY`
- `FORCE ROW LEVEL SECURITY`
- Policies de lecture, insertion, mise a jour et suppression.
- Policies basees sur le tenant courant ou l'organisation selon les cas prevus.

Objectif :

- Eviter les lectures inter-ecoles.
- Renforcer l'isolation multi-tenant au niveau base, en complement du contexte applicatif.

## Role des depots

Les depots PostgreSQL traduisent les contrats domaine vers SQL.

Depots principaux :

- `DepotOrganisationPostgres`
- `DepotEcolePostgres`
- `DepotAnneeScolairePostgres`
- `DepotSectionScolairePostgres`
- `DepotOptionEtudePostgres`
- `DepotClasseAcademiquePostgres`
- `DepotClassePedagogiquePostgres`
- `DepotReferentielCoursPostgres`
- `DepotReferentielProgrammePostgres`
- `DepotVersionReferentielProgrammePostgres`
- `DepotProgrammeNiveauPostgres`
- `DepotCalendrierAcademiquePostgres`
- `DepotMigrationReferentielProgrammePostgres`

Responsabilites :

- Reconstituer les agregats depuis les lignes SQL.
- Sauvegarder les agregats et leurs entites internes.
- Appliquer les filtres tenant.
- Utiliser le client transactionnel si une transaction est active.
- Preserver les invariants de persistance sans deplacer la logique metier hors du domaine.
