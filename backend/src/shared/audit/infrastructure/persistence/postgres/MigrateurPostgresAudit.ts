import type { Pool } from 'pg';

export class MigrateurPostgresAudit {
  constructor(private readonly pool: Pool) {}

  public async executerToutes(): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      await client.query("SELECT pg_advisory_xact_lock(hashtext('educsyn_audit_migrations'))");
      await client.query(`
        CREATE TABLE IF NOT EXISTS audit_schema_migrations (
          version INTEGER PRIMARY KEY,
          nom TEXT NOT NULL,
          appliquee_le TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);
      const migration = await client.query('SELECT 1 FROM audit_schema_migrations WHERE version=1');
      if (!migration.rowCount) {
        await client.query(`
          CREATE TABLE IF NOT EXISTS audit_entries (
            id_audit_entry TEXT PRIMARY KEY,
            action TEXT NOT NULL,
            type_principal TEXT NOT NULL,
            gravite TEXT NOT NULL,
            niveau TEXT NOT NULL,
            resultat TEXT NOT NULL,
            request_id TEXT,
            correlation_id TEXT,
            session_id TEXT,
            sync_id TEXT,
            replay_id TEXT,
            acteur_id TEXT,
            type_acteur TEXT NOT NULL,
            role_actif TEXT,
            type_ressource TEXT,
            id_ressource TEXT,
            libelle_ressource TEXT,
            organisation_id TEXT,
            ecole_id TEXT,
            scope TEXT NOT NULL,
            mode_offline BOOLEAN NOT NULL DEFAULT FALSE,
            statut_synchronisation TEXT,
            retry_count INTEGER NOT NULL DEFAULT 0 CHECK (retry_count >= 0),
            est_replay BOOLEAN NOT NULL DEFAULT FALSE,
            est_retry BOOLEAN NOT NULL DEFAULT FALSE,
            adresse_ip TEXT,
            user_agent TEXT,
            device_id TEXT,
            source_audit TEXT NOT NULL,
            source_runtime TEXT,
            version_application TEXT,
            date_action TIMESTAMPTZ NOT NULL,
            date_creation_audit TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            date_synchronisation TIMESTAMPTZ,
            ancien_etat JSONB,
            nouvel_etat JSONB,
            metadata JSONB,
            contexte_permissions JSONB,
            contexte_execution JSONB
          )
        `);
        await client.query(`
          CREATE TABLE IF NOT EXISTS audit_categories (
            id BIGSERIAL PRIMARY KEY,
            audit_entry_id TEXT NOT NULL REFERENCES audit_entries(id_audit_entry) ON DELETE RESTRICT,
            categorie TEXT NOT NULL,
            UNIQUE (audit_entry_id,categorie)
          )
        `);
        await client.query('CREATE INDEX IF NOT EXISTS audit_entries_date_idx ON audit_entries (date_action DESC)');
        await client.query('CREATE INDEX IF NOT EXISTS audit_entries_tenant_idx ON audit_entries (organisation_id,ecole_id,date_action DESC)');
        await client.query('CREATE INDEX IF NOT EXISTS audit_entries_actor_idx ON audit_entries (acteur_id,date_action DESC)');
        await client.query('CREATE INDEX IF NOT EXISTS audit_entries_correlation_idx ON audit_entries (correlation_id) WHERE correlation_id IS NOT NULL');
        await client.query(`
          CREATE OR REPLACE FUNCTION audit_reject_append_only_mutation()
          RETURNS trigger AS $$ BEGIN
            RAISE EXCEPTION 'Append-only violation on %', TG_TABLE_NAME;
          END; $$ LANGUAGE plpgsql
        `);
        await client.query(`
          DROP TRIGGER IF EXISTS audit_entries_append_only ON audit_entries;
          CREATE TRIGGER audit_entries_append_only BEFORE UPDATE OR DELETE ON audit_entries
          FOR EACH ROW EXECUTE FUNCTION audit_reject_append_only_mutation()
        `);
        await client.query(`
          DROP TRIGGER IF EXISTS audit_categories_append_only ON audit_categories;
          CREATE TRIGGER audit_categories_append_only BEFORE UPDATE OR DELETE ON audit_categories
          FOR EACH ROW EXECUTE FUNCTION audit_reject_append_only_mutation()
        `);
        await client.query("INSERT INTO audit_schema_migrations(version,nom) VALUES (1,'create_audit_append_only_core')");
      }
      const documentsMigration = await client.query('SELECT 1 FROM audit_schema_migrations WHERE version=2');
      if (!documentsMigration.rowCount) {
        await client.query(`
          CREATE TABLE IF NOT EXISTS audit_runtime_documents (
            document_type TEXT NOT NULL,
            document_key TEXT NOT NULL,
            payload JSONB NOT NULL,
            cree_le TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            modifie_le TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            PRIMARY KEY (document_type, document_key)
          )
        `);
        await client.query('CREATE INDEX IF NOT EXISTS audit_runtime_documents_type_idx ON audit_runtime_documents (document_type, modifie_le DESC)');
        await client.query("INSERT INTO audit_schema_migrations(version,nom) VALUES (2,'create_audit_runtime_documents')");
      }
      await client.query('COMMIT');
    } catch (erreur) {
      await client.query('ROLLBACK');
      throw erreur;
    } finally {
      client.release();
    }
  }
}
