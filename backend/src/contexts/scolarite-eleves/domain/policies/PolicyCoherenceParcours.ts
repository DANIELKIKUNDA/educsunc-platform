import { ErreurParcoursIncoherent } from '../exceptions/ErreurParcoursIncoherent';

// Ce fichier contient la regle generale de coherence du parcours scolaire.
/**
 * Cette policy protege le parcours contre la perte ou le desordre des evenements.
 */
export class PolicyCoherenceParcours {
  /** Refuse un parcours dont le nombre d'evenements diminue apres reconstruction. */
  public verifierAucunePerteHistorique(nombreAvant: number, nombreApres: number): void {
    if (nombreApres < nombreAvant) {
      throw new ErreurParcoursIncoherent('Le parcours reconstruit ne peut pas perdre des evenements.');
    }
  }
}
