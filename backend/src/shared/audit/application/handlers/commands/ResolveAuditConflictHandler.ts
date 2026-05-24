import { ResoudreConflitAuditUseCase } from '../../use-cases/offline/ResoudreConflitAuditUseCase';
import type { OfflineAuditConflictInput } from '../../dto/offline/OfflineAuditConflictInput';
import type { AuditOfflineStatusOutput } from '../../dto/outputs/AuditOfflineStatusOutput';

// Ce handler applique un flux applicatif Audit sans connaitre HTTP.
export class ResolveAuditConflictHandler {
  constructor(private readonly resoudreConflitAuditUseCase: ResoudreConflitAuditUseCase) {}

  public async executer(payload: OfflineAuditConflictInput): Promise<AuditOfflineStatusOutput> {
    return this.resoudreConflitAuditUseCase.executer(payload);
  }
}
