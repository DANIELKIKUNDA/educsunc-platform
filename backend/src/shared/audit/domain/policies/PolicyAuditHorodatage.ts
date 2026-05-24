import { AuditTimestampIncoherentException } from '../exceptions';
import { AuditTimestamp } from '../value-objects';

// Cette policy vérifie la cohérence métier des dates d'audit.
export class PolicyAuditHorodatage {
  public static verifier(horodatage: AuditTimestamp): void {
    if (horodatage.obtenirDateCreationAudit().getTime() < horodatage.obtenirDateAction().getTime()) {
      return;
    }
    if (!horodatage.estOffline() && horodatage.obtenirDateCreationAudit().getTime() !== horodatage.obtenirDateAction().getTime()) {
      throw new AuditTimestampIncoherentException("Un audit online doit partager la meme date d'action et de creation.");
    }
  }
}
