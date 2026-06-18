// Ce fichier declare les types de traces manipules par le domaine.

/** Cette constante liste les types de trace supportes. */
export const TYPES_TRACE = ['REQUEST', 'JOB', 'EVENT', 'DIAGNOSTIC', 'FORENSIC'] as const;

/** Ce type represente le type d une trace. */
export type TypeTrace = (typeof TYPES_TRACE)[number];
