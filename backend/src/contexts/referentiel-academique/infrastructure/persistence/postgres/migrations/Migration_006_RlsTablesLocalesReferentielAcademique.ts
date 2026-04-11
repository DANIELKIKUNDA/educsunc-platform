import { MigrationPostgresReferentielAcademique } from './MigrationPostgresReferentielAcademique';

interface DefinitionTableLocaleDirecteRls {
  nomTable: string;
  colonneTenant: string;
}

interface DefinitionTableLocaleParParentRls {
  nomTable: string;
  predicatLecture: string;
  predicatEcriture: string;
}

const tablesLocalesDirectesRls: readonly DefinitionTableLocaleDirecteRls[] = [
  { nomTable: 'annees_scolaires', colonneTenant: 'id_ecole' },
  { nomTable: 'classes_pedagogiques', colonneTenant: 'id_ecole' },
  { nomTable: 'programmes_niveau', colonneTenant: 'id_ecole' },
  { nomTable: 'calendriers_academiques', colonneTenant: 'id_ecole' },
];

const tablesLocalesParParentRls: readonly DefinitionTableLocaleParParentRls[] = [
  {
    nomTable: 'lignes_programme_niveau',
    predicatLecture: creerPredicatLectureParProgrammeNiveau('"id_programme_niveau"'),
    predicatEcriture: creerPredicatEcritureParProgrammeNiveau('"id_programme_niveau"'),
  },
  {
    nomTable: 'periodes_calendrier',
    predicatLecture: [
      'EXISTS (',
      'SELECT 1 FROM "calendriers_academiques" "parent_calendrier"',
      'WHERE "parent_calendrier"."id" = "id_calendrier_academique"',
      `AND ${creerPredicatLectureParEcole('"parent_calendrier"."id_ecole"')}`,
      ')',
    ].join(' '),
    predicatEcriture: [
      'EXISTS (',
      'SELECT 1 FROM "calendriers_academiques" "parent_calendrier"',
      'WHERE "parent_calendrier"."id" = "id_calendrier_academique"',
      `AND ${creerPredicatEcritureParEcole('"parent_calendrier"."id_ecole"')}`,
      ')',
    ].join(' '),
  },
  {
    nomTable: 'migrations_referentiel_programme',
    predicatLecture: creerPredicatLectureParProgrammeNiveau('"id_programme_niveau"'),
    predicatEcriture: creerPredicatEcritureParProgrammeNiveau('"id_programme_niveau"'),
  },
  {
    nomTable: 'lignes_diff_migration',
    predicatLecture: creerPredicatLectureParMigration('"id_migration_referentiel_programme"'),
    predicatEcriture: creerPredicatEcritureParMigration('"id_migration_referentiel_programme"'),
  },
  {
    nomTable: 'transformations_note',
    predicatLecture: creerPredicatLectureParMigration('"id_migration_referentiel_programme"'),
    predicatEcriture: creerPredicatEcritureParMigration('"id_migration_referentiel_programme"'),
  },
];

// Cette migration active le RLS PostgreSQL sur toutes les tables locales du BC.
export const migration006RlsTablesLocalesReferentielAcademique:
  MigrationPostgresReferentielAcademique = {
    idMigration: '006_rls_tables_locales_referentiel_academique',
    description: 'Activation du row level security sur les tables locales du BC.',

    genererSqlMontee(): readonly string[] {
      const requetesDirectes = tablesLocalesDirectesRls.flatMap((table) =>
        genererSqlActivationRlsTableDirecte(table),
      );
      const requetesParParent = tablesLocalesParParentRls.flatMap((table) =>
        genererSqlActivationRlsTableParParent(table),
      );

      return [
        ...requetesDirectes,
        ...requetesParParent,
      ];
    },

    genererSqlDescente(): readonly string[] {
      return [
        ...tablesLocalesParParentRls.flatMap((table) => genererSqlSuppressionRls(table.nomTable)),
        ...tablesLocalesDirectesRls.flatMap((table) => genererSqlSuppressionRls(table.nomTable)),
      ];
    },
  };

