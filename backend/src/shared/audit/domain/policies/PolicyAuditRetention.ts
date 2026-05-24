import { AuditRetentionViolationException } from '../exceptions';
import { TypeAudit } from '../value-objects';

// Cette policy exprime les règles de conservation minimales selon le type d'audit.
export class PolicyAuditRetention {
  public static verifierDuree(typeAuditPrincipal: TypeAudit, nombreJours: number): void {
    if (nombreJours <= 0) {
      throw new AuditRetentionViolationException("La duree de retention doit etre strictement positive.");
    }
    if (['SECURITE', 'FINANCIER', 'CONFORMITE'].includes(typeAuditPrincipal.obtenirValeur()) && nombreJours < 365) {
      throw new AuditRetentionViolationException("Les audits critiques doivent avoir une retention longue.");
    }
  }
}
