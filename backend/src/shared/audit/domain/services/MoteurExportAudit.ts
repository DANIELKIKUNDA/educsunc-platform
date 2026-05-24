import { AuditEntry } from '../aggregates';
import { PolicyAuditExport } from '../policies';

// Ce moteur prépare l'export sécurisé d'entrées audit.
export class MoteurExportAudit {
  public preparerExport(entrees: AuditEntry[], exportAutorise: boolean): Record<string, unknown>[] {
    return entrees.map((entree) => {
      PolicyAuditExport.verifier(entree.obtenirTypeAuditPrincipal(), exportAutorise);
      return {
        idAuditEntry: entree.obtenirId(),
        typeAuditPrincipal: entree.obtenirTypeAuditPrincipal().obtenirValeur(),
        actionAudit: entree.obtenirActionAudit().obtenirValeur(),
        resultatAudit: entree.obtenirResultatAudit().obtenirValeur(),
      };
    });
  }
}
