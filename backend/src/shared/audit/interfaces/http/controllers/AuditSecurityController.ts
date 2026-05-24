import type { AuditForensicQuery, SearchAuditQuery } from 'shared/audit/application';
import { executerDependance, enrichirTenant, envelopperReponse, extraireContexteRuntime } from './AuditControllerSupport';
import type { AuditExecutable, AuditHttpControllerResponse, AuditHttpRequest } from './HttpAuditControllerTypes';
import {
  AuditSecurityAccessValidator,
  AuditSecurityAnomaliesValidator,
  AuditSecurityIncidentValidator,
} from '../validators';
import { AuditAnalyticsPresenter, AuditForensicPresenter, AuditMonitoringPresenter } from '../presenters';

export class AuditSecurityController {
  public constructor(
    private readonly investiguerIncidentSecurite: AuditExecutable<AuditForensicQuery, unknown>,
    private readonly detecterEchecsRepetees: AuditExecutable<SearchAuditQuery, unknown>,
    private readonly detecterExportsMassifs: AuditExecutable<SearchAuditQuery, unknown>,
    private readonly obtenirAcces: ((payload: SearchAuditQuery) => Promise<unknown>) | undefined = undefined,
  ) {}

  public async incidents(
    requete: AuditHttpRequest<never, { id?: string }, AuditForensicQuery>,
  ): Promise<AuditHttpControllerResponse<unknown>> {
    const startedAt = Date.now();
    const contexte = extraireContexteRuntime(requete);
    const sortie = await executerDependance(
      this.investiguerIncidentSecurite,
      enrichirTenant(AuditSecurityIncidentValidator.valider(requete.params, requete.query), contexte),
    );
    return envelopperReponse(AuditForensicPresenter.presenter(sortie as never), contexte, startedAt);
  }

  public async anomalies(
    requete: AuditHttpRequest<never, Record<string, never>, SearchAuditQuery>,
  ): Promise<AuditHttpControllerResponse<unknown>> {
    const startedAt = Date.now();
    const contexte = extraireContexteRuntime(requete);
    const sortie = await executerDependance(this.detecterEchecsRepetees, enrichirTenant(AuditSecurityAnomaliesValidator.valider(requete.query), contexte));
    return envelopperReponse(AuditAnalyticsPresenter.presenter(sortie as never), contexte, startedAt);
  }

  public async exportsMassifs(
    requete: AuditHttpRequest<never, Record<string, never>, SearchAuditQuery>,
  ): Promise<AuditHttpControllerResponse<unknown>> {
    const startedAt = Date.now();
    const contexte = extraireContexteRuntime(requete);
    const sortie = await executerDependance(this.detecterExportsMassifs, enrichirTenant(AuditSecurityAnomaliesValidator.valider(requete.query), contexte));
    return envelopperReponse(AuditAnalyticsPresenter.presenter(sortie as never), contexte, startedAt);
  }

  public async acces(
    requete: AuditHttpRequest<never, Record<string, never>, SearchAuditQuery>,
  ): Promise<AuditHttpControllerResponse<unknown>> {
    const startedAt = Date.now();
    const contexte = extraireContexteRuntime(requete);
    const payload = enrichirTenant(AuditSecurityAccessValidator.valider(requete.query), contexte);
    const sortie = this.obtenirAcces ? await this.obtenirAcces(payload) : { acces: 'RESTREINT', payload };
    return envelopperReponse(AuditMonitoringPresenter.presenter(sortie), contexte, startedAt);
  }
}
