import type { AuditHttpControllerResponse, AuditHttpRequest } from '../../http/controllers';
import { AuditMonitoringController } from '../../http/controllers';
import { envelopperReponse, extraireContexteRuntime } from '../../http/controllers/AuditControllerSupport';
import { AuditMonitoringAlertsInterface } from '../alerts/AuditMonitoringAlertsInterface';
import { AuditMonitoringAnomaliesInterface } from '../anomalies/AuditMonitoringAnomaliesInterface';
import { AuditMonitoringExportsInterface } from '../exports/AuditMonitoringExportsInterface';
import { AuditMonitoringHealthInterface } from '../health/AuditMonitoringHealthInterface';
import { AuditMonitoringMetricsInterface } from '../metrics/AuditMonitoringMetricsInterface';
import { AuditMonitoringObservabilityInterface } from '../observability/AuditMonitoringObservabilityInterface';
import { AuditMonitoringInterfacePresenter } from '../presenters';
import { AuditMonitoringProjectionsInterface } from '../projections/AuditMonitoringProjectionsInterface';
import { AuditMonitoringQueuesInterface } from '../queues/AuditMonitoringQueuesInterface';
import { AuditMonitoringRecoveryInterface } from '../recovery/AuditMonitoringRecoveryInterface';
import { AuditMonitoringReplayInterface } from '../replay/AuditMonitoringReplayInterface';
import { AuditMonitoringRetryInterface } from '../retry/AuditMonitoringRetryInterface';
import { AuditMonitoringSynchronizationInterface } from '../synchronization/AuditMonitoringSynchronizationInterface';
import { AuditMonitoringTenantsInterface } from '../tenants/AuditMonitoringTenantsInterface';
import { AuditMonitoringTracesInterface } from '../traces/AuditMonitoringTracesInterface';
import { AuditMonitoringVolumetryInterface } from '../volumetry/AuditMonitoringVolumetryInterface';
import { AuditMonitoringWorkersInterface } from '../workers/AuditMonitoringWorkersInterface';

export class AuditMonitoringInterfaceController {
  constructor(private readonly httpController: AuditMonitoringController) {}

  public async health(requete: AuditHttpRequest): Promise<AuditHttpControllerResponse<unknown>> {
    const sortie = await this.httpController.health(requete);
    return this.remapper(
      requete,
      AuditMonitoringInterfacePresenter.presenterHealth(
        AuditMonitoringHealthInterface.creer(this.extraireData(sortie) as Record<string, unknown>),
      ),
    );
  }

  public async metrics(requete: AuditHttpRequest): Promise<AuditHttpControllerResponse<unknown>> {
    const sortie = await this.httpController.metrics(requete);
    return this.remapper(
      requete,
      AuditMonitoringInterfacePresenter.presenterMetrics(
        AuditMonitoringMetricsInterface.creer(this.extraireData(sortie) as Record<string, unknown>),
      ),
    );
  }

  public async traces(requete: AuditHttpRequest): Promise<AuditHttpControllerResponse<unknown>> {
    const sortie = await this.httpController.traces(requete);
    return this.remapper(
      requete,
      AuditMonitoringInterfacePresenter.presenterTraces(
        AuditMonitoringTracesInterface.creer(this.extraireData(sortie) as Record<string, unknown>),
      ),
    );
  }

  public async queues(requete: AuditHttpRequest): Promise<AuditHttpControllerResponse<unknown>> {
    const sortie = await this.httpController.queues(requete);
    return this.remapper(
      requete,
      AuditMonitoringInterfacePresenter.presenterQueues(
        AuditMonitoringQueuesInterface.creer(this.extraireData(sortie) as Record<string, unknown>),
      ),
    );
  }

  public async workers(requete: AuditHttpRequest): Promise<AuditHttpControllerResponse<unknown>> {
    const sortie = await this.httpController.queues(requete);
    return this.remapper(
      requete,
      AuditMonitoringInterfacePresenter.presenterWorkers(
        AuditMonitoringWorkersInterface.creer(this.extraireData(sortie) as Record<string, unknown>),
      ),
    );
  }

  public async replay(requete: AuditHttpRequest): Promise<AuditHttpControllerResponse<unknown>> {
    const sortie = await this.httpController.replay(requete);
    return this.remapper(
      requete,
      AuditMonitoringInterfacePresenter.presenterReplay(
        AuditMonitoringReplayInterface.creer(this.extraireData(sortie) as Record<string, unknown>),
      ),
    );
  }