// Cette fonction genere les requetes RLS d'une table locale portant directement id_ecole.
function genererSqlActivationRlsTableDirecte(
  definitionTable: DefinitionTableLocaleDirecteRls,
): readonly string[] {
  const predicatLecture = creerPredicatLectureParEcole(
    `"${definitionTable.colonneTenant}"`,
  );
  const predicatEcriture = creerPredicatEcritureParEcole(
    `"${definitionTable.colonneTenant}"`,
  );

  return genererSqlActivationRls(
    definitionTable.nomTable,
    predicatLecture,
    predicatEcriture,
  );
}

// Cette fonction genere les requetes RLS d'une table locale isolee par son parent.
function genererSqlActivationRlsTableParParent(
  definitionTable: DefinitionTableLocaleParParentRls,
): readonly string[] {
  return genererSqlActivationRls(
    definitionTable.nomTable,
    definitionTable.predicatLecture,
    definitionTable.predicatEcriture,
  );
}

// Cette fonction genere toutes les policies RLS utiles a une table donnee.
function genererSqlActivationRls(
  nomTable: string,
  predicatLecture: string,
  predicatEcriture: string,
): readonly string[] {
  const nomPolicyLecture = `rls_${nomTable}_lecture`;
  const nomPolicyInsertion = `rls_${nomTable}_insertion`;
  const nomPolicyMiseAJour = `rls_${nomTable}_mise_a_jour`;
  const nomPolicySuppression = `rls_${nomTable}_suppression`;

  return [
    ...genererSqlSuppressionPolicies(nomTable),
    `ALTER TABLE "${nomTable}" ENABLE ROW LEVEL SECURITY;`,
    `ALTER TABLE "${nomTable}" FORCE ROW LEVEL SECURITY;`,
    [
      `CREATE POLICY "${nomPolicyLecture}" ON "${nomTable}"`,
      `FOR SELECT USING (${predicatLecture});`,
    ].join(' '),
    [
      `CREATE POLICY "${nomPolicyInsertion}" ON "${nomTable}"`,
      `FOR INSERT WITH CHECK (${predicatEcriture});`,
    ].join(' '),
    [
      `CREATE POLICY "${nomPolicyMiseAJour}" ON "${nomTable}"`,
      `FOR UPDATE USING (${predicatEcriture}) WITH CHECK (${predicatEcriture});`,
    ].join(' '),
    [
      `CREATE POLICY "${nomPolicySuppression}" ON "${nomTable}"`,
      `FOR DELETE USING (${predicatEcriture});`,
    ].join(' '),
  ];
}

// Cette fonction genere la suppression complete du RLS d'une table.
function genererSqlSuppressionRls(nomTable: string): readonly string[] {
  return [
    ...genererSqlSuppressionPolicies(nomTable),
    `ALTER TABLE "${nomTable}" NO FORCE ROW LEVEL SECURITY;`,
    `ALTER TABLE "${nomTable}" DISABLE ROW LEVEL SECURITY;`,
  ];
}

// Cette fonction supprime defensivement toutes les policies attendues d'une table.
function genererSqlSuppressionPolicies(nomTable: string): readonly string[] {
  return [
    `DROP POLICY IF EXISTS "rls_${nomTable}_lecture" ON "${nomTable}";`,
    `DROP POLICY IF EXISTS "rls_${nomTable}_insertion" ON "${nomTable}";`,
    `DROP POLICY IF EXISTS "rls_${nomTable}_mise_a_jour" ON "${nomTable}";`,
    `DROP POLICY IF EXISTS "rls_${nomTable}_suppression" ON "${nomTable}";`,
  ];
}

