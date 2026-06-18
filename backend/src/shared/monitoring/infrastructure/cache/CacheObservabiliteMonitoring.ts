import type { ObservabilitySnapshotDto } from '../../application';

// Ce fichier declare le cache local d observabilite.

/** Cette classe represente le cache memoire des snapshots d observabilite. */
export class CacheObservabiliteMonitoring {
  private snapshot: ObservabilitySnapshotDto | null = null;

  /** Cette methode memorise un snapshot d observabilite. */
  public enregistrer(snapshot: ObservabilitySnapshotDto): void {
    this.snapshot = snapshot;
  }

  /** Cette methode retourne le snapshot courant. */
  public lire(): ObservabilitySnapshotDto | null {
    return this.snapshot;
  }
}
