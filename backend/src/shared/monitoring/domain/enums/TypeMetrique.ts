// Ce fichier declare les familles de metriques observees.

/** Cette constante liste les types de metriques supportes. */
export const TYPES_METRIQUE = ['BUSINESS', 'TECHNICAL', 'HEALTH', 'CAPACITY', 'SATURATION'] as const;

/** Ce type represente le type d une metrique. */
export type TypeMetrique = (typeof TYPES_METRIQUE)[number];
