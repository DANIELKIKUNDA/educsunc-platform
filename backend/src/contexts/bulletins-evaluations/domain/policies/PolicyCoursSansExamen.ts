import { ErreurExamenInterditPourCours } from '../exceptions/ErreurExamenInterditPourCours';
import { CodeColonneBulletin, estColonneExamenBulletin } from '../value-objects/CodeColonneBulletin';

// Cette policy bloque les colonnes d'examen sur un cours sans examen.
export class PolicyCoursSansExamen {
  // Cette methode verifie si une colonne d'examen est admissible pour le cours.
  public verifier(codeColonne: CodeColonneBulletin, aExamen: boolean): void {
    if (!aExamen && estColonneExamenBulletin(codeColonne)) {
      throw new ErreurExamenInterditPourCours();
    }
  }
}
