import { AuditPermissionSecurityService } from '../permissions/AuditPermissionSecurityService';
import { AuditTenantSecurityService } from '../tenants/AuditTenantSecurityService';
import type { AuditAccessDecision } from '../SecurityTypes';

export class AuditAccessControlService {
  public constructor(
    private readonly permissions: AuditPermissionSecurityService = new AuditPermissionSecurityService(),
    private readonly tenants: AuditTenantSecurityService = new AuditTenantSecurityService(),
  ) {}

  public verifier(args: {
    permissions: readonly string[];
    permissionDemandee: string;
    organisationId?: string;
    ecoleId?: string;
    scope?: string;
    organisationDemandee?: string;
    ecoleDemandee?: string;
    scopeDemande?: string;
  }): AuditAccessDecision {
    const decisionPermission = this.permissions.verifier({
      permissions: args.permissions,
      permissionDemandee: args.permissionDemandee,
    });
    if (!decisionPermission.autorise) {
      return decisionPermission;
    }

    return this.tenants.verifier({
      organisationId: args.organisationId,
      ecoleId: args.ecoleId,
      scope: args.scope,
      organisationDemandee: args.organisationDemandee,
      ecoleDemandee: args.ecoleDemandee,
      scopeDemande: args.scopeDemande,
    });
  }
}
