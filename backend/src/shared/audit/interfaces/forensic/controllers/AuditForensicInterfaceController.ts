import type { AuditHttpControllerResponse, AuditHttpRequest } from '../../http/controllers';
import { AuditForensicController } from '../../http/controllers';
import { envelopperReponse, extraireContexteRuntime } from '../../http/controllers/AuditControllerSupport';
import { AuditForensicAnalyticsInterface } from '../analytics/AuditForensicAnalyticsInterface';
import { AuditForensicChronologyInterface } from '../chronology/AuditForensicChronologyInterface';
import { AuditForensicCorrelationInterface } from '../correlation/AuditForensicCorrelationInterface';
import { AuditForensicDeviceInterface } from '../devices/AuditForensicDeviceInterface';
import { AuditForensicIncidentInterface } from '../incidents/AuditForensicIncidentInterface';
import { AuditForensicMaskingInterface } from '../masking/AuditForensicMaskingInterface';
import { AuditForensicMonitoringInterface } from '../monitoring/AuditForensicMonitoringInterface';
import { AuditForensicInterfacePresenter } from '../presenters';
import { AuditForensicRecoveryInterface } from '../recovery/AuditForensicRecoveryInterface';
import { AuditForensicReplayInterface } from '../replay/AuditForensicReplayInterface';
import { AuditForensicRetryInterface } from '../retry/AuditForensicRetryInterface';
import { AuditForensicSessionInterface } from '../sessions/AuditForensicSessionInterface';
import { AuditForensicSynchronizationInterface } from '../synchronization/AuditForensicSynchronizationInterface';
import { AuditForensicTimelineInterface } from '../timeline/AuditForensicTimelineInterface';
import type { AuditForensicMonitoringDto } from '../dto';
import { AuditForensicInterfaceValidators } from '../validators';

export class AuditForensicInterfaceController {
  constructor(
    private readonly httpController: AuditForensicController,
    private readonly superviser?: () => Promise<Partial<AuditForensicMonitoringDto>>,
  ) {}

  public async correlation(
    requete: AuditHttpRequest<never, { id?: string }>,
  ): Promise<AuditHttpControllerResponse<unknown>> {
    const sortie = await this.httpController.investiguerCorrelation(requete);
    const data = ((sortie.donnee as { data?: unknown }).data ?? sortie.donnee) as never;
    return this.remapper(requete, AuditForensicInterfacePresenter.presenterCorrelation(
      AuditForensicCorrelationInterface.creer(data),
    ));
  }

  public async timeline(
    requete: AuditHttpRequest<never, { id?: string }>,
  ): Promise<AuditHttpControllerResponse<unknown>> {
    const sortie = await this.httpController.investiguerTimeline(requete);
    const data = ((sortie.donnee as { data?: unknown }).data ?? sortie.donnee) as never;
    return this.remapper(requete, AuditForensicInterfacePresenter.presenterTimeline(
      AuditForensicTimelineInterface.creer(data),
    ));
  }

  public async chronology(
    requete: AuditHttpRequest<never, { id?: string }>,
  ): Promise<AuditHttpControllerResponse<unknown>> {
    const sortie = await this.httpController.investiguerTimeline(requete);
    const data = ((sortie.donnee as { data?: unknown }).data ?? sortie.donnee) as never;
    return this.remapper(requete, AuditForensicInterfacePresenter.presenterTimeline(
      AuditForensicChronologyInterface.creer(data),
    ));
  }

  public async session(
    requete: AuditHttpRequest<never, { id?: string }>,
  ): Promise<AuditHttpControllerResponse<unknown>> {
    const sortie = await this.httpController.investiguerSession(requete);
    const data = ((sortie.donnee as { data?: unknown }).data ?? sortie.donnee) as never;
    const { id } = AuditForensicInterfaceValidators.validerIdentifiant(requete.params);
    return this.remapper(requete, AuditForensicInterfacePresenter.presenterSession(
      AuditForensicSessionInterface.creer(data, id),
    ));
  }

  public async device(
    requete: AuditHttpRequest<never, { id?: string }>,
  ): Promise<AuditHttpControllerResponse<unknown>> {
    const sortie = await this.httpController.investiguerDevice(requete);
    const data = ((sortie.donnee as { data?: unknown }).data ?? sortie.donnee) as never;
    const { id } = AuditForensicInterfaceValidators.validerIdentifiant(requete.params);
    return this.remapper(requete, AuditForensicInterfacePresenter.presenterDevice(
      AuditForensicDeviceInterface.creer(data, id),
    ));
  }

