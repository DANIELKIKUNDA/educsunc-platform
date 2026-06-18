import type {
  RealtimeAuthIntegrationOrchestrator,
  RealtimeConfigurationIntegrationOrchestrator,
  RealtimeMonitoringIntegrationOrchestrator,
  RealtimeSecurityIntegrationOrchestrator,
  RealtimeSynchronisationIntegrationOrchestrator,
} from '../../integration';

export class RuntimeIntegrationRealtimeCoordinator {
  constructor(
    public readonly auth: RealtimeAuthIntegrationOrchestrator,
    public readonly security: RealtimeSecurityIntegrationOrchestrator,
    public readonly configuration: RealtimeConfigurationIntegrationOrchestrator,
    public readonly monitoring: RealtimeMonitoringIntegrationOrchestrator,
    public readonly synchronisation: RealtimeSynchronisationIntegrationOrchestrator,
  ) {}
}
