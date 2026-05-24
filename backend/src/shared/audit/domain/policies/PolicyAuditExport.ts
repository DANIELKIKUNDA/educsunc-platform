import { AuditExportUnauthorizedException } from '../exceptions';
import { TypeAudit } from '../value-objects';

// Cette policy borne les exports sensibles à des classifications maîtrisées.
export class PolicyAuditExport {
  public static verifier(typeAuditPrincipal: TypeAudit, exportAutorise: boolean): void {
    if (!exportAutorise && ['FINANCIER', 'SECURITE', 'CONSULTATION_SENSIBLE'].includes(typeAuditPrincipal.obtenirValeur())) {
      throw new AuditExportUnauthorizedException("L'export sensible demande n'est pas autorise.");
    }
  }
}
