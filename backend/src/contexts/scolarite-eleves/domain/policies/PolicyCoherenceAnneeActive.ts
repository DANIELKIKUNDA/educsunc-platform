import { ErreurAucuneAnneeActive } from '../exceptions/ErreurAucuneAnneeActive';

// Ce fichier contient la regle de presence d'une annee scolaire active ou selectionnee.
/**
 * Cette policy protege les operations annuelles contre une annee manquante.
 */
export class PolicyCoherenceAnneeActive {
  /** Refuse l'operation si aucune annee active ou selectionnee n'existe. */
  public verifierAnneeActiveOuSelectionnee(existe: boolean): void {
    if (!existe) {
      throw new ErreurAucuneAnneeActive('Aucune annee scolaire active ou explicitement selectionnee.');
    }
  }
}
