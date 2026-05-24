import { AuditIntegrityViolationException } from '../exceptions';
import { ActeurAudit, ContexteAudit, RessourceAudit, TenantAudit } from '../entities';

// Cette policy vérifie que les éléments structurants de l'audit sont bien présents.
export class PolicyAuditIntegrite {
  public static verifier(params: {
    acteurAudit?: ActeurAudit;
    contexteAudit?: ContexteAudit;
    tenantAudit?: TenantAudit;
    ressourceAudit?: RessourceAudit;
  }): void {
    if (!params.acteurAudit || !params.contexteAudit || !params.tenantAudit || !params.ressourceAudit) {
      throw new AuditIntegrityViolationException("Une entree audit doit etre structurellement complete.");
    }
  }
}
