import type { RealtimePaiementsEvenement } from '../RealtimePaiementsIntegrationTypes';

export class RealtimePaiementsAntiCorruptionLayer {
  public traduire(source: RealtimePaiementsEvenement): RealtimePaiementsEvenement {
    return source;
  }
}
