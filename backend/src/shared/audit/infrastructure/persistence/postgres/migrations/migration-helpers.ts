import type { AuditPostgresIndexDefinition } from '../indexes';
import type { AuditPostgresConstraintSchema, AuditPostgresTableSchema } from '../schemas';

function rendreContrainte(contrainte: AuditPostgresConstraintSchema): string | null {
  if (contrainte.type === 'not_null' || contrainte.type === 'append_only_guard') {
    return null;
  }
  return contrainte.expression;
}

// Cette aide transforme les schemas documentaires en SQL lisible pour les migrations.
export function construireCreateTableSql(schema: AuditPostgresTableSchema): string {
  const colonnes = schema.colonnes.map((colonne) => `  ${colonne.nom} ${colonne.definitionSql}`);
  const contraintes = schema.contraintes
    .map(rendreContrainte)
    .filter((valeur): valeur is string => typeof valeur === 'string')
    .map((contrainte) => `  ${contrainte}`);
  const corps = [...colonnes, ...contraintes].join(',\n');
  return [
    `-- ${schema.mission}`,
    `CREATE TABLE IF NOT EXISTS ${schema.table} (`,
    corps,
    ');',
  ].join('\n');
}

// Cette aide convertit les definitions d'index en SQL PostgreSQL exploitable.
export function construireCreateIndexSql(index: AuditPostgresIndexDefinition): string {
  if (index.expressionSql) {
    return index.expressionSql;
  }
  const colonnes = index.colonnes
    .map((colonne, indexColonne) => `${colonne}${index.tri?.[indexColonne] ? ` ${index.tri[indexColonne]}` : ''}`)
    .join(', ');
  const unique = index.unique ? 'UNIQUE ' : '';
  return `CREATE ${unique}INDEX IF NOT EXISTS ${index.nom} ON ${index.table} USING ${index.methode}(${colonnes});`;
}

export function construireAppendOnlyGuardSql(table: string, fonction: string): string {
  const triggerUpdate = `${table}_append_only_no_update`;
  const triggerDelete = `${table}_append_only_no_delete`;
  return [
    `DROP TRIGGER IF EXISTS ${triggerUpdate} ON ${table};`,
    `CREATE TRIGGER ${triggerUpdate}`,
    `BEFORE UPDATE ON ${table}`,
    `FOR EACH ROW EXECUTE FUNCTION ${fonction}();`,
    '',
    `DROP TRIGGER IF EXISTS ${triggerDelete} ON ${table};`,
    `CREATE TRIGGER ${triggerDelete}`,
    `BEFORE DELETE ON ${table}`,
    `FOR EACH ROW EXECUTE FUNCTION ${fonction}();`,
  ].join('\n');
}
