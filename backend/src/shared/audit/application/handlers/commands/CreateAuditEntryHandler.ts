import { CreerAuditUseCase } from '../../use-cases/creation/CreerAuditUseCase';
import type { CreateAuditEntryInput } from '../../dto/inputs/CreateAuditEntryInput';
import type { AuditEntryOutput } from '../../dto/outputs/AuditEntryOutput';

// Ce handler applique un flux applicatif Audit sans connaitre HTTP.
export class CreateAuditEntryHandler {
  constructor(private readonly creerAuditUseCase: CreerAuditUseCase) {}

  public async executer(payload: CreateAuditEntryInput): Promise<AuditEntryOutput> {
    return this.creerAuditUseCase.executer(payload);
  }
}
