// Ce fichier declare les types techniques de diagnostic.

/** Cette interface represente un diagnostic technique d infrastructure Configuration. */
export interface DiagnosticTechniqueConfiguration {
  readonly composant: 'CACHE' | 'PROPAGATION' | 'RELOAD' | 'PERSISTENCE';
  readonly statut: 'OK' | 'WARNING';
  readonly message: string;
  readonly diagnostiqueLe: Date;
}
