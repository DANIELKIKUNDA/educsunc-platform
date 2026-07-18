import { randomUUID } from 'node:crypto';
import { MigrateurPostgresAudit } from '../../shared/audit/infrastructure';
import { PostgresAuditDocumentStore } from '../../shared/audit/infrastructure/persistence/postgres/repositories/PostgresAuditDocumentStore';
import { MigrateurPostgresAuth, obtenirPoolPostgresAuth } from '../../shared/auth/infrastructure';
import { Role } from '../../shared/security/domain';
import { MigrateurPostgresSecurity, PostgresRoleRepository, SecurityAuditInfrastructureService } from '../../shared/security/infrastructure';

async function certifier(): Promise<void> {
  const pool = obtenirPoolPostgresAuth();
  try {
    await new MigrateurPostgresAuth(pool).executerToutes();
    await new MigrateurPostgresAudit(pool).executerToutes();
    await new MigrateurPostgresSecurity(pool).executerToutes();
    // Une seconde exécution certifie l'idempotence des migrations sur une base déjà existante.
    await new MigrateurPostgresAudit(pool).executerToutes();
    await new MigrateurPostgresSecurity(pool).executerToutes();

    const suffixe = randomUUID().replaceAll('-', '').slice(0, 12).toUpperCase();
    const codeRole = `CUSTOM_CERT_${suffixe}`;
    const role = Role.creer({
      codeRole, nomRole: 'Certification temporaire', niveauAcces: 'PLATEFORME',
      permissions: ['security.center.read'], creePar: 'security-certification',
    });
    const repository = new PostgresRoleRepository();
    await repository.sauvegarder(role);
    const relu = await new PostgresRoleRepository().trouverParCode(codeRole);
    if (!relu) throw new Error('La relecture durable du role de certification a echoue.');
    relu.verifierPermission('security.center.read');

    const client = await pool.connect();
    let rollbackCertifie = false;
    try {
      await client.query('BEGIN');
      await client.query(
        `INSERT INTO security_roles (id_role,code_role,nom_role,niveau_acces,est_systeme,est_actif,cree_le,version)
         VALUES ($1,$2,'Rollback certification','PLATEFORME',FALSE,TRUE,NOW(),1)`,
        [randomUUID(), `CUSTOM_ROLLBACK_${suffixe}`],
      );
      await client.query('ROLLBACK');
      const absent = await pool.query('SELECT 1 FROM security_roles WHERE code_role=$1', [`CUSTOM_ROLLBACK_${suffixe}`]);
      rollbackCertifie = absent.rowCount === 0;
    } finally {
      client.release();
    }
    if (!rollbackCertifie) throw new Error('Le rollback PostgreSQL Security a echoue.');

    const actionAudit = `CERTIFICATION_SECURITY_${suffixe}`;
    await new SecurityAuditInfrastructureService().journaliser({
      action: actionAudit, succes: true, details: { niveauScope: 'PLATEFORME', secret: 'doit-etre-masque' },
    });
    const auditRelu = await pool.query<{ metadata: Record<string, unknown> }>(
      'SELECT metadata FROM audit_entries WHERE action=$1 ORDER BY date_action DESC LIMIT 1', [actionAudit],
    );
    if (!auditRelu.rows[0] || 'secret' in auditRelu.rows[0].metadata) {
      throw new Error("La durabilite ou le masquage de l'audit Security a echoue.");
    }

    let appendOnlyCertifie = false;
    try {
      await pool.query('UPDATE audit_entries SET action=action WHERE action=$1', [actionAudit]);
    } catch {
      appendOnlyCertifie = true;
    }
    if (!appendOnlyCertifie) throw new Error("La protection append-only de l'audit a echoue.");

    const cleDocument = `security-certification-${suffixe}`;
    const documents = new PostgresAuditDocumentStore();
    await documents.enregistrer('SECURITY_CERTIFICATION', cleDocument, {
      cle: cleDocument,
      dateCreation: new Date(),
      secret: 'doit-etre-masque',
    });
    const documentRelu = await new PostgresAuditDocumentStore().obtenir<Record<string, unknown>>('SECURITY_CERTIFICATION', cleDocument);
    if (!documentRelu || documentRelu.cle !== cleDocument || 'secret' in documentRelu) {
      throw new Error('La persistance documentaire Audit ou son masquage a echoue.');
    }
    await documents.supprimer('SECURITY_CERTIFICATION', cleDocument);

    await pool.query('DELETE FROM security_roles WHERE id_role=$1', [role.obtenirId()]);
    const resultat = await pool.query<{
      roles: string;
      permissions: string;
      audits: string;
    }>(`
      SELECT
        (SELECT COUNT(*)::text FROM security_roles) AS roles,
        (SELECT COUNT(*)::text FROM security_permissions_roles) AS permissions,
        (SELECT COUNT(*)::text FROM audit_entries) AS audits
    `);
    process.stdout.write(`${JSON.stringify({ ...resultat.rows[0], migrationsIdempotentes: true, rollbackCertifie, auditAppendOnly: appendOnlyCertifie, auditDocumentsDurables: true, secretsMasques: true })}\n`);
  } finally {
    await pool.end();
  }
}

certifier().catch((erreur: unknown) => {
  const message = erreur instanceof Error ? erreur.message : 'Certification PostgreSQL Security impossible.';
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
});
