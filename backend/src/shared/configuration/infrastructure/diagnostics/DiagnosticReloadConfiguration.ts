import { ResultatReloadConfiguration } from '../reload';
import { DiagnosticTechniqueConfiguration } from './TypesDiagnosticsConfiguration';

// Ce fichier declare le diagnostic de reload.

/** Cette classe represente le diagnostic des reloads techniques. */
export class DiagnosticReloadConfiguration {
  /** Cette methode analyse le journal de reload courant. */
  public analyser(
    journal: readonly ResultatReloadConfiguration[],
  ): readonly DiagnosticTechniqueConfiguration[] {
    return [
      {
        composant: 'RELOAD',
        statut: 'OK',
        message: `Reloads memorises: ${journal.length}`,
        diagnostiqueLe: new Date(),
      },
    ];
  }
}
