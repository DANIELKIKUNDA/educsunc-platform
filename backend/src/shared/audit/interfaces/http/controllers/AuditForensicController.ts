import type { AuditForensicQuery } from 'shared/audit/application';
import { executerDependance, enrichirTenant, envelopperReponse, extraireContexteRuntime } from './AuditControllerSupport';
import type { AuditExecutable, AuditHttpControllerResponse, AuditHttpRequest } from './HttpAuditControllerTypes';
import {
  AuditForensicCorrelationValidator,
  AuditForensicDeviceValidator,
  AuditForensicIncidentValidator,
  AuditForensicSessionValidator,
  AuditForensicSuspicionValidator,
  AuditForensicTimelineValidator,
} from '../validators';
import { AuditForensicPresenter } from '../presenters';

export class AuditForensicController {
  public constructor(
    private readonly lancerInvestigation: AuditExecutable<AuditForensicQuery, unknown>,
    private readonly reconstruireWorkflow: AuditExecutable<AuditForensicQuery, unknown>,
    private readonly investiguerIncident: AuditExecutable<AuditForensicQuery, unknown>,
    private readonly detecterActionsSuspectes: AuditExecutable<AuditForensicQuery, unknown>,
  ) {}

  public async investiguerCorrelation(
    requete: AuditHttpRequest<never, { id?: string }, AuditForensicQuery>,
  ): Promise<AuditHttpControllerResponse<unknown>> {
    return this.executer(this.lancerInvestigation, requete, AuditForensicCorrelationValidator.valider(requete.params, requete.query));
  }

  public async investiguerTimeline(
    requete: AuditHttpRequest<never, { id?: string }, AuditForensicQuery>,
  ): Promise<AuditHttpControllerResponse<unknown>> {
    return this.executer(this.reconstruireWorkflow, requete, AuditForensicTimelineValidator.valider(requete.params, requete.query));
  }

  public async investiguerSession(
    requete: AuditHttpRequest<never, { id?: string }, AuditForensicQuery>,
  ): Promise<AuditHttpControllerResponse<unknown>> {
    return this.executer(this.lancerInvestigation, requete, AuditForensicSessionValidator.valider(requete.params, requete.query));
  }

  public async investiguerDevice(
    requete: AuditHttpRequest<never, { id?: string }, AuditForensicQuery>,
  ): Promise<AuditHttpControllerResponse<unknown>> {
    return this.executer(this.lancerInvestigation, requete, AuditForensicDeviceValidator.valider(requete.params, requete.query));
  }

  public async investiguerIncidentSecurite(
    requete: AuditHttpRequest<never, { id?: string }, AuditForensicQuery>,
  ): Promise<AuditHttpControllerResponse<unknown>> {
    return this.executer(this.investiguerIncident, requete, AuditForensicIncidentValidator.valider(requete.params, requete.query));
  }

  public async detecterSuspicions(
    requete: AuditHttpRequest<never, Record<string, unknown>, AuditForensicQuery>,
  ): Promise<AuditHttpControllerResponse<unknown>> {
    return this.executer(this.detecterActionsSuspectes, requete, AuditForensicSuspicionValidator.valider(requete.query));
  }

  private async executer(
    dependance: AuditExecutable<AuditForensicQuery, unknown>,
    requete: AuditHttpRequest<unknown, unknown, unknown>,
    query: AuditForensicQuery,
  ): Promise<AuditHttpControllerResponse<unknown>> {
    const startedAt = Date.now();
    const contexte = extraireContexteRuntime(requete);
    const sortie = await executerDependance(dependance, enrichirTenant(query, contexte));
    return envelopperReponse(AuditForensicPresenter.presenter(sortie as never), contexte, startedAt);
  }
}
