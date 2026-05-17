// Ce type liste les types PostgreSQL utilises par les tables du BC Paiements.
export type TypeColonnePostgresPaiements =
  | 'uuid'
  | 'varchar'
  | 'text'
  | 'integer'
  | 'numeric'
  | 'boolean'
  | 'date'
  | 'timestamptz'
  | 'jsonb';

// Ce type decrit la strategie d'isolation tenant d'une table.
export type StrategieIsolationTenantPostgresPaiements =
  | 'non_applicable'
  | 'directe';

// Ce type decrit une action de reference PostgreSQL.
export type ActionReferencePostgresPaiements =
  | 'restrict'
  | 'cascade'
  | 'set_null'
  | 'no_action';

// Cette interface decrit une colonne PostgreSQL du BC.
export interface DefinitionColonnePostgresPaiements {
  nom: string;
  type: TypeColonnePostgresPaiements;
  obligatoire: boolean;
  taille?: number;
  valeurParDefautSql?: string;
  commentaire: string;
}

// Cette interface decrit une cle etrangere PostgreSQL.
export interface DefinitionReferencePostgresPaiements {
  colonneLocale: string;
  tableReferencee: string;
  colonneReferencee: string;
  actionSuppression: ActionReferencePostgresPaiements;
  actionMiseAJour: ActionReferencePostgresPaiements;
  commentaire: string;
}

// Cette interface decrit un index PostgreSQL.
export interface DefinitionIndexPostgresPaiements {
  nom: string;
  colonnes: readonly string[];
  unique: boolean;
  conditionSql?: string;
  commentaire: string;
}

// Cette interface decrit une table PostgreSQL complete du BC.
export interface SchemaTablePostgresPaiements {
  nomTable: string;
  description: string;
  strategieIsolationTenant: StrategieIsolationTenantPostgresPaiements;
  colonneTenant?: string;
  clePrimaire: readonly string[];
  colonnes: readonly DefinitionColonnePostgresPaiements[];
  references: readonly DefinitionReferencePostgresPaiements[];
  index: readonly DefinitionIndexPostgresPaiements[];
}

// Cette fonction centralise la creation d'un schema de table.
export function creerSchemaTablePostgresPaiements(
  schema: SchemaTablePostgresPaiements,
): SchemaTablePostgresPaiements {
  return schema;
}
