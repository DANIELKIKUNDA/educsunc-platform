import type { RealtimeScolariteEvenement } from '../RealtimeScolariteIntegrationTypes';

export class RealtimeScolariteEventListener {
  public consommer(evenement: RealtimeScolariteEvenement): RealtimeScolariteEvenement {
    return evenement;
  }
}
