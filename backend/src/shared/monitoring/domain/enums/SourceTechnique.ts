// Ce fichier declare les principales sources techniques de monitoring.

/** Cette constante liste les sources techniques observables. */
export const SOURCES_TECHNIQUES = [
  'API',
  'DATABASE',
  'QUEUE',
  'CACHE',
  'WORKER',
  'RUNTIME',
  'EXTERNAL_SERVICE',
] as const;

/** Ce type represente la source technique d un signal. */
export type SourceTechnique = (typeof SOURCES_TECHNIQUES)[number];
