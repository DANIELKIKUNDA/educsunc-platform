import type { AuditAccessDecision } from '../SecurityTypes';

// Les permissions audit sont fortes et explicites pour les lectures sensibles.
export class AuditPermissionSecurityService {
  public verifier(args: {
    permissions: readonly string[];
    permissionDemandee: string;
  }): AuditAccessDecision {
    return args.permissions.includes(args.permissionDemandee)
      ? { autorise: true, raison: 'Permission accordée.' }
      : { autorise: false, raison: `Permission manquante: ${args.permissionDemandee}` };
  }
}
