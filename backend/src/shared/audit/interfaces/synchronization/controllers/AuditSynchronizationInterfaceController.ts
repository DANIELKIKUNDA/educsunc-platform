import type { AuditHttpControllerResponse, AuditHttpRequest } from '../../http/controllers';
import { AuditSynchronizationController } from '../../http/controllers';
import { envelopperReponse, extraireContexteRuntime } from '../../http/controllers/AuditControllerSupport';
import { AuditSynchronizationAnalyticsInterface } from '../analytics/AuditSynchronizationAnalyticsInterface';
import { AuditSynchronizationBatchingInterface } from '../batching/AuditSynchronizationBatchingInterface';
import { AuditSynchronizationCheckpointsInterface } from '../checkpoints/AuditSynchronizationCheckpointsInterface';
import { AuditSynchronizationChronologyInterface } from '../chronology/AuditSynchronizationChronologyInterface';
import { AuditSynchronizationConflictsInterface } from '../conflicts/AuditSynchronizationConflictsInterface';
import { AuditSynchronizationDevicesInterface } from '../devices/AuditSynchronizationDevicesInterface';
import { AuditSynchronizationForensicInterface } from '../forensic/AuditSynchronizationForensicInterface';
import { AuditSynchronizationIncrementalInterface } from '../incremental/AuditSynchronizationIncrementalInterface';
import { AuditSynchronizationMonitoringInterface } from '../monitoring/AuditSynchronizationMonitoringInterface';
import { AuditSynchronizationOrchestrationInterface } from '../orchestration/AuditSynchronizationOrchestrationInterface';
import { AuditSynchronizationInterfacePresenter } from '../presenters';
import { AuditSynchronizationQueuesInterface } from '../queues/AuditSynchronizationQueuesInterface';
import { AuditSynchronizationRecoveryInterface } from '../recovery/AuditSynchronizationRecoveryInterface';
import { AuditSynchronizationReplayInterface } from '../replay/AuditSynchronizationReplayInterface';
import { AuditSynchronizationRetryInterface } from '../retry/AuditSynchronizationRetryInterface';
import { AuditSynchronizationWorkersInterface } from '../workers/AuditSynchronizationWorkersInterface';
import type { AuditSynchronizationStatusDto } from '../dto';

export class AuditSynchronizationInterfaceController {
  constructor(private readonly httpController: AuditSynchronizationController) {}

  public async synchroniser(requete: AuditHttpRequest): Promise<AuditHttpControllerResponse<unknown>> {
    const sortie = await this.httpController.synchroniserAudit(requete as never);
    return this.remapper(
      requete,
      AuditSynchronizationInterfacePresenter.presenterStatus(this.extraireStatus(sortie)),
    );
  }

  public async replay(requete: AuditHttpRequest): Promise<AuditHttpControllerResponse<unknown>> {
    await this.httpController.rejouerSynchronisation(requete as never);
    return this.remapper(
      requete,
      AuditSynchronizationInterfacePresenter.presenterReplay(
        AuditSynchronizationReplayInterface.creer(),
      ),
    );
  }

  public async retry(requete: AuditHttpRequest): Promise<AuditHttpControllerResponse<unknown>> {
    const sortie = await this.httpController.marquerSynchronisation(requete as never);
    const statut = this.extraireStatus(sortie);
    return this.remapper(
      requete,
      AuditSynchronizationInterfacePresenter.presenterRetry(
        AuditSynchronizationRetryInterface.creer({
          retryCount: statut.retry ? 1 : 0,
          retryHistory: statut.retry ? ['SYNC_STATUS'] : [],
        }),
      ),
    );
  }

  public async chronology(requete: AuditHttpRequest): Promise<AuditHttpControllerResponse<unknown>> {
    const sortie = await this.httpController.obtenirStatutSynchronisation(requete);
    const statut = this.extraireStatus(sortie);
    return this.remapper(
      requete,
      AuditSynchronizationInterfacePresenter.presenterChronology(
        AuditSynchronizationChronologyInterface.creer({
          dateSync: statut.horodatage,
        }),
      ),
    );
  }

  public async conflicts(requete: AuditHttpRequest): Promise<AuditHttpControllerResponse<unknown>> {
    const sortie = await this.httpController.recupererSynchronisation(requete as never);
    const statut = this.extraireStatus(sortie);
    return this.remapper(
      requete,
      AuditSynchronizationInterfacePresenter.presenterConflict(
        AuditSynchronizationConflictsInterface.creer({
          auditId: statut.auditId,
          typeConflit: statut.conflit ? 'CHRONOLOGIQUE' : 'MODIFICATION',
        }),
      ),
    );
  }

  public async devices(requete: AuditHttpRequest): Promise<AuditHttpControllerResponse<unknown>> {
    const statut = this.extraireStatus(await this.httpController.obtenirStatutSynchronisation(requete));
    return this.remapper(
      requete,
      AuditSynchronizationInterfacePresenter.presenterDevice(
        AuditSynchronizationDevicesInterface.creer({
          deviceId: requete.context?.deviceId,
          lastSync: statut.horodatage,
        }),
      ),
    );
  }

