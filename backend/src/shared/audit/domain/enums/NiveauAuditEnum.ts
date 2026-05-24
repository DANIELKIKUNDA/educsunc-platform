// Cette taxonomy officielle porte le niveau de lecture opérationnelle immédiate.
export const NIVEAU_AUDIT_ENUM = ['INFORMATION', 'AVERTISSEMENT', 'CRITIQUE', 'ALERTE'] as const;

export type NiveauAuditEnum = (typeof NIVEAU_AUDIT_ENUM)[number];
