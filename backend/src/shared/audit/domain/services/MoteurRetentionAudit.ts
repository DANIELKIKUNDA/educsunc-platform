import { AuditEntry } from '../aggregates';
import { PolicyAuditRetention } from '../policies';

// Ce moteur décide des bornes de conservation métier d'une entrée audit.
export class MoteurRetentionAudit {
  public calculerRetentionJours(entree: AuditEntry): number {
    const typePrincipal = entree.obtenirTypeAuditPrincipal().obtenirValeur();
    const retention = ['SECURITE', 'FINANCIER', 'CONFORMITE'].includes(typePrincipal) ? 3650 : 365;
    PolicyAuditRetention.verifierDuree(entree.obtenirTypeAuditPrincipal(), retention);
    return retention;
  }
}
