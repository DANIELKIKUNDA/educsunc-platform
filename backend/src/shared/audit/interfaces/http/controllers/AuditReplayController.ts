import type { OfflineAuditReplayInput } from 'shared/audit/application';
import { executerDependance, envelopperReponse, extraireContexteRuntime } from './AuditControllerSupport';
import type { AuditExecutable, AuditHttpControllerResponse, AuditHttpRequest } from './HttpAuditControllerTypes';
import { AuditReplayBatchValidator, AuditReplayOfflineValidator } from '../validators';

export class AuditReplayController {
  public constructor(
    private readonly rejouerOffline: AuditExecutable<OfflineAuditReplayInput, unknown>,
    private readonly rejouerProjections: ((payload: Record<string, unknown>) => Promise<unknown>) | undefined = undefined,
    private readonly rejouerAnalytics: ((payload: Record<string, unknown>) => Promise<unknown>) | undefined = undefined,
    private readonly rejouerForensic: ((payload: Record<string, unknown>) => Promise<unknown>) | undefined = undefined,
  ) {}

  public async rejouerOfflineAudit(
    requete: AuditHttpRequest<OfflineAuditReplayInput>,
  ): Promise<AuditHttpControllerResponse<unknown>> {
    const startedAt = Date.now();
    const contexte = extraireContexteRuntime(requete);
    const sortie = await executerDependance(this.rejouerOffline, AuditReplayOfflineValidator.valider(requete.body));
    return envelopperReponse(sortie, contexte, startedAt);
  }

  public async rejouerProjectionsAudit(requete: AuditHttpRequest<Record<string, unknown>>): Promise<AuditHttpControllerResponse<unknown>> {
    return this.executerGeneric(this.rejouerProjections, requete, { ...AuditReplayBatchValidator.valider(requete.body), cible: 'PROJECTIONS' });
  }

  public async rejouerAnalyticsAudit(requete: AuditHttpRequest<Record<string, unknown>>): Promise<AuditHttpControllerResponse<unknown>> {
    return this.executerGeneric(this.rejouerAnalytics, requete, { ...AuditReplayBatchValidator.valider(requete.body), cible: 'ANALYTICS' });
  }

  public async rejouerForensicAudit(requete: AuditHttpRequest<Record<string, unknown>>): Promise<AuditHttpControllerResponse<unknown>> {
    return this.executerGeneric(this.rejouerForensic, requete, { ...AuditReplayBatchValidator.valider(requete.body), cible: 'FORENSIC' });
  }

  private async executerGeneric(
    dependance: ((payload: Record<string, unknown>) => Promise<unknown>) | undefined,
    requete: AuditHttpRequest<Record<string, unknown>>,
    payload: Record<string, unknown>,
  ): Promise<AuditHttpControllerResponse<unknown>> {
    const startedAt = Date.now();
    const contexte = extraireContexteRuntime(requete);
    const sortie = dependance
      ? await dependance({
          ...payload,
          correlationId: contexte.correlationId,
          organisationId: contexte.organisationId,
          ecoleId: contexte.ecoleId,
          modeOffline: contexte.modeOffline,
          deviceId: contexte.deviceId,
        })
      : { accepte: true, payload };
    return envelopperReponse(sortie, contexte, startedAt);
  }
}
