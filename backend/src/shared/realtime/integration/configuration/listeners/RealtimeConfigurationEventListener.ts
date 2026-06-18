import type { RealtimeConfigurationEvenement } from '../RealtimeConfigurationIntegrationTypes';

export class RealtimeConfigurationEventListener {
  public consommer(evenement: RealtimeConfigurationEvenement): RealtimeConfigurationEvenement {
    return evenement;
  }
}
