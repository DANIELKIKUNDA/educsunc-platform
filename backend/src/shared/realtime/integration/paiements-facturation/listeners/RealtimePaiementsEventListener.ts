import type { RealtimePaiementsEvenement } from '../RealtimePaiementsIntegrationTypes';

export class RealtimePaiementsEventListener {
  public consommer(evenement: RealtimePaiementsEvenement): RealtimePaiementsEvenement {
    return evenement;
  }
}
