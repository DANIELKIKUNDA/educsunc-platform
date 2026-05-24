import { AuditSnapshotData } from '../value-objects';

// Ce moteur prépare des snapshots propres sans gonfler inutilement la volumétrie.
export class MoteurSnapshotsAudit {
  public preparer(ancienEtat?: Record<string, unknown>, nouvelEtat?: Record<string, unknown>): AuditSnapshotData | undefined {
    if (!ancienEtat && !nouvelEtat) {
      return undefined;
    }
    return new AuditSnapshotData(ancienEtat, nouvelEtat);
  }
}