  public async recovery(requete: AuditHttpRequest): Promise<AuditHttpControllerResponse<unknown>> {
    await this.httpController.recupererSynchronisation(requete as never);
    return this.remapper(
      requete,
      AuditSynchronizationInterfacePresenter.presenterRecovery(
        AuditSynchronizationRecoveryInterface.creer(requete.context?.requestId ?? 'sync-recovery'),
      ),
    );
  }

  public async queues(requete: AuditHttpRequest): Promise<AuditHttpControllerResponse<unknown>> {
    const statut = this.extraireStatus(await this.httpController.obtenirStatutSynchronisation(requete));
    return this.remapper(
      requete,
      AuditSynchronizationInterfacePresenter.presenterQueue(
        AuditSynchronizationQueuesInterface.creer({
          backlog: statut.enAttente,
          retries: statut.retry ? 1 : 0,
        }),
      ),
    );
  }

  public async workers(requete: AuditHttpRequest): Promise<AuditHttpControllerResponse<unknown>> {
    return this.remapper(
      requete,
      AuditSynchronizationInterfacePresenter.presenterWorker(
        AuditSynchronizationWorkersInterface.creer({ syncWorkers: 1 }),
      ),
    );
  }

  public async orchestration(requete: AuditHttpRequest): Promise<AuditHttpControllerResponse<unknown>> {
    return this.remapper(
      requete,
      AuditSynchronizationInterfacePresenter.presenterOrchestration(
        AuditSynchronizationOrchestrationInterface.creer({ queues: 1, workers: 1, projections: 1, monitoring: 1, forensic: 1 }),
      ),
    );
  }

  public async monitoring(requete: AuditHttpRequest): Promise<AuditHttpControllerResponse<unknown>> {
    const statut = this.extraireStatus(await this.httpController.obtenirStatutSynchronisation(requete));
    return this.remapper(
      requete,
      AuditSynchronizationInterfacePresenter.presenterMonitoring(
        AuditSynchronizationMonitoringInterface.creer({
          syncFailures: statut.enConflit,
          replaySync: statut.replay ? 1 : 0,
          appareilsOffline: statut.enAttente,
          conflits: statut.enConflit,
        }),
      ),
    );
  }

  public async forensic(requete: AuditHttpRequest): Promise<AuditHttpControllerResponse<unknown>> {
    return this.remapper(
      requete,
      AuditSynchronizationInterfacePresenter.presenterForensic(
        AuditSynchronizationForensicInterface.creer(),
      ),
    );
  }

  public async analytics(requete: AuditHttpRequest): Promise<AuditHttpControllerResponse<unknown>> {
    const statut = this.extraireStatus(await this.httpController.obtenirStatutSynchronisation(requete));
    return this.remapper(
      requete,
      AuditSynchronizationInterfacePresenter.presenterAnalytics(
        AuditSynchronizationAnalyticsInterface.creer({
          checkpoints: statut.synchronises,
          batchs: statut.total,
          incrementaux: statut.enAttente,
        }),
      ),
    );
  }

  public async batching(requete: AuditHttpRequest): Promise<AuditHttpControllerResponse<unknown>> {
    return this.remapper(
      requete,
      AuditSynchronizationInterfacePresenter.presenterBatching(
        AuditSynchronizationBatchingInterface.creer(),
      ),
    );
  }

  public async incremental(requete: AuditHttpRequest): Promise<AuditHttpControllerResponse<unknown>> {
    return this.remapper(
      requete,
      AuditSynchronizationInterfacePresenter.presenterIncremental(
        AuditSynchronizationIncrementalInterface.creer(),
      ),
    );
  }

  public async checkpoints(requete: AuditHttpRequest): Promise<AuditHttpControllerResponse<unknown>> {
    const statut = this.extraireStatus(await this.httpController.obtenirStatutSynchronisation(requete));
    return this.remapper(
      requete,
      AuditSynchronizationInterfacePresenter.presenterCheckpoint(
        AuditSynchronizationCheckpointsInterface.creer({
          derniereSynchronisationValide: statut.horodatage,
          dernierEvenement: statut.auditId,
        }),
      ),
    );
  }

  private remapper(requete: AuditHttpRequest, donnee: unknown): AuditHttpControllerResponse<unknown> {
    const startedAt = Date.now();
    const contexte = extraireContexteRuntime(requete);
    return envelopperReponse(donnee, contexte, startedAt);
  }

  private extraireStatus(sortie: AuditHttpControllerResponse<unknown>): AuditSynchronizationStatusDto {
    const data = ((sortie.donnee as { data?: unknown }).data ?? sortie.donnee) as Record<string, unknown>;
    return {
      total: Number(data.total ?? 0),
      synchronises: Number(data.synchronises ?? 0),
      enConflit: Number(data.enConflit ?? 0),
      enAttente: Number(data.enAttente ?? 0),
      auditId: typeof data.auditId === 'string' ? data.auditId : undefined,
      statutSynchronisation:
        typeof data.statutSynchronisation === 'string' ? data.statutSynchronisation : undefined,
      replay: data.replay === true,
      retry: data.retry === true,
      conflit: data.conflit === true,
      horodatage: typeof data.horodatage === 'string' ? data.horodatage : undefined,
    };
  }
}

