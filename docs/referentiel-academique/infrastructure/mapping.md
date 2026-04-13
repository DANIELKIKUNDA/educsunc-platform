# Mapping PostgreSQL du BC Referentiel Academique

Les mappers PostgreSQL assurent la traduction entre lignes SQL et objets du domaine. Ils appartiennent a l'infrastructure et ne doivent pas contenir de regles metier nouvelles.

## Organisation des mappers

Fichiers principaux :

- `BaseMapperPostgresReferentielAcademique`
- `MappersStructuresGlobalesPostgres`
- `MappersReferentielsPostgres`
- `MappersExploitationLocalePostgres`

## BaseMapperPostgresReferentielAcademique

Role :

- Centraliser les lectures de champs SQL.
- Normaliser les types primitifs recuperes depuis PostgreSQL.
- Eviter la duplication de conversion dans les depots.

## MappersStructuresGlobalesPostgres

Role :

- Mapper les structures globales de reference.
- Reconstituer organisations, ecoles, sections, options, classes academiques et cours.

Points d'attention :

- `OptionEtude` reconstruit son code via `CodeOption`.
- `ClasseAcademique` reconstruit son ordre via `OrdreClasse`.
- Les champs optionnels restent optionnels : abreviation, type option, coordonnees, option de classe.

## MappersReferentielsPostgres

Role :

- Mapper les referentiels programmes.
- Mapper les versions de referentiel programme.
- Mapper les lignes de referentiel programme.

Points d'attention :

- Le root `ReferentielProgramme` est reconstruit avec ses versions.
- Les lignes sont rattachees aux versions.
- La version active est determinee par l'etat des versions, pas par une donnee versionnee stockee sur le root.
- Les ponderations sont reconstruites via `PonderationEvaluation`.
- Les domaines et sous-domaines de lignes de programme sont optionnels et appartiennent aux lignes.

## MappersExploitationLocalePostgres

Role :

- Mapper les annees scolaires.
- Mapper les classes pedagogiques.
- Mapper les programmes niveau et leurs lignes locales.
- Mapper les calendriers et periodes.
- Mapper les migrations, diffs et transformations de notes.

Points d'attention :

- Les statuts sont reconstruits depuis les enums du domaine.
- Les lignes locales conservent leur source, leur etat actif, leur obsolescence et leur ponderation.
- Les calendriers reconstruisent leurs periodes internes.
- Les migrations reconstruisent les lignes de diff et transformations associees.

## Regles de mapping

- Le mapping ne cree pas de comportement metier nouveau.
- Les validations des constructeurs du domaine restent appliquees lors de la reconstruction.
- Les dates SQL sont converties en objets `Date`.
- Les valeurs optionnelles SQL `NULL` deviennent `undefined` quand le domaine l'attend.
- Les identifiants SQL sont encapsules dans les value objects d'identifiant.

## Transactions

Les depots utilisent le client transactionnel courant fourni par `PostgresUnitOfWork` lorsqu'une transaction applicative est active.

Flux :

1. Le use case demande une transaction via `ServiceTransactionApplication`.
2. L'unite de travail ouvre un contexte transactionnel.
3. Les depots utilisent le client transactionnel.
4. La transaction est commit si l'operation reussit.
5. La transaction est rollback si une erreur est levee.

## Audit et idempotence

Audit :

- `ServiceJournalAuditReferentielAcademiquePostgres` ecrit dans `audit_logs`.
- Les entrees sont enrichies par le contexte tenant lorsque disponible.
- Les identifiants d'audit sont generes en UUID.

Idempotence :

- `PostgresIdempotencyStore` conserve la cle, l'operation, l'empreinte de requete, le statut, le resultat et l'expiration.
- L'executeur HTTP idempotent s'appuie sur ce store.
