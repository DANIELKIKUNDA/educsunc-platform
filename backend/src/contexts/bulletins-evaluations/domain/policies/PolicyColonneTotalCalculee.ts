import { ErreurEncodageTotalInterdit } from '../exceptions/ErreurEncodageTotalInterdit';
import { CodeColonneBulletin, estColonneTotalBulletin } from '../value-objects/CodeColonneBulletin';

// Cette policy interdit l'encodage manuel des colonnes de total.
export class PolicyColonneTotalCalculee {
  // Cette methode verifie qu'aucune saisie manuelle ne vise une colonne total.
  public verifier(codeColonne: CodeColonneBulletin): void {
    if (estColonneTotalBulletin(codeColonne)) {
      throw new ErreurEncodageTotalInterdit();
    }
  }
}
