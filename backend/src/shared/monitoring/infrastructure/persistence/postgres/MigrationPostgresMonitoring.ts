import type { Pool } from 'pg';

export async function migrerPostgresMonitoring(pool: Pool): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS monitoring_alertes (
      identifiant varchar(160) PRIMARY KEY,
      payload jsonb NOT NULL,
      statut varchar(32) NOT NULL CHECK (statut IN ('OPEN','ACKNOWLEDGED','RESOLVED','SUPPRESSED')),
      gravite varchar(32) NOT NULL CHECK (gravite IN ('INFO','WARNING','MAJOR','CRITICAL')),
      declenchee_le timestamptz NOT NULL,
      resolue_le timestamptz,
      updated_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS idx_monitoring_alertes_statut_date ON monitoring_alertes(statut, declenchee_le DESC);
    CREATE INDEX IF NOT EXISTS idx_monitoring_alertes_gravite_date ON monitoring_alertes(gravite, declenchee_le DESC);

    CREATE TABLE IF NOT EXISTS monitoring_incidents (
      identifiant varchar(160) PRIMARY KEY,
      payload jsonb NOT NULL,
      statut varchar(32) NOT NULL CHECK (statut IN ('DETECTED','INVESTIGATING','MITIGATED','RESOLVED')),
      niveau varchar(32) NOT NULL CHECK (niveau IN ('HEALTHY','DEGRADED','CRITICAL','UNKNOWN')),
      detecte_le timestamptz NOT NULL,
      resolu_le timestamptz,
      updated_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS idx_monitoring_incidents_statut_date ON monitoring_incidents(statut, detecte_le DESC);

    CREATE TABLE IF NOT EXISTS monitoring_incident_timeline (
      id bigserial PRIMARY KEY,
      incident_id varchar(160) NOT NULL,
      statut varchar(32) NOT NULL CHECK (statut IN ('DETECTED','INVESTIGATING','MITIGATED','RESOLVED')),
      enregistre_le timestamptz NOT NULL DEFAULT now(),
      details jsonb NOT NULL DEFAULT '{}'::jsonb,
      CONSTRAINT fk_monitoring_timeline_incident FOREIGN KEY (incident_id)
        REFERENCES monitoring_incidents(identifiant) ON DELETE CASCADE,
      CONSTRAINT uq_monitoring_timeline_transition UNIQUE (incident_id, statut)
    );
    CREATE INDEX IF NOT EXISTS idx_monitoring_incident_timeline_date
      ON monitoring_incident_timeline(incident_id, enregistre_le ASC);

    CREATE TABLE IF NOT EXISTS monitoring_diagnostics (
      id bigserial PRIMARY KEY,
      incident_id varchar(160) NOT NULL,
      payload jsonb NOT NULL,
      genere_le timestamptz NOT NULL,
      CONSTRAINT fk_monitoring_diagnostic_incident FOREIGN KEY (incident_id)
        REFERENCES monitoring_incidents(identifiant) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_monitoring_diagnostics_incident_date ON monitoring_diagnostics(incident_id, genere_le DESC);

    CREATE TABLE IF NOT EXISTS monitoring_traces (
      identifiant varchar(160) PRIMARY KEY,
      payload jsonb NOT NULL,
      type varchar(32) NOT NULL CHECK (type IN ('REQUEST','JOB','EVENT','DIAGNOSTIC','FORENSIC')),
      capturee_le timestamptz NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_monitoring_traces_type_date ON monitoring_traces(type, capturee_le DESC);

    CREATE TABLE IF NOT EXISTS monitoring_capacity_snapshots (
      id bigserial PRIMARY KEY,
      ressource varchar(160) NOT NULL,
      payload jsonb NOT NULL,
      niveau varchar(32) NOT NULL CHECK (niveau IN ('HEALTHY','DEGRADED','CRITICAL','UNKNOWN')),
      estimee_le timestamptz NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_monitoring_capacity_ressource_date
      ON monitoring_capacity_snapshots(ressource, estimee_le DESC);

    CREATE TABLE IF NOT EXISTS monitoring_saturation_snapshots (
      id bigserial PRIMARY KEY,
      ressource varchar(160) NOT NULL,
      payload jsonb NOT NULL,
      niveau varchar(32) NOT NULL CHECK (niveau IN ('HEALTHY','DEGRADED','CRITICAL','UNKNOWN')),
      goulot boolean NOT NULL,
      observee_le timestamptz NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_monitoring_saturation_ressource_date
      ON monitoring_saturation_snapshots(ressource, observee_le DESC);
  `);
}
