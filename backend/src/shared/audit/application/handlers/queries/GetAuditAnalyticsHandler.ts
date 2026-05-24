import { ObtenirStatistiquesAuditUseCase } from '../../use-cases/analytics/ObtenirStatistiquesAuditUseCase';
import type { AuditAnalyticsQuery } from '../../dto/queries/AuditAnalyticsQuery';
import type { AuditAnalyticsOutput } from '../../dto/outputs/AuditAnalyticsOutput';

// Ce handler applique un flux applicatif Audit sans connaitre HTTP.
export class GetAuditAnalyticsHandler {
  constructor(private readonly obtenirStatistiquesAuditUseCase: ObtenirStatistiquesAuditUseCase) {}

  public async executer(payload: AuditAnalyticsQuery): Promise<AuditAnalyticsOutput> {
    return this.obtenirStatistiquesAuditUseCase.executer(payload);
  }
}
