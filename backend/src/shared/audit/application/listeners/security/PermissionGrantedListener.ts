import { CreateSecurityAuditHandler } from '../../handlers/commands/CreateSecurityAuditHandler';
import type { CreateSecurityAuditInput } from '../../dto/inputs/CreateSecurityAuditInput';

// Ce listener traduit un evenement transverse en intention applicative Audit.
export class PermissionGrantedListener {
  constructor(private readonly handler: CreateSecurityAuditHandler) {}

  public async ecouter(evenement: CreateSecurityAuditInput): Promise<void> {
    await this.handler.executer(evenement);
  }
}
