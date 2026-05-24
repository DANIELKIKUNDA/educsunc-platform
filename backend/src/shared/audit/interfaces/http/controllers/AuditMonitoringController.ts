import { envelopperReponse, extraireContexteRuntime } from './AuditControllerSupport';
import type { AuditHttpControllerResponse, AuditHttpRequest } from './HttpAuditControllerTypes';
import { AuditMonitoringQueryValidator } from '../validators';
import { AuditMonitoringPresenter } from '../presenters';

export class AuditMonitoringController {
  public constructor(
    private readonly obtenirHealth: (() => Promise<unknown>) | undefined = undefined,
    private readonly obtenirMetrics: (() => Promise<unknown>) | undefined = undefined,
    private readonly obtenirQueues: (() => Promise<unknown>) | undefined = undefined,
    private readonly obtenirReplay: (() => Promise<unknown>) | undefined = undefined,
    private readonly obtenirRetry: (() => Promise<unknown>) | undefined = undefined,
    private readonly obtenirTraces: (() => Promise<unknown>) | undefined = undefined,
    private readonly obtenirAnomalies: (() => Promise<unknown>) | undefined = undefined,
    private readonly obtenirVolumetrie: (() => Promise<unknown>) | undefined = undefined,
    private readonly obtenirTenants: (() => Promise<unknown>) | undefined = undefined,
  ) {}

  public async health(requete: AuditHttpRequest): Promise<AuditHttpControllerResponse<unknown>> {
    AuditMonitoringQueryValidator.valider(undefined);
    return this.executer(this.obtenirHealth, requete, { statut: 'OK' });
  }
  public async metrics(requete: AuditHttpRequest): Promise<AuditHttpControllerResponse<unknown>> {
    AuditMonitoringQueryValidator.valider((requete as AuditHttpRequest<never, never, unknown>).query);
    return this.executer(this.obtenirMetrics, requete, { metrics: [] });
  }
  public async queues(requete: AuditHttpRequest): Promise<AuditHttpControllerResponse<unknown>> {
    AuditMonitoringQueryValidator.valider((requete as AuditHttpRequest<never, never, unknown>).query);
    return this.executer(this.obtenirQueues, requete, { queues: [] });
  }
  public async replay(requete: AuditHttpRequest): Promise<AuditHttpControllerResponse<unknown>> {
    AuditMonitoringQueryValidator.valider((requete as AuditHttpRequest<never, never, unknown>).query);
    return this.executer(this.obtenirReplay, requete, { replay: [] });
  }
  public async retry(requete: AuditHttpRequest): Promise<AuditHttpControllerResponse<unknown>> {
    AuditMonitoringQueryValidator.valider((requete as AuditHttpRequest<never, never, unknown>).query);
    return this.executer(this.obtenirRetry, requete, { retry: [] });
  }
  public async traces(requete: AuditHttpRequest): Promise<AuditHttpControllerResponse<unknown>> {
    AuditMonitoringQueryValidator.valider((requete as AuditHttpRequest<never, never, unknown>).query);
    return this.executer(this.obtenirTraces, requete, { traces: [] });
  }
  public async anomalies(requete: AuditHttpRequest): Promise<AuditHttpControllerResponse<unknown>> {
    AuditMonitoringQueryValidator.valider((requete as AuditHttpRequest<never, never, unknown>).query);
    return this.executer(this.obtenirAnomalies, requete, { anomalies: [] });
  }
  public async volumetrie(requete: AuditHttpRequest): Promise<AuditHttpControllerResponse<unknown>> {
    AuditMonitoringQueryValidator.valider((requete as AuditHttpRequest<never, never, unknown>).query);
    return this.executer(this.obtenirVolumetrie, requete, { volumetrie: [] });
  }
  public async tenants(requete: AuditHttpRequest): Promise<AuditHttpControllerResponse<unknown>> {
    AuditMonitoringQueryValidator.valider((requete as AuditHttpRequest<never, never, unknown>).query);
    return this.executer(this.obtenirTenants, requete, { tenants: [] });
  }

  private async executer(
    dependance: (() => Promise<unknown>) | undefined,
    requete: AuditHttpRequest,
    fallback: unknown,
  ): Promise<AuditHttpControllerResponse<unknown>> {
    const startedAt = Date.now();
    const contexte = extraireContexteRuntime(requete);
    const sortie = dependance ? await dependance() : fallback;
    return envelopperReponse(AuditMonitoringPresenter.presenter(sortie), contexte, startedAt);
  }
}
