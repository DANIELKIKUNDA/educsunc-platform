import { FicheCotationEleveCours } from '../aggregates/FicheCotationEleveCours';
import { CodeColonneBulletin } from '../value-objects/CodeColonneBulletin';

// Ce moteur determine si un eleve doit etre considere non classe sur une colonne.
export class MoteurNonClasse {
  // Cette methode retourne vrai des qu'une fiche calculable n'a pas la cote obligatoire.
  public determiner(fiches: FicheCotationEleveCours[], codeColonne: CodeColonneBulletin): boolean {
    return fiches
      .filter((fiche) => fiche.obtenirEstCalculable())
      .some((fiche) => fiche.obtenirCoteParColonne(codeColonne)?.obtenirCoteObtenue() === null);
  }
}
