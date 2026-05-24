import { ObtenirTimelineAuditUseCase } from '../../use-cases/timeline/ObtenirTimelineAuditUseCase';
import type { AuditTimelineQuery } from '../../dto/queries/AuditTimelineQuery';
import type { AuditTimelineOutput } from '../../dto/outputs/AuditTimelineOutput';

// Ce handler applique un flux applicatif Audit sans connaitre HTTP.
export class GetAuditTimelineHandler {
  constructor(private readonly obtenirTimelineAuditUseCase: ObtenirTimelineAuditUseCase) {}

  public async executer(payload: AuditTimelineQuery): Promise<AuditTimelineOutput> {
    return this.obtenirTimelineAuditUseCase.executer(payload);
  }
}
