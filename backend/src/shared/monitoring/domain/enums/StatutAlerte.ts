// Ce fichier declare les statuts de cycle de vie des alertes.

/** Cette constante liste les statuts d alerte supportes. */
export const STATUTS_ALERTE = ['OPEN', 'ACKNOWLEDGED', 'RESOLVED', 'SUPPRESSED'] as const;

/** Ce type represente le statut d une alerte. */
export type StatutAlerte = (typeof STATUTS_ALERTE)[number];