// Cette fonction genere le predicat de lecture applicable a une expression id_ecole.
function creerPredicatLectureParEcole(expressionIdEcole: string): string {
  return [
    '(',
    `${expressionTenantCourant()} IS NOT NULL`,
    `AND ${expressionIdEcole} = ${expressionTenantCourant()}`,
    ')',
    'OR',
    '(',
    `${expressionLectureOrganisationnelle()} = 'true'`,
    `AND ${expressionOrganisationCourante()} IS NOT NULL`,
    'AND EXISTS (',
    'SELECT 1 FROM "ecoles" "ecole_organisationnelle"',
    `WHERE "ecole_organisationnelle"."id" = ${expressionIdEcole}`,
    `AND "ecole_organisationnelle"."id_organisation" = ${expressionOrganisationCourante()}`,
    ')',
    ')',
  ].join(' ');
}

// Cette fonction genere le predicat d'ecriture applicable a une expression id_ecole.
function creerPredicatEcritureParEcole(expressionIdEcole: string): string {
  return [
    `${expressionTenantCourant()} IS NOT NULL`,
    `AND ${expressionIdEcole} = ${expressionTenantCourant()}`,
  ].join(' ');
}

// Cette fonction genere le predicat de lecture pour une table fille de programme niveau.
function creerPredicatLectureParProgrammeNiveau(expressionIdProgrammeNiveau: string): string {
  return [
    'EXISTS (',
    'SELECT 1 FROM "programmes_niveau" "parent_programme_niveau"',
    `WHERE "parent_programme_niveau"."id" = ${expressionIdProgrammeNiveau}`,
    `AND ${creerPredicatLectureParEcole('"parent_programme_niveau"."id_ecole"')}`,
    ')',
  ].join(' ');
}

// Cette fonction genere le predicat d'ecriture pour une table fille de programme niveau.
function creerPredicatEcritureParProgrammeNiveau(expressionIdProgrammeNiveau: string): string {
  return [
    'EXISTS (',
    'SELECT 1 FROM "programmes_niveau" "parent_programme_niveau"',
    `WHERE "parent_programme_niveau"."id" = ${expressionIdProgrammeNiveau}`,
    `AND ${creerPredicatEcritureParEcole('"parent_programme_niveau"."id_ecole"')}`,
    ')',
  ].join(' ');
}

// Cette fonction genere le predicat de lecture pour une table fille de migration.
function creerPredicatLectureParMigration(expressionIdMigration: string): string {
  return [
    'EXISTS (',
    'SELECT 1',
    'FROM "migrations_referentiel_programme" "parent_migration"',
    'INNER JOIN "programmes_niveau" "parent_programme_niveau"',
    'ON "parent_programme_niveau"."id" = "parent_migration"."id_programme_niveau"',
    `WHERE "parent_migration"."id" = ${expressionIdMigration}`,
    `AND ${creerPredicatLectureParEcole('"parent_programme_niveau"."id_ecole"')}`,
    ')',
  ].join(' ');
}

// Cette fonction genere le predicat d'ecriture pour une table fille de migration.
function creerPredicatEcritureParMigration(expressionIdMigration: string): string {
  return [
    'EXISTS (',
    'SELECT 1',
    'FROM "migrations_referentiel_programme" "parent_migration"',
    'INNER JOIN "programmes_niveau" "parent_programme_niveau"',
    'ON "parent_programme_niveau"."id" = "parent_migration"."id_programme_niveau"',
    `WHERE "parent_migration"."id" = ${expressionIdMigration}`,
    `AND ${creerPredicatEcritureParEcole('"parent_programme_niveau"."id_ecole"')}`,
    ')',
  ].join(' ');
}

// Cette fonction retourne l'expression SQL du tenant courant de session.
function expressionTenantCourant(): string {
  return `NULLIF(current_setting('educsyn.tenant_id', true), '')::uuid`;
}

// Cette fonction retourne l'expression SQL de l'organisation courante de session.
function expressionOrganisationCourante(): string {
  return `NULLIF(current_setting('educsyn.organisation_id', true), '')::uuid`;
}

// Cette fonction retourne l'expression SQL du flag de lecture organisationnelle de session.
function expressionLectureOrganisationnelle(): string {
  return `COALESCE(NULLIF(current_setting('educsyn.lecture_organisationnelle', true), ''), 'false')`;
}
