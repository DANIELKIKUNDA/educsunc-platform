import { AuditForensicDataIncompleteException } from '../exceptions';
import { ContexteAudit } from '../entities';

// Cette policy impose un minimum de données exploitables pour l'analyse forensic.
export class PolicyAuditForensic {
  public static verifier(contexteAudit: ContexteAudit): void {
    if (!contexteAudit.obtenirSourceRuntime() || !contexteAudit.obtenirRequestId()?.obtenirValeur()) {
      throw new AuditForensicDataIncompleteException("Les donnees forensic minimales sont absentes.");
    }
  }
}
