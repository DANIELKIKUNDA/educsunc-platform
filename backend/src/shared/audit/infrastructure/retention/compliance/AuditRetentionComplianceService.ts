import { AuditRetentionPolicyRegistry } from '../policies/AuditRetentionPolicyRegistry';

export class AuditRetentionComplianceService {
  public constructor(
    private readonly policies: AuditRetentionPolicyRegistry = new AuditRetentionPolicyRegistry(),
  ) {}

  public listerPolitiques() {
    return this.policies.lister();
  }
}
