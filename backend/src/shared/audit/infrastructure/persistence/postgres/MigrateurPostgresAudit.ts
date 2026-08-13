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
      const outboxMigration = await client.query('SELECT 1 FROM audit_schema_migrations WHERE version=3');
      if (!outboxMigration.rowCount) {
        await client.query(`
          CREATE TABLE IF NOT EXISTS audit_outbox (
            id_outbox TEXT PRIMARY KEY,
            event_id TEXT NOT NULL UNIQUE,
            event_name TEXT NOT NULL,
            schema_version INTEGER NOT NULL CHECK (schema_version > 0),
            idempotency_key TEXT NOT NULL UNIQUE,
            payload JSONB NOT NULL,
            organisation_id TEXT,
            ecole_id TEXT,
            scope TEXT NOT NULL CHECK (scope IN ('PLATEFORME','ORGANISATION','ECOLE')),
            request_id TEXT,
            correlation_id TEXT,
            status TEXT NOT NULL DEFAULT 'PENDING'
              CHECK (status IN ('PENDING','PROCESSING','RETRY','PUBLISHED','DEAD')),
            attempt_count INTEGER NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
            next_attempt_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            locked_at TIMESTAMPTZ,
            locked_by TEXT,
            last_error TEXT,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            published_at TIMESTAMPTZ,
            CONSTRAINT audit_outbox_tenant_check CHECK (
              (scope='PLATEFORME' AND organisation_id IS NULL AND ecole_id IS NULL)
              OR (scope='ORGANISATION' AND organisation_id IS NOT NULL AND ecole_id IS NULL)
              OR (scope='ECOLE' AND organisation_id IS NOT NULL AND ecole_id IS NOT NULL)
            )
          )
        `);
        await client.query(`
          CREATE INDEX IF NOT EXISTS audit_outbox_delivery_idx
          ON audit_outbox (status,next_attempt_at,created_at)
          WHERE status IN ('PENDING','RETRY','PROCESSING')
        `);
        await client.query(`
          CREATE INDEX IF NOT EXISTS audit_outbox_tenant_idx
          ON audit_outbox (organisation_id,ecole_id,created_at DESC)
        `);
        await client.query(`
          CREATE OR REPLACE FUNCTION audit_outbox_protect_identity()
          RETURNS trigger AS $$ BEGIN
            IF NEW.event_id IS DISTINCT FROM OLD.event_id
              OR NEW.event_name IS DISTINCT FROM OLD.event_name
              OR NEW.schema_version IS DISTINCT FROM OLD.schema_version
              OR NEW.idempotency_key IS DISTINCT FROM OLD.idempotency_key
              OR NEW.payload IS DISTINCT FROM OLD.payload
              OR NEW.organisation_id IS DISTINCT FROM OLD.organisation_id
              OR NEW.ecole_id IS DISTINCT FROM OLD.ecole_id
              OR NEW.scope IS DISTINCT FROM OLD.scope
              OR NEW.request_id IS DISTINCT FROM OLD.request_id
              OR NEW.correlation_id IS DISTINCT FROM OLD.correlation_id
              OR NEW.created_at IS DISTINCT FROM OLD.created_at
            THEN
              RAISE EXCEPTION 'Immutable audit outbox identity violation';
            END IF;
            RETURN NEW;
          END; $$ LANGUAGE plpgsql
        `);
        await client.query(`
          DROP TRIGGER IF EXISTS audit_outbox_identity_guard ON audit_outbox;
          CREATE TRIGGER audit_outbox_identity_guard
          BEFORE UPDATE ON audit_outbox
          FOR EACH ROW EXECUTE FUNCTION audit_outbox_protect_identity()
        `);
        await client.query(`
          DROP TRIGGER IF EXISTS audit_outbox_delete_guard ON audit_outbox;
          CREATE TRIGGER audit_outbox_delete_guard
          BEFORE DELETE ON audit_outbox
          FOR EACH ROW EXECUTE FUNCTION audit_reject_append_only_mutation()
        `);
        await client.query("INSERT INTO audit_schema_migrations(version,nom) VALUES (3,'create_audit_transactional_outbox')");
      }
      const outboxIntegrityMigration = await client.query('SELECT 1 FROM audit_schema_migrations WHERE version=4');
      if (!outboxIntegrityMigration.rowCount) {
        await client.query(`
          DO $$ BEGIN
            IF NOT EXISTS (
              SELECT 1 FROM pg_constraint WHERE conname='audit_outbox_event_fk'
            ) THEN
              ALTER TABLE audit_outbox
              ADD CONSTRAINT audit_outbox_event_fk
              FOREIGN KEY (event_id) REFERENCES audit_entries(id_audit_entry)
              DEFERRABLE INITIALLY DEFERRED;
            END IF;
          END $$
        `);
        await client.query("INSERT INTO audit_schema_migrations(version,nom) VALUES (4,'protect_audit_outbox_event_link')");
      }
      const readSideMigration = await client.query('SELECT 1 FROM audit_schema_migrations WHERE version=5');
      if (!readSideMigration.rowCount) {
        await client.query(`
          CREATE INDEX IF NOT EXISTS audit_entries_keyset_idx
          ON audit_entries (date_action DESC,id_audit_entry DESC)
        `);
        await client.query(`
          CREATE INDEX IF NOT EXISTS audit_entries_organisation_keyset_idx
          ON audit_entries (organisation_id,date_action DESC,id_audit_entry DESC)
          WHERE organisation_id IS NOT NULL
        `);
        await client.query(`
          CREATE INDEX IF NOT EXISTS audit_entries_ecole_keyset_idx
          ON audit_entries (organisation_id,ecole_id,date_action DESC,id_audit_entry DESC)
          WHERE organisation_id IS NOT NULL AND ecole_id IS NOT NULL
        `);
        await client.query(`
          CREATE INDEX IF NOT EXISTS audit_categories_lookup_idx
          ON audit_categories (categorie,audit_entry_id)
        `);
        await client.query("INSERT INTO audit_schema_migrations(version,nom) VALUES (5,'industrialize_audit_read_keyset_indexes')");
      }
      const governanceMigration = await client.query('SELECT 1 FROM audit_schema_migrations WHERE version=6');
      if (!governanceMigration.rowCount) {
        await client.query(`
          CREATE TABLE IF NOT EXISTS audit_export_jobs (
            id_export TEXT PRIMARY KEY,
            requester_id TEXT,
            scope TEXT NOT NULL CHECK (scope IN ('PLATEFORME','ORGANISATION','ECOLE')),
            organisation_id TEXT,
            ecole_id TEXT,
            format TEXT NOT NULL CHECK (format IN ('CSV','JSON','PDF')),
            statut TEXT NOT NULL CHECK (statut IN (
              'REQUESTED','PROCESSING','COMPLETED','FAILED','EXPIRED','DELETED'
            )),
            filtres JSONB NOT NULL DEFAULT '{}'::jsonb,
            file_key TEXT,
            file_name TEXT,
            mime_type TEXT,
            taille_octets BIGINT,
            nombre_elements INTEGER,
            checksum_sha256 TEXT,
            erreur TEXT,
            tentative_count INTEGER NOT NULL DEFAULT 0 CHECK (tentative_count >= 0),
            idempotency_key TEXT NOT NULL UNIQUE,
            request_id TEXT,
            correlation_id TEXT,
            demande_le TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            commence_le TIMESTAMPTZ,
            termine_le TIMESTAMPTZ,
            expire_le TIMESTAMPTZ NOT NULL,
            modifie_le TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            CONSTRAINT audit_export_jobs_tenant_check CHECK (
              (scope='PLATEFORME' AND organisation_id IS NULL AND ecole_id IS NULL)
              OR (scope='ORGANISATION' AND organisation_id IS NOT NULL AND ecole_id IS NULL)
              OR (scope='ECOLE' AND organisation_id IS NOT NULL AND ecole_id IS NOT NULL)
            )
          )
        `);
        await client.query(`
          CREATE INDEX IF NOT EXISTS audit_export_jobs_dispatch_idx
          ON audit_export_jobs (statut,demande_le)
          WHERE statut IN ('REQUESTED','PROCESSING')
        `);
        await client.query(`
          CREATE INDEX IF NOT EXISTS audit_export_jobs_tenant_idx
          ON audit_export_jobs (organisation_id,ecole_id,demande_le DESC)
        `);
        await client.query(`
          CREATE TABLE IF NOT EXISTS audit_replay_runs (
            id_replay TEXT PRIMARY KEY,
            cible TEXT NOT NULL CHECK (cible IN ('PROJECTIONS','ANALYTICS','FORENSIC')),
            mode TEXT NOT NULL CHECK (mode IN ('DRY_RUN','EXECUTE')),
            statut TEXT NOT NULL CHECK (statut IN ('VALIDATED','PROCESSING','COMPLETED','FAILED')),
            requester_id TEXT,
            scope TEXT NOT NULL CHECK (scope IN ('PLATEFORME','ORGANISATION','ECOLE')),
            organisation_id TEXT,
            ecole_id TEXT,
            raison TEXT NOT NULL,
            idempotency_key TEXT NOT NULL UNIQUE,
            correlation_id TEXT,
            resultat JSONB,
            erreur TEXT,
            demande_le TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            termine_le TIMESTAMPTZ,
            CONSTRAINT audit_replay_runs_tenant_check CHECK (
              (scope='PLATEFORME' AND organisation_id IS NULL AND ecole_id IS NULL)
              OR (scope='ORGANISATION' AND organisation_id IS NOT NULL AND ecole_id IS NULL)
              OR (scope='ECOLE' AND organisation_id IS NOT NULL AND ecole_id IS NOT NULL)
            )
          )
        `);
        await client.query(`
          CREATE INDEX IF NOT EXISTS audit_replay_runs_tenant_idx
          ON audit_replay_runs (organisation_id,ecole_id,demande_le DESC)
        `);
        await client.query(`
          CREATE TABLE IF NOT EXISTS audit_integrity_seals (
            audit_entry_id TEXT PRIMARY KEY REFERENCES audit_entries(id_audit_entry) ON DELETE RESTRICT,
            canonical_version INTEGER NOT NULL CHECK (canonical_version > 0),
            hash_algorithm TEXT NOT NULL CHECK (hash_algorithm='SHA-256'),
            checksum TEXT NOT NULL,
            sealed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
          )
        `);
        await client.query(`
          DROP TRIGGER IF EXISTS audit_integrity_seals_append_only ON audit_integrity_seals;
          CREATE TRIGGER audit_integrity_seals_append_only
          BEFORE UPDATE OR DELETE ON audit_integrity_seals
          FOR EACH ROW EXECUTE FUNCTION audit_reject_append_only_mutation()
        `);
        await client.query(`
          CREATE TABLE IF NOT EXISTS audit_retention_runs (
            id_run TEXT PRIMARY KEY,
            operation TEXT NOT NULL CHECK (operation IN ('EVALUATION','ARCHIVE','PURGE_PREVIEW')),
            statut TEXT NOT NULL CHECK (statut IN ('PROCESSING','COMPLETED','FAILED')),
            scope TEXT NOT NULL CHECK (scope IN ('PLATEFORME','ORGANISATION','ECOLE')),
            organisation_id TEXT,
            ecole_id TEXT,
            requester_id TEXT,
            politique JSONB NOT NULL,
            candidats INTEGER NOT NULL DEFAULT 0,
            traites INTEGER NOT NULL DEFAULT 0,
            erreur TEXT,
            commence_le TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            termine_le TIMESTAMPTZ,
            CONSTRAINT audit_retention_runs_tenant_check CHECK (
              (scope='PLATEFORME' AND organisation_id IS NULL AND ecole_id IS NULL)
              OR (scope='ORGANISATION' AND organisation_id IS NOT NULL AND ecole_id IS NULL)
              OR (scope='ECOLE' AND organisation_id IS NOT NULL AND ecole_id IS NOT NULL)
            )
          )
        `);
        await client.query(`
          CREATE INDEX IF NOT EXISTS audit_retention_runs_tenant_idx
          ON audit_retention_runs (organisation_id,ecole_id,commence_le DESC)
        `);
        await client.query("INSERT INTO audit_schema_migrations(version,nom) VALUES (6,'audit_l5_governance_operations')");
      }
      const archiveMembershipMigration = await client.query('SELECT 1 FROM audit_schema_migrations WHERE version=7');
      if (!archiveMembershipMigration.rowCount) {
        await client.query(`
          CREATE TABLE IF NOT EXISTS audit_archive_memberships (
            audit_entry_id TEXT PRIMARY KEY REFERENCES audit_entries(id_audit_entry) ON DELETE RESTRICT,
            retention_run_id TEXT NOT NULL REFERENCES audit_retention_runs(id_run) ON DELETE RESTRICT,
            raison TEXT NOT NULL,
            archived_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
          )
        `);
        await client.query(`
          CREATE INDEX IF NOT EXISTS audit_archive_memberships_date_idx
          ON audit_archive_memberships (archived_at DESC,audit_entry_id)
        `);
        await client.query(`
          DROP TRIGGER IF EXISTS audit_archive_memberships_append_only ON audit_archive_memberships;
          CREATE TRIGGER audit_archive_memberships_append_only
          BEFORE UPDATE OR DELETE ON audit_archive_memberships
          FOR EACH ROW EXECUTE FUNCTION audit_reject_append_only_mutation()
        `);
        await client.query("INSERT INTO audit_schema_migrations(version,nom) VALUES (7,'audit_l5_logical_archive_memberships')");
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
