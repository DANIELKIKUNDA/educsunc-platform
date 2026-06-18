import type { RealtimeSecurityEvenement } from '../RealtimeSecurityIntegrationTypes';

export class RealtimeSecurityEventListener {
  public consommer(evenement: RealtimeSecurityEvenement): RealtimeSecurityEvenement {
    return evenement;
  }
}
