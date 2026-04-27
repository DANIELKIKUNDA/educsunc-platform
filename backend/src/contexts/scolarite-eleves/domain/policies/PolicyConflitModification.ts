import { ErreurConcurrence } from '../exceptions/ErreurConcurrence';

// Ce fichier contient la regle qui transforme un conflit d'ecriture en erreur metier explicite.
/**
 * Cette policy signale un conflit quand une autre modification a gagne la course.
 */
export class PolicyConflitModification {
  /** Refuse l'operation si un conflit est deja detecte par l'infrastructure ou le domaine. */
  public verifierAbsenceConflitModification(conflitDetecte: boolean): void {
    if (conflitDetecte) {
      throw new ErreurConcurrence('Un conflit de modification a ete detecte.');
    }
  }
}
