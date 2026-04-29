import { Exoneration } from '../aggregates/Exoneration';
import { ObligationFinanciereEleve } from '../aggregates/ObligationFinanciereEleve';

export class MoteurExoneration {
  public appliquer(exoneration: Exoneration, obligation: ObligationFinanciereEleve): void {
    obligation.appliquerExoneration(exoneration.obtenirMontantExonere());
  }
}
