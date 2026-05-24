import type { AuditPostgresMigration } from './audit-postgres-migration.types';

// Cette migration comble un manque documentaire minimal pour reserver la table analytics journaliere.
export const createAuditAnalyticsDailyTable: AuditPostgresMigration = {
  nom: 'create_audit_analytics_daily_table',
  ordre: 80,
  description: 'Créer la table préparatoire des agrégats analytics journaliers Audit.',
  sql: [
    '-- Le document impose la table audit_analytics_daily mais ne détaille pas ses colonnes dans le bloc schemas.',
    '-- Ces colonnes minimales sont ajoutées pour préserver le besoin analytics sans inventer un modèle trop large.',
    'CREATE TABLE IF NOT EXISTS audit_analytics_daily (',
    '  cle_analytics VARCHAR(120) PRIMARY KEY,',
    '  date_reference DATE NOT NULL,',
    '  dimensions JSONB NULL,',
    '  compteurs JSONB NOT NULL',
    ');',
  ].join('\n'),
};
