import { AuditOfflineStateInvalidException } from '../exceptions';
import { AuditOfflineMetadata } from '../entities';

// Cette policy protège la cohérence des actions réalisées offline.
export class PolicyAuditOffline {
  public static verifier(metadata?: AuditOfflineMetadata, modeOffline = false): void {
    if (!modeOffline && metadata && metadata.obtenirStatutSynchronisation().obtenirValeur() === 'LOCAL') {
      throw new AuditOfflineStateInvalidException("Un audit online ne peut pas etre marque purement local.");
    }
  }
}
