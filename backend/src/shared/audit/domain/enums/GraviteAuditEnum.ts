// Cette taxonomy officielle porte la criticité réelle d'un audit.
export const GRAVITE_AUDIT_ENUM = ['FAIBLE', 'MOYENNE', 'ELEVEE', 'CRITIQUE'] as const;

export type GraviteAuditEnum = (typeof GRAVITE_AUDIT_ENUM)[number];
