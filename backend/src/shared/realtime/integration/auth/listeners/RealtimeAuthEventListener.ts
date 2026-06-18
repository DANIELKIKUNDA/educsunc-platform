import type { RealtimeAuthEvenement } from '../RealtimeAuthIntegrationTypes';

export class RealtimeAuthEventListener {
  public consommer(evenement: RealtimeAuthEvenement): RealtimeAuthEvenement {
    return evenement;
  }
}
