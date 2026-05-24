import { RejouerAuditOfflineUseCase } from '../../use-cases/offline/RejouerAuditOfflineUseCase';
import type { OfflineAuditReplayInput } from '../../dto/offline/OfflineAuditReplayInput';
import type { AuditOfflineStatusOutput } from '../../dto/outputs/AuditOfflineStatusOutput';

// Ce handler applique un flux applicatif Audit sans connaitre HTTP.
export class ReplayOfflineAuditHandler {
  constructor(private readonly rejouerAuditOfflineUseCase: RejouerAuditOfflineUseCase) {}

  public async executer(payload: OfflineAuditReplayInput): Promise<AuditOfflineStatusOutput> {
    return this.rejouerAuditOfflineUseCase.executer(payload);
  }
}
