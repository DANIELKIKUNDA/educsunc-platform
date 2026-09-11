import type { Pool } from 'pg';

/** Installe les tables durables Notifications sans detruire les donnees existantes. */
export class MigrateurPostgresNotifications {
  constructor(private readonly pool: Pool) {}

  public async executerToutes(): Promise<void> {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS notifications_aggregates (
        id text PRIMARY KEY,
        organisation_id text,
        ecole_id text,
        statut text NOT NULL,
        type_notification text,
        priorite text,
        canaux text[] NOT NULL DEFAULT '{}',
        destinataire_ids text[] NOT NULL DEFAULT '{}',
        titre text,
        message text,
        placeholders jsonb NOT NULL DEFAULT '{}'::jsonb,
        correlation_id text,
        request_id text,
        compteur_retry integer NOT NULL DEFAULT 0,
        compteur_replay integer NOT NULL DEFAULT 0,
        archived_at timestamptz,
        archive_reason text,
        snapshot jsonb NOT NULL,
        created_at timestamptz NOT NULL,
        updated_at timestamptz NOT NULL
      );

      ALTER TABLE notifications_aggregates ADD COLUMN IF NOT EXISTS type_notification text;
      ALTER TABLE notifications_aggregates ADD COLUMN IF NOT EXISTS priorite text;
      ALTER TABLE notifications_aggregates ADD COLUMN IF NOT EXISTS canaux text[] NOT NULL DEFAULT '{}';
      ALTER TABLE notifications_aggregates ADD COLUMN IF NOT EXISTS destinataire_ids text[] NOT NULL DEFAULT '{}';
      ALTER TABLE notifications_aggregates ADD COLUMN IF NOT EXISTS titre text;
      ALTER TABLE notifications_aggregates ADD COLUMN IF NOT EXISTS message text;
      ALTER TABLE notifications_aggregates ADD COLUMN IF NOT EXISTS placeholders jsonb NOT NULL DEFAULT '{}'::jsonb;
      ALTER TABLE notifications_aggregates ADD COLUMN IF NOT EXISTS correlation_id text;
      ALTER TABLE notifications_aggregates ADD COLUMN IF NOT EXISTS request_id text;
      ALTER TABLE notifications_aggregates ADD COLUMN IF NOT EXISTS compteur_retry integer NOT NULL DEFAULT 0;
      ALTER TABLE notifications_aggregates ADD COLUMN IF NOT EXISTS compteur_replay integer NOT NULL DEFAULT 0;
      ALTER TABLE notifications_aggregates ADD COLUMN IF NOT EXISTS archived_at timestamptz;
      ALTER TABLE notifications_aggregates ADD COLUMN IF NOT EXISTS archive_reason text;

      CREATE INDEX IF NOT EXISTS idx_notifications_aggregates_org_updated
        ON notifications_aggregates (organisation_id, updated_at DESC);
      CREATE INDEX IF NOT EXISTS idx_notifications_aggregates_school_updated
        ON notifications_aggregates (ecole_id, updated_at DESC);
      CREATE INDEX IF NOT EXISTS idx_notifications_aggregates_status_updated
        ON notifications_aggregates (statut, updated_at DESC);
      CREATE INDEX IF NOT EXISTS idx_notifications_aggregates_type_created
        ON notifications_aggregates (type_notification, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_notifications_aggregates_destinataires
        ON notifications_aggregates USING gin (destinataire_ids);

      CREATE TABLE IF NOT EXISTS notifications_dead_letters (
        job_id text PRIMARY KEY,
        notification_id text NOT NULL,
        organisation_id text,
        ecole_id text,
        raison text NOT NULL,
        correlation_id text,
        request_id text,
        dead_letter_at timestamptz NOT NULL,
        recovered_at timestamptz
      );
      CREATE INDEX IF NOT EXISTS idx_notifications_dead_letters_org_date
        ON notifications_dead_letters (organisation_id, dead_letter_at DESC);
      CREATE INDEX IF NOT EXISTS idx_notifications_dead_letters_school_date
        ON notifications_dead_letters (ecole_id, dead_letter_at DESC);
      CREATE INDEX IF NOT EXISTS idx_notifications_dead_letters_active
        ON notifications_dead_letters (dead_letter_at DESC) WHERE recovered_at IS NULL;
    `);
  }
}
