import { CreerAuditOfflineUseCase } from '../../use-cases/offline/CreerAuditOfflineUseCase';
import type { CreateOfflineAuditEntryInput } from '../../dto/inputs/CreateOfflineAuditEntryInput';
import type { AuditEntryOutput } from '../../dto/outputs/AuditEntryOutput';

// Ce handler applique un flux applicatif Audit sans connaitre HTTP.
export class CreateOfflineAuditHandler {
  constructor(private readonly creerAuditOfflineUseCase: CreerAuditOfflineUseCase) {}

  public async executer(payload: CreateOfflineAuditEntryInput): Promise<AuditEntryOutput> {
    return this.creerAuditOfflineUseCase.executer(payload);
  }
}
