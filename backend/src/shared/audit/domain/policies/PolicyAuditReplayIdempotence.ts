import { AuditReplayConflictException } from '../exceptions';
import { ResultatAudit } from '../value-objects';

// Cette policy différencie les replays valides des doublons incohérents.
export class PolicyAuditReplayIdempotence {
  public static verifier(resultatAudit: ResultatAudit, actionRejouee: boolean, actionIgnoreePourDoublon: boolean): void {
    if (actionRejouee && actionIgnoreePourDoublon) {
      throw new AuditReplayConflictException("Une action offline ne peut pas etre a la fois rejouee et ignoree pour doublon.");
    }
    if (actionIgnoreePourDoublon && resultatAudit.obtenirValeur() !== 'IGNORED_DUPLICATE') {
      throw new AuditReplayConflictException("Un doublon ignore doit etre marque IGNORED_DUPLICATE.");
    }
  }
}
