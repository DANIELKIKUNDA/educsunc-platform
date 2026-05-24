import type { AuditHttpControllerResponse, AuditHttpRequest } from '../../http/controllers';
import { envelopperReponse, extraireContexteRuntime } from '../../http/controllers/AuditControllerSupport';
import { AuditWorkersAnalyticsInterface } from '../analytics/AuditWorkersAnalyticsInterface';
import { AuditWorkersBatchingInterface } from '../batching/AuditWorkersBatchingInterface';
import { AuditWorkersCheckpointsInterface } from '../checkpoints/AuditWorkersCheckpointsInterface';
import { AuditWorkersDeadLetterInterface } from '../dead-letter/AuditWorkersDeadLetterInterface';
import { AuditWorkersExportsInterface } from '../exports/AuditWorkersExportsInterface';
import { AuditWorkersForensicInterface } from '../forensic/AuditWorkersForensicInterface';
import { AuditWorkersMonitoringInterface } from '../monitoring/AuditWorkersMonitoringInterface';
import { AuditWorkersObservabilityInterface } from '../observability/AuditWorkersObservabilityInterface';
import { AuditWorkersOrchestrationInterface } from '../orchestration/AuditWorkersOrchestrationInterface';
import { AuditWorkersInterfacePresenter } from '../presenters';
import { AuditWorkersProjectionsInterface } from '../projections/AuditWorkersProjectionsInterface';
import { AuditWorkersQueuesInterface } from '../queues/AuditWorkersQueuesInterface';
import { AuditWorkersRecoveryInterface } from '../recovery/AuditWorkersRecoveryInterface';
import { AuditWorkersReplayInterface } from '../replay/AuditWorkersReplayInterface';
import { AuditWorkersRetentionInterface } from '../retention/AuditWorkersRetentionInterface';
import { AuditWorkersRetryInterface } from '../retry/AuditWorkersRetryInterface';
import { AuditWorkersSchedulersInterface } from '../schedulers/AuditWorkersSchedulersInterface';
import { AuditWorkersSecurityInterface } from '../security/AuditWorkersSecurityInterface';
import { AuditWorkersSynchronizationInterface } from '../synchronization/AuditWorkersSynchronizationInterface';
import { AuditWorkersRuntimeInterface } from '../workers/AuditWorkersRuntimeInterface';

export class AuditWorkersInterfaceController {
  public async queues(requete: AuditHttpRequest): Promise<AuditHttpControllerResponse<unknown>> {
    const ctx = extraireContexteRuntime(requete);
    return this.remap(requete, AuditWorkersInterfacePresenter.presenterQueue(
      AuditWorkersQueuesInterface.creer('replay-queue', ctx.correlationId, ctx.organisationId, ctx.ecoleId),
    ));
  }
  public async workers(requete: AuditHttpRequest): Promise<AuditHttpControllerResponse<unknown>> {
    return this.remap(requete, AuditWorkersInterfacePresenter.presenterWorker(AuditWorkersRuntimeInterface.creer('SYNC')));
  }
  public async schedulers(requete: AuditHttpRequest): Promise<AuditHttpControllerResponse<unknown>> {
    return this.remap(requete, AuditWorkersInterfacePresenter.presenterScheduler(AuditWorkersSchedulersInterface.creer()));
  }
  public async replay(requete: AuditHttpRequest): Promise<AuditHttpControllerResponse<unknown>> {
    return this.remap(requete, AuditWorkersInterfacePresenter.presenterReplay(AuditWorkersReplayInterface.creer()));
  }
  public async retry(requete: AuditHttpRequest): Promise<AuditHttpControllerResponse<unknown>> {
    return this.remap(requete, AuditWorkersInterfacePresenter.presenterRetry(AuditWorkersRetryInterface.creer()));
  }
  public async synchronization(requete: AuditHttpRequest): Promise<AuditHttpControllerResponse<unknown>> {
    return this.remap(requete, AuditWorkersInterfacePresenter.presenterSynchronization(AuditWorkersSynchronizationInterface.creer()));
  }
  public async exports(requete: AuditHttpRequest): Promise<AuditHttpControllerResponse<unknown>> {
    return this.remap(requete, AuditWorkersInterfacePresenter.presenterExport(AuditWorkersExportsInterface.creer()));
  }
  public async retention(requete: AuditHttpRequest): Promise<AuditHttpControllerResponse<unknown>> {
    return this.remap(requete, AuditWorkersInterfacePresenter.presenterRetention(AuditWorkersRetentionInterface.creer()));
  }
  public async analytics(requete: AuditHttpRequest): Promise<AuditHttpControllerResponse<unknown>> {
    return this.remap(requete, AuditWorkersInterfacePresenter.presenterAnalytics(AuditWorkersAnalyticsInterface.creer()));
  }
  public async projections(requete: AuditHttpRequest): Promise<AuditHttpControllerResponse<unknown>> {
    return this.remap(requete, AuditWorkersInterfacePresenter.presenterProjection(AuditWorkersProjectionsInterface.creer()));
  }
  public async deadLetter(requete: AuditHttpRequest): Promise<AuditHttpControllerResponse<unknown>> {
    return this.remap(requete, AuditWorkersInterfacePresenter.presenterDeadLetter(AuditWorkersDeadLetterInterface.creer()));
  }
  public async checkpoints(requete: AuditHttpRequest): Promise<AuditHttpControllerResponse<unknown>> {
    return this.remap(requete, AuditWorkersInterfacePresenter.presenterCheckpoint(AuditWorkersCheckpointsInterface.creer()));
  }
  public async orchestration(requete: AuditHttpRequest): Promise<AuditHttpControllerResponse<unknown>> {
    return this.remap(requete, AuditWorkersInterfacePresenter.presenterOrchestration(AuditWorkersOrchestrationInterface.creer()));
  }
  public async forensic(requete: AuditHttpRequest): Promise<AuditHttpControllerResponse<unknown>> {
    return this.remap(requete, AuditWorkersInterfacePresenter.presenterForensic(AuditWorkersForensicInterface.creer()));
  }
  public async monitoring(requete: AuditHttpRequest): Promise<AuditHttpControllerResponse<unknown>> {
    return this.remap(requete, AuditWorkersInterfacePresenter.presenterMonitoring(AuditWorkersMonitoringInterface.creer()));
  }
  public async recovery(requete: AuditHttpRequest): Promise<AuditHttpControllerResponse<unknown>> {
    return this.remap(requete, AuditWorkersInterfacePresenter.presenterRecovery(AuditWorkersRecoveryInterface.creer()));
  }
  public async security(requete: AuditHttpRequest): Promise<AuditHttpControllerResponse<unknown>> {
    return this.remap(requete, AuditWorkersInterfacePresenter.presenterSecurity(AuditWorkersSecurityInterface.creer()));
  }
  public async observability(requete: AuditHttpRequest): Promise<AuditHttpControllerResponse<unknown>> {
    const ctx = extraireContexteRuntime(requete);
    return this.remap(requete, AuditWorkersInterfacePresenter.presenterObservability(AuditWorkersObservabilityInterface.creer(ctx.requestId, ctx.correlationId)));
  }
  public async batching(requete: AuditHttpRequest): Promise<AuditHttpControllerResponse<unknown>> {
    return this.remap(requete, AuditWorkersInterfacePresenter.presenterQueue(AuditWorkersBatchingInterface.creer()));
  }

  private remap(requete: AuditHttpRequest, donnee: unknown): AuditHttpControllerResponse<unknown> {
    const startedAt = Date.now();
    const contexte = extraireContexteRuntime(requete);
    return envelopperReponse(donnee, contexte, startedAt);
  }
}

