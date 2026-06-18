// Ce fichier declare les niveaux de gravite des alertes.

/** Cette constante liste les gravites d alerte supportees. */
export const GRAVITES_ALERTE = ['INFO', 'WARNING', 'MAJOR', 'CRITICAL'] as const;

/** Ce type represente la gravite d une alerte. */
export type GraviteAlerte = (typeof GRAVITES_ALERTE)[number];
