import type { SourceTechnique } from '../enums';

// Ce fichier declare les sources de monitoring autorisees par le domaine.

/** Cette constante liste les sources techniques autorisees. */
export const MONITORING_SOURCES: readonly SourceTechnique[] = [
  'API',
  'DATABASE',
  'QUEUE',
  'CACHE',
  'WORKER',
  'RUNTIME',
  'EXTERNAL_SERVICE',
];
