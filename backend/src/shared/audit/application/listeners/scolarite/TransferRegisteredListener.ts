import { CreateAuditEntryHandler } from '../../handlers/commands/CreateAuditEntryHandler';
import type { CreateAuditEntryInput } from '../../dto/inputs/CreateAuditEntryInput';

// Ce listener traduit un evenement transverse en intention applicative Audit.
export class TransferRegisteredListener {
  constructor(private readonly handler: CreateAuditEntryHandler) {}

  public async ecouter(evenement: CreateAuditEntryInput): Promise<void> {
    await this.handler.executer(evenement);
  }
}
