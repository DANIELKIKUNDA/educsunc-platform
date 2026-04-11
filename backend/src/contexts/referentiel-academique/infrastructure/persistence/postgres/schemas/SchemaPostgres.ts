// Ce type liste les types PostgreSQL utilises par les descripteurs de schema du BC.
export type TypeColonnePostgres =
  | 'uuid'
  | 'varchar'
  | 'text'
  | 'integer'
  | 'numeric'
  | 'boolean'
  | 'date'
  | 'timestamptz'
  | 'jsonb';

// Ce type decrit la categorie logique d'une table PostgreSQL du BC.
export type CategorieTablePostgres =
  | 'globale'
  | 'locale_ecole'
  | 'technique_associee';

// Ce type decrit la strategie d'isolation tenant attendue pour une table.
export type StrategieIsolationTenantPostgres =
  | 'non_applicable'
  | 'directe'
  | 'par_parent';

// Ce type liste les actions de reference PostgreSQL autorisees dans les schemas.
export type ActionReferencePostgres =
  | 'restrict'
  | 'cascade'
  | 'set_null'
  | 'no_action';

// Cette interface represente la definition d'une colonne PostgreSQL.
export interface DefinitionColonnePostgres {
  nom: string;
  type: TypeColonnePostgres;
  obligatoire: boolean;
  taille?: number;
  valeurParDefautSql?: string;
  commentaire: string;
}

// Cette interface represente une cle etrangere entre deux tables PostgreSQL.
export interface DefinitionReferencePostgres {
  colonneLocale: string;
  tableReferencee: string;
  colonneReferencee: string;
  actionSuppression: ActionReferencePostgres;
  actionMiseAJour: ActionReferencePostgres;
  commentaire: string;
}

// Cette interface represente un index PostgreSQL recommande.
export interface DefinitionIndexPostgres {
  nom: string;
  colonnes: readonly string[];
  unique: boolean;
  conditionSql?: string;
  commentaire: string;
}

// Cette interface represente un schema de table PostgreSQL exploitable par les migrations et les depots.
export interface SchemaTablePostgres {
  nomTable: string;
  categorie: CategorieTablePostgres;
  description: string;
  strategieIsolationTenant: StrategieIsolationTenantPostgres;
  colonneTenant?: string;
  clePrimaire: readonly string[];
  colonnes: readonly DefinitionColonnePostgres[];
  references: readonly DefinitionReferencePostgres[];
  index: readonly DefinitionIndexPostgres[];
}

// Cette fonction centralise la creation d'un descripteur de schema PostgreSQL.
export function creerSchemaTablePostgres(
  schemaTablePostgres: SchemaTablePostgres,
): SchemaTablePostgres {
  return schemaTablePostgres;
}
