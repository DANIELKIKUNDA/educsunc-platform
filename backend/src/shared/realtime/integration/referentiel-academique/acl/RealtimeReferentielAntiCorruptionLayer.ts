import type { RealtimeReferentielEvenement } from '../RealtimeReferentielIntegrationTypes';

export class RealtimeReferentielAntiCorruptionLayer {
  public traduire(source: RealtimeReferentielEvenement): RealtimeReferentielEvenement {
    return source;
  }
}
