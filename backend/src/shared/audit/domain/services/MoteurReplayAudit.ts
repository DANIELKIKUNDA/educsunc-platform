import { AuditOfflineMetadata } from '../entities';
import { PolicyAuditReplayIdempotence } from '../policies';
import { ResultatAudit } from '../value-objects';

// Ce moteur distingue un rejeu valide, un doublon ignoré et un conflit idempotent.
export class MoteurReplayAudit {
  public verifier(resultatAudit: ResultatAudit, offlineMetadata?: AuditOfflineMetadata): void {
    if (!offlineMetadata) {
      return;
    }
    PolicyAuditReplayIdempotence.verifier(
      resultatAudit,
      offlineMetadata.estReplay(),
      offlineMetadata.estRetry(),
    );
  }
}
