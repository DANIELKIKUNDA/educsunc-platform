import { AuditCorrelationInvalidException } from '../exceptions';
import { AuditCorrelation } from '../entities';
import { SourceAudit } from '../value-objects';

// Cette policy impose une corrélation minimale sur les traitements complexes.
export class PolicyAuditCorrelation {
  public static verifier(sourceAudit: SourceAudit, correlation?: AuditCorrelation): void {
    const source = sourceAudit.obtenirValeur();
    const correlationObligatoire = ['SYNC_ENGINE', 'IMPORT', 'EXPORT', 'MIGRATION', 'WORKER', 'CRON'];
    if (correlationObligatoire.includes(source) && !correlation?.obtenirCorrelationId()?.obtenirValeur()) {
      throw new AuditCorrelationInvalidException(`La source ${source} exige un correlationId.`);
    }
  }
}
