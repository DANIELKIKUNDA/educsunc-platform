import { obtenirPoolPostgresAuth } from '../src/shared/auth/infrastructure/persistence/postgres/ClientPoolPostgresAuth';
import { MigrateurPostgresAudit } from '../src/shared/audit/infrastructure/persistence/postgres/MigrateurPostgresAudit';
import { PostgresAuditReadRepository } from '../src/shared/audit/infrastructure/persistence/postgres/repositories/PostgresAuditReadRepository';

const TOTAL_EVENEMENTS = 36;
const PREFIXE = 'l6-e2e-platform';

async function preparer(): Promise<void> {
  const pool = obtenirPoolPostgresAuth();
  try {
    await new MigrateurPostgresAudit(pool).executerToutes();
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const maintenant = Date.now();
      for (let index = 0; index < TOTAL_EVENEMENTS; index += 1) {
        const id = `${PREFIXE}-${String(index + 1).padStart(3, '0')}`;
        const dateAction = new Date(maintenant - index * 1_000).toISOString();
        const action = index % 2 === 0 ? 'AUDIT_CONSULTE' : 'EXPORT_GENERE';
        const type = index % 2 === 0 ? 'CONSULTATION_SENSIBLE' : 'EXPORT';
        await client.query(
          `INSERT INTO audit_entries (
             id_audit_entry,action,type_principal,gravite,niveau,resultat,request_id,
             correlation_id,acteur_id,type_acteur,role_actif,type_ressource,id_ressource,
             scope,mode_offline,retry_count,est_replay,est_retry,source_audit,
             date_action,date_creation_audit,metadata,contexte_permissions
           ) VALUES (
             $1,$2,$3,'ELEVEE','CRITIQUE','SUCCESS',$4,$5,'l6-certification',
             'SYSTEME','MANAGER_SYSTEME','AUDIT',$6,'PLATEFORME',FALSE,0,FALSE,FALSE,
             'SYSTEM',$7,$7,$8::jsonb,$9::jsonb
           )
           ON CONFLICT (id_audit_entry) DO NOTHING`,
          [
            id,
            action,
            type,
            `${PREFIXE}-request-${index + 1}`,
            `${PREFIXE}-correlation-${(index % 6) + 1}`,
            `${PREFIXE}-resource-${index + 1}`,
            dateAction,
            JSON.stringify({ certification: 'L6', index: index + 1 }),
            JSON.stringify({ rolesActifs: ['MANAGER_SYSTEME'], permissionsActives: ['audit.read'], scopesActifs: ['PLATEFORME'] }),
          ],
        );
        for (const categorie of [type, 'SYSTEME']) {
          await client.query(
            `INSERT INTO audit_categories(audit_entry_id,categorie)
             VALUES ($1,$2) ON CONFLICT (audit_entry_id,categorie) DO NOTHING`,
            [id, categorie],
          );
        }
      }
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    const verification = await pool.query<{ total: number }>(
      `SELECT COUNT(*)::int AS total FROM audit_entries
       WHERE id_audit_entry LIKE $1 AND scope='PLATEFORME'`,
      [`${PREFIXE}-%`],
    );
    const total = verification.rows[0]?.total ?? 0;
    if (total < TOTAL_EVENEMENTS) {
      throw new Error(`Le jeu Audit L6 est incomplet: ${total}/${TOTAL_EVENEMENTS}.`);
    }
    const lecture = await new PostgresAuditReadRepository().rechercher(
      { scope: 'PLATEFORME' },
      { limite: 25 },
    );
    if (lecture.items.length !== 25 || !lecture.hasNextPage) {
      throw new Error(`La lecture Audit L6 est incomplete: ${lecture.items.length}/25.`);
    }
    process.stdout.write(`Jeu Audit L6 pret: ${total} evenements Plateforme.\n`);
  } finally {
    await pool.end();
  }
}

preparer().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
