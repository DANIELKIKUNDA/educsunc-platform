import type { AuditPostgresTableSchema } from './audit-postgres-schema.types';

// Ce schema reserve la zone des analytics pre-agreges journaliers.
export const auditAnalyticsDailySchema: AuditPostgresTableSchema = {
  table: 'audit_analytics_daily',
  mission: 'Supporter les analytics pré-agrégés pour éviter les recalculs massifs temps réel.',
  zone: 'analytics',
  appendOnly: true,
  colonnes: [],
  contraintes: [],
  notes: [
    "Le document de bloc 2 impose l'existence de cette table et sa finalite, mais ne detaille pas encore ses colonnes SQL.",
    'Les mesures citees explicitement sont : nombre audits, echecs login, exports, conflits sync, actions critiques.',
    "Les colonnes detaillees devront etre completees sans invention quand on traitera les blocs analytics/projections correspondants.",
  ],
  preparations: [
    { type: 'indexation', details: ['agregations journalieres', 'lectures batch', 'structures legeres'] },
    { type: 'archivage', details: ['historisation analytique longue duree a prevoir'] },
  ],
};
