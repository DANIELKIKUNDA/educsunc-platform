import type { AuditAnalyticsQuery } from 'shared/audit/application';
import { executerDependance, enrichirTenant, envelopperReponse, extraireContexteRuntime } from './AuditControllerSupport';
import type { AuditExecutable, AuditHttpControllerResponse, AuditHttpRequest } from './HttpAuditControllerTypes';
import { AuditAnalyticsQueryValidator } from '../validators';
import { AuditAnalyticsPresenter } from '../presenters';

export class AuditAnalyticsController {
  public constructor(
    private readonly obtenirStatistiquesAudit: AuditExecutable<AuditAnalyticsQuery, unknown>,
    private readonly obtenirStatistiquesExports: AuditExecutable<AuditAnalyticsQuery, unknown>,
    private readonly obtenirStatistiquesSynchronisation: AuditExecutable<AuditAnalyticsQuery, unknown>,
    private readonly obtenirStatistiquesSecurite: AuditExecutable<AuditAnalyticsQuery, unknown>,
    private readonly obtenirVolumetrieAudit: AuditExecutable<AuditAnalyticsQuery, unknown>,
  ) {}

  public async audit(requete: AuditHttpRequest<never, Record<string, never>, AuditAnalyticsQuery>): Promise<AuditHttpControllerResponse<unknown>> {
    return this.executer(this.obtenirStatistiquesAudit, requete);
  }
  public async exports(requete: AuditHttpRequest<never, Record<string, never>, AuditAnalyticsQuery>): Promise<AuditHttpControllerResponse<unknown>> {
    return this.executer(this.obtenirStatistiquesExports, requete);
  }
  public async synchronization(requete: AuditHttpRequest<never, Record<string, never>, AuditAnalyticsQuery>): Promise<AuditHttpControllerResponse<unknown>> {
    return this.executer(this.obtenirStatistiquesSynchronisation, requete);
  }
  public async security(requete: AuditHttpRequest<never, Record<string, never>, AuditAnalyticsQuery>): Promise<AuditHttpControllerResponse<unknown>> {
    return this.executer(this.obtenirStatistiquesSecurite, requete);
  }
  public async volumetrie(requete: AuditHttpRequest<never, Record<string, never>, AuditAnalyticsQuery>): Promise<AuditHttpControllerResponse<unknown>> {
    return this.executer(this.obtenirVolumetrieAudit, requete);
  }

  private async executer(
    dependance: AuditExecutable<AuditAnalyticsQuery, unknown>,
    requete: AuditHttpRequest<never, Record<string, never>, AuditAnalyticsQuery>,
  ): Promise<AuditHttpControllerResponse<unknown>> {
    const startedAt = Date.now();
    const contexte = extraireContexteRuntime(requete);
    const sortie = await executerDependance(dependance, enrichirTenant(AuditAnalyticsQueryValidator.valider(requete.query), contexte));
    return envelopperReponse(AuditAnalyticsPresenter.presenter(sortie as never), contexte, startedAt);
  }
}
