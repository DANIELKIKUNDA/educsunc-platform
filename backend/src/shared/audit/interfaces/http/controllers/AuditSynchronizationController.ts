import type {
  CreateOfflineAuditEntryInput,
  OfflineAuditConflictInput,
  OfflineAuditReplayInput,
  OfflineAuditSyncStatusInput,
} from 'shared/audit/application';
import { executerDependance, envelopperReponse, extraireContexteRuntime } from './AuditControllerSupport';
import type { AuditExecutable, AuditHttpControllerResponse, AuditHttpRequest } from './HttpAuditControllerTypes';
import {
  AuditSyncCreateValidator,
  AuditSyncRecoveryValidator,
  AuditSyncReplayValidator,
  AuditSyncStatusValidator,
} from '../validators';
import { AuditMonitoringPresenter, AuditSynchronizationPresenter } from '../presenters';

export class AuditSynchronizationController {
  public constructor(
    private readonly creerAuditOffline: AuditExecutable<CreateOfflineAuditEntryInput, unknown>,
    private readonly marquerSynchronise: AuditExecutable<OfflineAuditSyncStatusInput, unknown>,
    private readonly rejouerAuditOffline: AuditExecutable<OfflineAuditReplayInput, unknown>,
    private readonly resoudreConflit: AuditExecutable<OfflineAuditConflictInput, unknown>,
    private readonly obtenirStatut: (() => Promise<unknown>) | AuditExecutable<void, unknown>,
  ) {}

  public async synchroniserAudit(
    requete: AuditHttpRequest<CreateOfflineAuditEntryInput>,
  ): Promise<AuditHttpControllerResponse<unknown>> {
    return this.executer(this.creerAuditOffline, requete, AuditSyncCreateValidator.valider(requete.body));
  }

  public async rejouerSynchronisation(
    requete: AuditHttpRequest<OfflineAuditReplayInput>,
  ): Promise<AuditHttpControllerResponse<unknown>> {
    return this.executer(this.rejouerAuditOffline, requete, AuditSyncReplayValidator.valider(requete.body));
  }

  public async recupererSynchronisation(
    requete: AuditHttpRequest<OfflineAuditConflictInput>,
  ): Promise<AuditHttpControllerResponse<unknown>> {
    return this.executer(this.resoudreConflit, requete, AuditSyncRecoveryValidator.valider(requete.body));
  }

  public async marquerSynchronisation(
    requete: AuditHttpRequest<OfflineAuditSyncStatusInput>,
  ): Promise<AuditHttpControllerResponse<unknown>> {
    return this.executer(this.marquerSynchronise, requete, AuditSyncStatusValidator.valider(requete.body));
  }

  public async obtenirStatutSynchronisation(requete: AuditHttpRequest): Promise<AuditHttpControllerResponse<unknown>> {
    const startedAt = Date.now();
    const contexte = extraireContexteRuntime(requete);
    const sortie =
      typeof this.obtenirStatut === 'function'
        ? await this.obtenirStatut()
        : await this.obtenirStatut.executer(undefined as void);
    return envelopperReponse(AuditSynchronizationPresenter.presenter(sortie as never), contexte, startedAt);
  }

  private async executer<TInput>(
    dependance: AuditExecutable<TInput, unknown>,
    requete: AuditHttpRequest<TInput>,
    payload: TInput,
  ): Promise<AuditHttpControllerResponse<unknown>> {
    const startedAt = Date.now();
    const contexte = extraireContexteRuntime(requete);
    const sortie = await executerDependance(dependance, payload);
    return envelopperReponse(AuditMonitoringPresenter.presenter(sortie), contexte, startedAt);
  }
}
