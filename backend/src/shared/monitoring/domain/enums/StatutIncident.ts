// Ce fichier declare les statuts de cycle de vie des incidents.

/** Cette constante liste les statuts d incident supportes. */
export const STATUTS_INCIDENT = ['DETECTED', 'INVESTIGATING', 'MITIGATED', 'RESOLVED'] as const;

/** Ce type represente le statut d un incident. */
export type StatutIncident = (typeof STATUTS_INCIDENT)[number];
