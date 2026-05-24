import { ObtenirStatistiquesSynchronisationUseCase } from '../../use-cases/analytics/ObtenirStatistiquesSynchronisationUseCase';
import type { AuditAnalyticsQuery } from '../../dto/queries/AuditAnalyticsQuery';
import type { AuditAnalyticsOutput } from '../../dto/outputs/AuditAnalyticsOutput';

// Ce handler applique un flux applicatif Audit sans connaitre HTTP.
export class GetSynchronizationAnalyticsHandler {
  constructor(private readonly obtenirStatistiquesSynchronisationUseCase: ObtenirStatistiquesSynchronisationUseCase) {}

  public async executer(payload: AuditAnalyticsQuery): Promise<AuditAnalyticsOutput> {
    return this.obtenirStatistiquesSynchronisationUseCase.executer(payload);
  }
}
