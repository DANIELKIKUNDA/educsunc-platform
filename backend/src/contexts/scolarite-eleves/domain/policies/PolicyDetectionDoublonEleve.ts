import { ErreurDoublonEleveDetecte } from '../exceptions/ErreurDoublonEleveDetecte';

// Ce fichier contient la regle de detection des doublons d'eleves.
/**
 * Cette policy bloque les doublons certains et laisse les doublons probables au moteur de decision.
 */
export class PolicyDetectionDoublonEleve {
  /** Refuse l'operation quand un doublon certain est detecte. */
  public verifierAucunDoublonCertain(doublonCertainDetecte: boolean): void {
    if (doublonCertainDetecte) {
      throw new ErreurDoublonEleveDetecte('Un doublon certain d eleve a ete detecte.');
    }
  }
}
