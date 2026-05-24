import { CreerAuditFinancierUseCase } from '../../use-cases/creation/CreerAuditFinancierUseCase';
import type { CreateFinancialAuditInput } from '../../dto/inputs/CreateFinancialAuditInput';
import type { AuditEntryOutput } from '../../dto/outputs/AuditEntryOutput';

// Ce handler applique un flux applicatif Audit sans connaitre HTTP.
export class CreateFinancialAuditHandler {
  constructor(private readonly creerAuditFinancierUseCase: CreerAuditFinancierUseCase) {}

  public async executer(payload: CreateFinancialAuditInput): Promise<AuditEntryOutput> {
    return this.creerAuditFinancierUseCase.executer(payload);
  }
}
