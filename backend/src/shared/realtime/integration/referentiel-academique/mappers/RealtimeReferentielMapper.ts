import type { RealtimeReferentielEvenement } from '../RealtimeReferentielIntegrationTypes';

export class RealtimeReferentielMapper {
  public static mapper(evenement: RealtimeReferentielEvenement): RealtimeReferentielEvenement {
    return evenement;
  }
}
