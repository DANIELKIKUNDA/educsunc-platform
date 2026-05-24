import { CreateFinancialAuditHandler } from '../../handlers/commands/CreateFinancialAuditHandler';
import type { CreateFinancialAuditInput } from '../../dto/inputs/CreateFinancialAuditInput';

// Ce listener traduit un evenement transverse en intention applicative Audit.
export class PaymentCancelledListener {
  constructor(private readonly handler: CreateFinancialAuditHandler) {}

  public async ecouter(evenement: CreateFinancialAuditInput): Promise<void> {
    await this.handler.executer(evenement);
  }
}
