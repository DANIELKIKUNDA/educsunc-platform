import type { PoolClient } from 'pg';
import type { SchemaTablePostgresPaiements } from '../schemas/SchemaPostgres';

// Cette fonction cree physiquement une table, ses references et ses index a partir du schema decrit.
export async function creerTableDepuisSchemaPaiements(
  client: PoolClient,
  schema: SchemaTablePostgresPaiements,
): Promise<void> {
  const colonnes = schema.colonnes.map((colonne) => {
    const taille = colonne.taille === undefined ? '' : `(${colonne.taille})`;
    const nullite = colonne.obligatoire ? 'NOT NULL' : 'NULL';
    const defaut =
      colonne.valeurParDefautSql === undefined
        ? ''
        : ` DEFAULT ${colonne.valeurParDefautSql}`;

    return `"${colonne.nom}" ${colonne.type}${taille} ${nullite}${defaut}`;
  });
  const clePrimaire = `PRIMARY KEY (${schema.clePrimaire.map((colonne) => `"${colonne}"`).join(', ')})`;

  await client.query(
    `CREATE TABLE IF NOT EXISTS "${schema.nomTable}" (${[...colonnes, clePrimaire].join(', ')})`,
  );

  for (const reference of schema.references) {
    const nomContrainte = `fk_${schema.nomTable}_${reference.colonneLocale}`;
    await client.query(
      [
        `DO $$ BEGIN`,
        `IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '${nomContrainte}') THEN`,
        `ALTER TABLE "${schema.nomTable}" ADD CONSTRAINT "${nomContrainte}" FOREIGN KEY ("${reference.colonneLocale}") REFERENCES "${reference.tableReferencee}"("${reference.colonneReferencee}") ON DELETE ${reference.actionSuppression.toUpperCase()} ON UPDATE ${reference.actionMiseAJour.toUpperCase()};`,
        'END IF;',
        'END $$;',
      ].join(' '),
    );
  }

  for (const index of schema.index) {
    const unicite = index.unique ? 'UNIQUE ' : '';
    const condition = index.conditionSql === undefined ? '' : ` WHERE ${index.conditionSql}`;

    await client.query(
      `CREATE ${unicite}INDEX IF NOT EXISTS "${index.nom}" ON "${schema.nomTable}" (${index.colonnes.map((colonne) => `"${colonne}"`).join(', ')})${condition}`,
    );
  }
}