  public async retry(requete: AuditHttpRequest): Promise<AuditHttpControllerResponse<unknown>> {
    const sortie = await this.httpController.retry(requete);
    return this.remapper(
      requete,
      AuditMonitoringInterfacePresenter.presenterRetry(
        AuditMonitoringRetryInterface.creer(this.extraireData(sortie) as Record<string, unknown>),
      ),
    );
  }

  public async synchronization(
    requete: AuditHttpRequest,
  ): Promise<AuditHttpControllerResponse<unknown>> {
    const sortie = await this.httpController.queues(requete);
    return this.remapper(
      requete,
      AuditMonitoringInterfacePresenter.presenterSynchronization(
        AuditMonitoringSynchronizationInterface.creer(this.extraireData(sortie) as Record<string, unknown>),
      ),
    );
  }

  public async exports(requete: AuditHttpRequest): Promise<AuditHttpControllerResponse<unknown>> {
    const sortie = await this.httpController.metrics(requete);
    return this.remapper(
      requete,
      AuditMonitoringInterfacePresenter.presenterExports(
        AuditMonitoringExportsInterface.creer(this.extraireData(sortie) as Record<string, unknown>),
      ),
    );
  }

  public async projections(
    requete: AuditHttpRequest,
  ): Promise<AuditHttpControllerResponse<unknown>> {
    const sortie = await this.httpController.metrics(requete);
    return this.remapper(
      requete,
      AuditMonitoringInterfacePresenter.presenterProjections(
        AuditMonitoringProjectionsInterface.creer(this.extraireData(sortie) as Record<string, unknown>),
      ),
    );
  }

  public async anomalies(
    requete: AuditHttpRequest,
  ): Promise<AuditHttpControllerResponse<unknown>> {
    const sortie = await this.httpController.anomalies(requete);
    return this.remapper(
      requete,
      AuditMonitoringInterfacePresenter.presenterAnomalies(
        AuditMonitoringAnomaliesInterface.creer(this.extraireData(sortie) as Record<string, unknown>),
      ),
    );
  }

  public async alerts(requete: AuditHttpRequest): Promise<AuditHttpControllerResponse<unknown>> {
    const sortie = await this.httpController.anomalies(requete);
    return this.remapper(
      requete,
      AuditMonitoringInterfacePresenter.presenterAlerts(
        AuditMonitoringAlertsInterface.creer(this.extraireData(sortie) as Record<string, unknown>),
      ),
    );
  }

  public async tenants(requete: AuditHttpRequest): Promise<AuditHttpControllerResponse<unknown>> {
    const sortie = await this.httpController.tenants(requete);
    return this.remapper(
      requete,
      AuditMonitoringInterfacePresenter.presenterTenants(
        AuditMonitoringTenantsInterface.creer(this.extraireData(sortie) as Record<string, unknown>),
      ),
    );
  }

  public async volumetrie(
    requete: AuditHttpRequest,
  ): Promise<AuditHttpControllerResponse<unknown>> {
    const sortie = await this.httpController.volumetrie(requete);
    return this.remapper(
      requete,
      AuditMonitoringInterfacePresenter.presenterVolumetrie(
        AuditMonitoringVolumetryInterface.creer(this.extraireData(sortie) as Record<string, unknown>),
      ),
    );
  }

  public async observability(
    requete: AuditHttpRequest,
  ): Promise<AuditHttpControllerResponse<unknown>> {
    const sortie = await this.httpController.metrics(requete);
    return this.remapper(
      requete,
      AuditMonitoringInterfacePresenter.presenterObservability(
        AuditMonitoringObservabilityInterface.creer(this.extraireData(sortie) as Record<string, unknown>),
      ),
    );
  }

  public async recovery(requete: AuditHttpRequest): Promise<AuditHttpControllerResponse<unknown>> {
    return this.remapper(
      requete,
      AuditMonitoringInterfacePresenter.presenterRecovery(AuditMonitoringRecoveryInterface.creer()),
    );
  }

  private remapper(requete: AuditHttpRequest, donnee: unknown): AuditHttpControllerResponse<unknown> {
    const startedAt = Date.now();
    const contexte = extraireContexteRuntime(requete);
    return envelopperReponse(donnee, contexte, startedAt);
  }

  private extraireData(sortie: AuditHttpControllerResponse<unknown>): unknown {
    return ((sortie.donnee as { data?: unknown }).data ?? sortie.donnee);
  }
}

