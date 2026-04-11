import { InfrastructureError } from '../../../../../../shared/exceptions/InfrastructureError';
import {
  DefinitionColonnePostgres,
  DefinitionIndexPostgres,
  DefinitionReferencePostgres,
  SchemaTablePostgres,
  TypeColonnePostgres,
} from '../schemas';

// Ce contrat represente une migration PostgreSQL executable du BC Referentiel Academique.
export interface MigrationPostgresReferentielAcademique {
  readonly idMigration: string;
  readonly description: string;

  // Cette methode genere les requetes SQL de montee.
  genererSqlMontee(): readonly string[];

  // Cette methode genere les requetes SQL de descente.
  genererSqlDescente(): readonly string[];
}

// Cette classe genere une migration SQL a partir des schemas normalises du BC.
export class MigrationSchemaPostgresReferentielAcademique
  implements MigrationPostgresReferentielAcademique
{
  public readonly idMigration: string;
  public readonly description: string;
  private readonly schemasTables: readonly SchemaTablePostgres[];

  // Ce constructeur initialise la migration a partir d'un groupe coherent de tables.
  constructor(
    idMigration: string,
    description: string,
    schemasTables: readonly SchemaTablePostgres[],
  ) {
    this.idMigration = idMigration;
    this.description = description;
    this.schemasTables = [...schemasTables];
  }

  // Cette methode genere les requetes SQL de creation du groupe de tables.
  public genererSqlMontee(): readonly string[] {
    return this.schemasTables.flatMap((schemaTable) => this.genererSqlCreationTable(schemaTable));
  }

  // Cette methode genere les requetes SQL de suppression du groupe de tables en ordre inverse.
  public genererSqlDescente(): readonly string[] {
    return [...this.schemasTables]
      .reverse()
      .map((schemaTable) => (
        `DROP TABLE IF EXISTS ${this.protegerIdentifiant(schemaTable.nomTable)} CASCADE;`
      ));
  }

  private genererSqlCreationTable(schemaTable: SchemaTablePostgres): readonly string[] {
    const definitionsColonnes = schemaTable.colonnes.map((colonne) => this.genererDefinitionColonne(colonne));
    const definitionClePrimaire =
      `PRIMARY KEY (${schemaTable.clePrimaire.map((colonne) => this.protegerIdentifiant(colonne)).join(', ')})`;
    const definitionsReferences = schemaTable.references.map((reference) => (
      this.genererDefinitionReference(schemaTable.nomTable, reference)
    ));
    const creationTable = [
      `CREATE TABLE IF NOT EXISTS ${this.protegerIdentifiant(schemaTable.nomTable)} (`,
      [...definitionsColonnes, definitionClePrimaire, ...definitionsReferences].join(',\n  '),
      ');',
    ].join('\n  ');
    const commentairesTable = this.genererCommentairesTable(schemaTable);
    const indexes = schemaTable.index.flatMap((definitionIndex) => (
      this.genererSqlIndex(schemaTable.nomTable, definitionIndex)
    ));

    return [creationTable, ...commentairesTable, ...indexes];
  }

  private genererDefinitionColonne(colonne: DefinitionColonnePostgres): string {
    const typeSql = this.genererTypeSql(colonne);
    const segments = [
      this.protegerIdentifiant(colonne.nom),
      typeSql,
      colonne.obligatoire ? 'NOT NULL' : 'NULL',
    ];

    if (colonne.valeurParDefautSql !== undefined) {
      segments.push(`DEFAULT ${colonne.valeurParDefautSql}`);
    }

    return segments.join(' ');
  }

  private genererDefinitionReference(
    nomTable: string,
    reference: DefinitionReferencePostgres,
  ): string {
    const nomContrainte = `fk_${nomTable}_${reference.colonneLocale}`;

    return [
      `CONSTRAINT ${this.protegerIdentifiant(nomContrainte)}`,
      `FOREIGN KEY (${this.protegerIdentifiant(reference.colonneLocale)})`,
      `REFERENCES ${this.protegerIdentifiant(reference.tableReferencee)}`,
      `(${this.protegerIdentifiant(reference.colonneReferencee)})`,
      `ON DELETE ${reference.actionSuppression.toUpperCase().replace('_', ' ')}`,
      `ON UPDATE ${reference.actionMiseAJour.toUpperCase().replace('_', ' ')}`,
    ].join(' ');
  }

  private genererCommentairesTable(schemaTable: SchemaTablePostgres): readonly string[] {
    const commentaires: string[] = [
      `COMMENT ON TABLE ${this.protegerIdentifiant(schemaTable.nomTable)} IS '${this.echapperCommentaire(`${schemaTable.description} | isolation=${schemaTable.strategieIsolationTenant}`)}';`,
    ];

    for (const colonne of schemaTable.colonnes) {
      commentaires.push(
        `COMMENT ON COLUMN ${this.protegerIdentifiant(schemaTable.nomTable)}.${this.protegerIdentifiant(colonne.nom)} IS '${this.echapperCommentaire(colonne.commentaire)}';`,
      );
    }

    return commentaires;
  }

  private genererSqlIndex(
    nomTable: string,
    definitionIndex: DefinitionIndexPostgres,
  ): readonly string[] {
    const prefixeUnicite = definitionIndex.unique ? 'UNIQUE ' : '';
    const clauseCondition = definitionIndex.conditionSql === undefined
      ? ''
      : ` WHERE ${definitionIndex.conditionSql}`;
    const creationIndex = [
      `CREATE ${prefixeUnicite}INDEX IF NOT EXISTS ${this.protegerIdentifiant(definitionIndex.nom)}`,
      `ON ${this.protegerIdentifiant(nomTable)}`,
      `(${definitionIndex.colonnes.map((colonne) => this.protegerIdentifiant(colonne)).join(', ')})${clauseCondition};`,
    ].join(' ');
    const commentaireIndex =
      `COMMENT ON INDEX ${this.protegerIdentifiant(definitionIndex.nom)} IS '${this.echapperCommentaire(definitionIndex.commentaire)}';`;

    return [creationIndex, commentaireIndex];
  }

  private genererTypeSql(colonne: DefinitionColonnePostgres): string {
    switch (colonne.type as TypeColonnePostgres) {
      case 'uuid':
      case 'text':
      case 'integer':
      case 'numeric':
      case 'boolean':
      case 'date':
      case 'timestamptz':
      case 'jsonb':
        return colonne.type;
      case 'varchar':
        if (colonne.taille === undefined) {
          throw new InfrastructureError(
            `La colonne "${colonne.nom}" doit definir une taille pour le type varchar.`,
            'MIGRATION_POSTGRES_TAILLE_VARCHAR_ABSENTE',
            {
              colonne: colonne.nom,
            },
          );
        }

        return `varchar(${colonne.taille})`;
      default:
        throw new InfrastructureError(
          `Le type PostgreSQL "${String(colonne.type)}" n'est pas supporte par le generateur.`,
          'MIGRATION_POSTGRES_TYPE_INVALIDE',
          {
            colonne: colonne.nom,
            type: colonne.type,
          },
        );
    }
  }

  private protegerIdentifiant(identifiant: string): string {
    if (!/^[a-z_][a-z0-9_]*$/i.test(identifiant)) {
      throw new InfrastructureError(
        `L'identifiant SQL "${identifiant}" est invalide pour une migration.`,
        'MIGRATION_POSTGRES_IDENTIFIANT_INVALIDE',
        {
          identifiant,
        },
      );
    }

    return `"${identifiant}"`;
  }

  private echapperCommentaire(commentaire: string): string {
    return commentaire.replace(/'/g, "''");
  }
}
