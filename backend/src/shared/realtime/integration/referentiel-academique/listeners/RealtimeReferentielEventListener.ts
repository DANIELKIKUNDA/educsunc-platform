import type { RealtimeReferentielEvenement } from '../RealtimeReferentielIntegrationTypes';

export class RealtimeReferentielEventListener {
  public consommer(evenement: RealtimeReferentielEvenement): RealtimeReferentielEvenement {
    return evenement;
  }
}
