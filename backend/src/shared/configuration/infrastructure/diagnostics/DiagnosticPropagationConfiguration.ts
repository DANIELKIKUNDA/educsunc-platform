import { JournalPropagationConfiguration } from '../propagation';
import { DiagnosticTechniqueConfiguration } from './TypesDiagnosticsConfiguration';

// Ce fichier declare le diagnostic de propagation.

/** Cette classe represente le diagnostic des propagations techniques. */
export class DiagnosticPropagationConfiguration {
  /** Cette methode analyse le journal de propagation courant. */
  public analyser(
    journal: readonly JournalPropagationConfiguration[],
  ): readonly DiagnosticTechniqueConfiguration[] {
    return [
      {
        composant: 'PROPAGATION',
        statut: 'OK',
        message: `Propagations memorisees: ${journal.length}`,
        diagnostiqueLe: new Date(),
      },
    ];
  }
}
