import type { RealtimeMonitoringEvenement } from '../RealtimeMonitoringIntegrationTypes';

export class RealtimeMonitoringEventListener {
  public consommer(evenement: RealtimeMonitoringEvenement): RealtimeMonitoringEvenement {
    return evenement;
  }
}
