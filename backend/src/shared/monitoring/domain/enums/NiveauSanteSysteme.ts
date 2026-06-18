// Ce fichier declare les niveaux de sante metier du module Monitoring.

/** Cette constante liste les niveaux de sante possibles. */
export const NIVEAUX_SANTE_SYSTEME = ['HEALTHY', 'DEGRADED', 'CRITICAL', 'UNKNOWN'] as const;

/** Ce type represente un niveau de sante systeme. */
export type NiveauSanteSysteme = (typeof NIVEAUX_SANTE_SYSTEME)[number];