  public async replay(
    requete: AuditHttpRequest<never, { id?: string }>,
  ): Promise<AuditHttpControllerResponse<unknown>> {
    const sortie = await this.httpController.investiguerTimeline(requete);
    const data = ((sortie.donnee as { data?: unknown }).data ?? sortie.donnee) as never;
    return this.remapper(requete, AuditForensicInterfacePresenter.presenterTimeline(
      AuditForensicReplayInterface.creer(data),
    ));
  }

  public async retry(
    requete: AuditHttpRequest<never, { id?: string }>,
  ): Promise<AuditHttpControllerResponse<unknown>> {
    const sortie = await this.httpController.investiguerTimeline(requete);
    const data = ((sortie.donnee as { data?: unknown }).data ?? sortie.donnee) as never;
    return this.remapper(requete, AuditForensicInterfacePresenter.presenterTimeline(
      AuditForensicRetryInterface.creer(data),
    ));
  }

  public async synchronization(
    requete: AuditHttpRequest<never, { id?: string }>,
  ): Promise<AuditHttpControllerResponse<unknown>> {
    const sortie = await this.httpController.investiguerTimeline(requete);
    const data = ((sortie.donnee as { data?: unknown }).data ?? sortie.donnee) as never;
    return this.remapper(requete, AuditForensicInterfacePresenter.presenterTimeline(
      AuditForensicSynchronizationInterface.creer(data),
    ));
  }

  public async incident(
    requete: AuditHttpRequest<never, { id?: string }>,
  ): Promise<AuditHttpControllerResponse<unknown>> {
    const sortie = await this.httpController.investiguerIncidentSecurite(requete);
    const data = ((sortie.donnee as { data?: unknown }).data ?? sortie.donnee) as never;
    const { id } = AuditForensicInterfaceValidators.validerIdentifiant(requete.params);
    return this.remapper(requete, AuditForensicInterfacePresenter.presenterIncident(
      AuditForensicIncidentInterface.creer(data, id),
    ));
  }

  public async suspicions(
    requete: AuditHttpRequest,
  ): Promise<AuditHttpControllerResponse<unknown>> {
    const sortie = await this.httpController.detecterSuspicions(requete as never);
    const data = ((sortie.donnee as { data?: unknown }).data ?? sortie.donnee) as never;
    return this.remapper(requete, AuditForensicInterfacePresenter.presenterIncident(
      AuditForensicAnalyticsInterface.creer(data),
    ));
  }

  public async monitoring(requete: AuditHttpRequest): Promise<AuditHttpControllerResponse<unknown>> {
    const startedAt = Date.now();
    const contexte = extraireContexteRuntime(requete);
    const supervision = await this.superviser?.();
    return envelopperReponse(
      AuditForensicInterfacePresenter.presenterMonitoring(
        AuditForensicMonitoringInterface.creer(supervision),
      ),
      contexte,
      startedAt,
    );
  }

  public async masking(
    requete: AuditHttpRequest<never, { id?: string }>,
  ): Promise<AuditHttpControllerResponse<unknown>> {
    const sortie = await this.httpController.investiguerCorrelation(requete);
    const data = ((sortie.donnee as { data?: unknown }).data ?? sortie.donnee) as never;
    return this.remapper(requete, AuditForensicInterfacePresenter.presenterMasque(
      AuditForensicMaskingInterface.creer(data),
    ));
  }

  public async recovery(
    requete: AuditHttpRequest<never, { id?: string }>,
  ): Promise<AuditHttpControllerResponse<unknown>> {
    const startedAt = Date.now();
    const contexte = extraireContexteRuntime(requete);
    const { id } = AuditForensicInterfaceValidators.validerIdentifiant(requete.params);
    return envelopperReponse(
      AuditForensicInterfacePresenter.presenterRecovery(
        AuditForensicRecoveryInterface.creer(id),
      ),
      contexte,
      startedAt,
    );
  }

  private remapper(
    requete: AuditHttpRequest,
    donnee: unknown,
  ): AuditHttpControllerResponse<unknown> {
    const startedAt = Date.now();
    const contexte = extraireContexteRuntime(requete);
    return envelopperReponse(donnee, contexte, startedAt);
  }
}
