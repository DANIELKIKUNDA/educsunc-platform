import { obtenirSharedEventBus } from '../../../../infrastructure/bus';
import type { AuditCreationApplicationService } from '../../../application/services/AuditCreationApplicationService';
import type { PostgresAuditEventBus } from '../../../infrastructure/event-bus';
import { AuditIntegrationEventDispatcher } from '../dispatchers/AuditIntegrationEventDispatcher';
import { AuditRuntimeEventHandler } from '../handlers/AuditRuntimeEventHandler';
import { AuditEventPublisher } from '../publishers/AuditEventPublisher';
import { AuditIntegrationReplayService } from '../replay/AuditIntegrationReplayService';
import { AuditIntegrationRetryService } from '../retry/AuditIntegrationRetryService';
import { AuditSystemSubscriber } from '../subscribers/AuditSystemSubscriber';
import { AuditEventBusObservability } from '../observability/AuditEventBusObservability';

// Cet orchestrateur raccorde Audit au bus partage central sans remplacer le bus interne existant.
export class AuditEventBusIntegrationOrchestrator {
  public readonly publisher = new AuditEventPublisher();
  public readonly dispatcher: AuditIntegrationEventDispatcher;
  public readonly replay: AuditIntegrationReplayService;
  public readonly retry: AuditIntegrationRetryService;
  public readonly observability = new AuditEventBusObservability();

  public constructor(
    auditBus: PostgresAuditEventBus,
    creationService: AuditCreationApplicationService,
  ) {
    this.dispatcher = new AuditIntegrationEventDispatcher(auditBus);
    this.replay = new AuditIntegrationReplayService(this.dispatcher);
    this.retry = new AuditIntegrationRetryService(this.dispatcher);

    const sharedBus = obtenirSharedEventBus();
    const runtimeHandler = new AuditRuntimeEventHandler(creationService);
    const subscriber = new AuditSystemSubscriber(runtimeHandler);

    sharedBus.enregistrer({
      eventNames: subscriber.eventNames,
      handle: async (envelope) => {
        await subscriber.handle(envelope);
        await this.dispatcher.dispatch(envelope);
      },
    });
  }
}

