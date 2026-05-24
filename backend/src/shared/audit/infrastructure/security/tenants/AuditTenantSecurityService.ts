import type { AuditAccessDecision } from '../SecurityTypes';

export class AuditTenantSecurityService {
  public verifier(args: {
    organisationId?: string;
    ecoleId?: string;
    scope?: string;
    organisationDemandee?: string;
    ecoleDemandee?: string;
    scopeDemande?: string;
  }): AuditAccessDecision {
    if (args.organisationDemandee && args.organisationId && args.organisationDemandee !== args.organisationId) {
      return { autorise: false, raison: 'Organisation cible hors périmètre autorisé.' };
    }
    if (args.ecoleDemandee && args.ecoleId && args.ecoleDemandee !== args.ecoleId) {
      return { autorise: false, raison: 'École cible hors périmètre autorisé.' };
    }
    if (args.scopeDemande && args.scope && args.scopeDemande !== args.scope) {
      return { autorise: false, raison: 'Scope cible hors périmètre autorisé.' };
    }
    return { autorise: true, raison: 'Isolation multi-tenant respectée.' };
  }
}
