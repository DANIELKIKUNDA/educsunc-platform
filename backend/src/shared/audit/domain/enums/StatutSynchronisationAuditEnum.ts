// Cette taxonomy officielle décrit l'état de synchronisation d'un audit offline-first.
export const STATUT_SYNCHRONISATION_AUDIT_ENUM = [
  'LOCAL',
  'EN_ATTENTE_SYNCHRONISATION',
  'SYNCHRONISE',
  'REJETE',
  'CONFLIT',
  'RESOLU',
] as const;

export type StatutSynchronisationAuditEnum = (typeof STATUT_SYNCHRONISATION_AUDIT_ENUM)[number];
