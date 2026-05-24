import { ObtenirStatistiquesSecuriteUseCase } from '../../use-cases/analytics/ObtenirStatistiquesSecuriteUseCase';
import type { AuditAnalyticsQuery } from '../../dto/queries/AuditAnalyticsQuery';
import type { AuditAnalyticsOutput } from '../../dto/outputs/AuditAnalyticsOutput';

// Ce handler applique un flux applicatif Audit sans connaitre HTTP.
export class GetSecurityAnalyticsHandler {
  constructor(private readonly obtenirStatistiquesSecuriteUseCase: ObtenirStatistiquesSecuriteUseCase) {}

  public async executer(payload: AuditAnalyticsQuery): Promise<AuditAnalyticsOutput> {
    return this.obtenirStatistiquesSecuriteUseCase.executer(payload);
  }
}
