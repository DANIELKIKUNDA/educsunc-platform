import { CreerAuditSecuriteUseCase } from '../../use-cases/creation/CreerAuditSecuriteUseCase';
import type { CreateSecurityAuditInput } from '../../dto/inputs/CreateSecurityAuditInput';
import type { AuditEntryOutput } from '../../dto/outputs/AuditEntryOutput';

// Ce handler applique un flux applicatif Audit sans connaitre HTTP.
export class CreateSecurityAuditHandler {
  constructor(private readonly creerAuditSecuriteUseCase: CreerAuditSecuriteUseCase) {}

  public async executer(payload: CreateSecurityAuditInput): Promise<AuditEntryOutput> {
    return this.creerAuditSecuriteUseCase.executer(payload);
  }
}
