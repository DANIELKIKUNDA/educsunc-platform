# Persistance du BC Scolarite Eleves

Le BC `scolarite-eleves` utilise une infrastructure PostgreSQL dediee, organisee autour de depots, mappers de persistance, migrations, schemas et gestionnaires de transaction.

## Tables principales

Le fichier `SchemasScolariteEleves.ts` centralise les noms techniques suivants :

- `eleves`
- `familles`
- `inscriptions`
- `affectations`
- `parcours`

## Migrations

Les migrations presentes dans `infrastructure/persistence/postgres/migrations` couvrent actuellement :

- `001_create_eleves.sql`
- `002_create_familles.sql`
- `003_create_inscriptions.sql`
- `004_create_affectations.sql`
- `005_create_parcours.sql`

Elles installent la structure de base du BC sur PostgreSQL reel.

## Depots PostgreSQL

Les depots concrets principaux sont :

- `PostgresEleveDepot`
- `PostgresFamilleDepot`
- `PostgresInscriptionDepot`
- `PostgresAffectationDepot`
- `PostgresParcoursDepot`

Ils implementent les contrats du domaine :

- `DepotEleve`
- `DepotFamille`
- `DepotInscriptionScolaire`
- `DepotAffectationClasse`
- `DepotParcoursScolaireEleve`

## Acces lecture et transaction

La fabrique `FabriqueInfrastructurePostgresScolariteEleves` construit :

- le pool PostgreSQL ;
- le client de lecture ;
- le gestionnaire de transaction ;
- l'unite de travail PostgreSQL.

Les briques associees incluent notamment :

- `ClientPoolPostgresScolariteEleves`
- `ClientPostgresScolariteEleves`
- `PostgresUnitOfWork`
- `TransactionManager`
- `AdaptateurClientTransactionPoolPostgresScolariteEleves`

## Tenant et session PostgreSQL

La fabrique de persistance peut recevoir `ScolariteTenantContext`. Dans ce cas, elle injecte des parametres de session relies a :

- l'ecole courante ;
- l'organisation ;
- le mode de lecture organisationnelle.

Cela permet de faire respecter l'isolation tenant jusque dans les acces PostgreSQL.

## Requetes consolidees

Le dossier `infrastructure/persistence/queries` expose aussi un repository specialise :

- `StatistiquesScolariteQueryRepository`

Il sert les lectures consolidees et tableaux de bord sans deplacer cette logique dans les agregats.
