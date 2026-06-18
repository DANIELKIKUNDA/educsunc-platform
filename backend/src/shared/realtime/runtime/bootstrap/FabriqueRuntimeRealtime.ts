import {
  RealtimeAuthIntegrationOrchestrator,
  RealtimeConfigurationIntegrationOrchestrator,
  RealtimeMonitoringIntegrationOrchestrator,
  RealtimeSecurityIntegrationOrchestrator,
  RealtimeSynchronisationIntegrationOrchestrator,
} from '../../integration';
import { FacadeInfrastructureRealtime } from '../../infrastructure';
import {
  RuntimeCanauxRealtime,
  RuntimeDiffusionRealtime,
  RuntimeDispatchRealtime,
} from '../broadcast';
import {
  RuntimeIntegrationRealtimeCoordinator,
  RuntimeRealtimeCoordinator,
  RuntimeWorkersRealtimeCoordinator,
} from '../coordinators';
import { RuntimeConnexionsRealtime, RuntimeHeartbeatConnexionsRealtime, RuntimeRegistryConnexionsRealtime } from '../connections';
import { RuntimeHealthRealtime, RuntimeEtatRealtime } from '../health';
import { RuntimeObservabiliteRealtime, RuntimeDiagnosticsRealtime, RuntimeMetriquesRealtime } from '../observability';
import { RuntimeOfflineRealtime, RuntimeReconnexionRealtime, RuntimeReplayLegerRealtime } from '../offline';
import { RuntimeRealtimeRegistry } from '../registry';
import {
  RuntimeRecoveryRealtime,
  RuntimeProtectionTempeteRealtime,
  RuntimeResilienceRealtime,
} from '../resilience';
import { RuntimeAbonnementsRealtime, RuntimeProjectionAbonnementsRealtime } from '../subscriptions';

export class FabriqueRuntimeRealtime {
  public creer() {
    const facade = new FacadeInfrastructureRealtime();
    const registry = new RuntimeRealtimeRegistry({
      nom: 'realtime-runtime',
      offlineFirst: true,
    });

    const auth = new RealtimeAuthIntegrationOrchestrator();
    const security = new RealtimeSecurityIntegrationOrchestrator();
    const configuration = new RealtimeConfigurationIntegrationOrchestrator();
    const monitoring = new RealtimeMonitoringIntegrationOrchestrator();
    const synchronisation = new RealtimeSynchronisationIntegrationOrchestrator();

    const coordinator = new RuntimeRealtimeCoordinator(registry);
    const workers = new RuntimeWorkersRealtimeCoordinator(registry);
    const integrations = new RuntimeIntegrationRealtimeCoordinator(
      auth,
      security,
      configuration,
      monitoring,
      synchronisation,
    );

    const runtime = {
      facade,
      registry,
      coordinator,
      workers,
      integrations,
      connections: {
        service: new RuntimeConnexionsRealtime(facade),
        registry: new RuntimeRegistryConnexionsRealtime(registry),
        heartbeat: new RuntimeHeartbeatConnexionsRealtime(),
      },
      subscriptions: {
        service: new RuntimeAbonnementsRealtime(facade),
        projection: new RuntimeProjectionAbonnementsRealtime(registry),
      },
      broadcast: {
        diffusion: new RuntimeDiffusionRealtime(facade),
        canaux: new RuntimeCanauxRealtime(),
        dispatch: new RuntimeDispatchRealtime(facade),
      },
      offline: {
        service: new RuntimeOfflineRealtime(),
        reconnexion: new RuntimeReconnexionRealtime(),
        replay: new RuntimeReplayLegerRealtime(),
      },
      resilience: {
        service: new RuntimeResilienceRealtime(),
        recovery: new RuntimeRecoveryRealtime(),
        protection: new RuntimeProtectionTempeteRealtime(),
      },
      observability: {
        service: new RuntimeObservabiliteRealtime(facade),
        metriques: new RuntimeMetriquesRealtime(facade),
        diagnostics: new RuntimeDiagnosticsRealtime(facade),
      },
      health: {
        runtime: new RuntimeHealthRealtime(registry),
        etat: new RuntimeEtatRealtime(registry),
      },
    };

    registry.enregistrerComposant('realtime-facade', facade);
    registry.enregistrerComposant('realtime-integrations', integrations);
    return runtime;
  }
}
