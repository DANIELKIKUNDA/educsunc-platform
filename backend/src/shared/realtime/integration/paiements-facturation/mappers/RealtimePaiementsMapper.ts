import type { RealtimePaiementsEvenement } from '../RealtimePaiementsIntegrationTypes';

export class RealtimePaiementsMapper {
  public static mapper(evenement: RealtimePaiementsEvenement): RealtimePaiementsEvenement {
    return evenement;
  }
}
