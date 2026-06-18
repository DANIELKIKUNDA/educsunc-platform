import { SnapshotCacheConfiguration } from '../cache';
import { DiagnosticTechniqueConfiguration } from './TypesDiagnosticsConfiguration';

// Ce fichier declare le diagnostic technique global.

/** Cette classe represente le diagnostic global de l infrastructure Configuration. */
export class DiagnosticConfiguration {
  /** Cette methode construit un diagnostic a partir d un snapshot de cache. */
  public analyserCache(snapshot: SnapshotCacheConfiguration): readonly DiagnosticTechniqueConfiguration[] {
    return [
      {
        composant: 'CACHE',
        statut: 'OK',
        message: `Caches actifs: effectif=${snapshot.effectif.length}, snapshots=${snapshot.snapshots.length}, validations=${snapshot.validations.length}`,
        diagnostiqueLe: new Date(),
      },
    ];
  }
}
