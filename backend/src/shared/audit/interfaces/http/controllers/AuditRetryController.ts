import type { OfflineAuditRetryInput } from 'shared/audit/application/dto/offline/OfflineAuditRetryInput';
import { envelopperReponse, extraireContexteRuntime } from './AuditControllerSupport';
import type { AuditHttpControllerResponse, AuditHttpRequest } from './HttpAuditControllerTypes';
import { AuditRetryExportValidator, AuditRetryJobValidator, AuditRetrySyncValidator } from '../validators';

export class AuditRetryController {
  public constructor(
    private readonly relancerTraitement: ((payload: Record<string, unknown>) => Promise<unknown>) | undefined = undefined,
    private readonly relancerExport: ((payload: Record<string, unknown>) => Promise<unknown>) | undefined = undefined,
    private readonly relancerSynchronisationOffline: ((payload: OfflineAuditRetryInput) => Promise<unknown>) | undefined = undefined,
  ) {}

  public async relancerJob(
    requete: AuditHttpRequest<Record<string, unknown>, { id?: string }>,
  ): Promise<AuditHttpControllerResponse<unknown>> {
    return this.executer(this.relancerTraitement, requete, AuditRetryJobValidator.valider(requete.params, requete.body));
  }

  public async relancerExportAudit(
    requete: AuditHttpRequest<Record<string, unknown>, { id?: string }>,
  ): Promise<AuditHttpControllerResponse<unknown>> {
    return this.executer(this.relancerExport, requete, AuditRetryExportValidator.valider(requete.params, requete.body));
  }

  public async relancerSynchronisation(
    requete: AuditHttpRequest<OfflineAuditRetryInput, { id?: string }>,
  ): Promise<AuditHttpControllerResponse<unknown>> {
    const startedAt = Date.now();
    const contexte = extraireContexteRuntime(requete);
    const sortie = this.relancerSynchronisationOffline
      ? await this.relancerSynchronisationOffline({
          ...AuditRetrySyncValidator.valider(requete.params, requete.body),
        })
      : { accepte: true, auditId: AuditRetrySyncValidator.valider(requete.params, requete.body).auditId };
    return envelopperReponse(sortie, contexte, startedAt);
  }

  private async executer(
    dependance: ((payload: Record<string, unknown>) => Promise<unknown>) | undefined,
    requete: AuditHttpRequest<Record<string, unknown>, { id?: string }>,
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
        })
      : { accepte: true, payload };
    return envelopperReponse(sortie, contexte, startedAt);
  }
}
