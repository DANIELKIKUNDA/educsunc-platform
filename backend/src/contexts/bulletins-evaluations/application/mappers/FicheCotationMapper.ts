import type { FicheCotationEleveCours } from '../../domain/aggregates/FicheCotationEleveCours';
import type { FicheCotationOutput } from '../dto/output/FicheCotationOutput';

// Ce mapper convertit une fiche de cotation de domaine en DTO de sortie.
export class FicheCotationMapper {
  // Cette methode produit une fiche de cotation exploitable par l'application.
  public versSortie(fiche: FicheCotationEleveCours): FicheCotationOutput {
    return {
      idFicheCotationEleveCours: fiche.obtenirId(),
      idEleve: fiche.obtenirIdEleve(),
      idReferentielCours: fiche.obtenirIdReferentielCours(),
      idAnneeScolaire: fiche.obtenirIdAnneeScolaire(),
      typeStructureEvaluation: fiche.obtenirTypeStructureEvaluation(),
      estCalculable: fiche.obtenirEstCalculable(),
      aExamen: fiche.obtenirAExamen(),
      colonnes: fiche.obtenirCotesColonnes().map((colonne) => ({
        codeColonne: colonne.obtenirCodeColonne(),
        coteObtenue: colonne.obtenirCoteObtenue(),
        maximumColonne: colonne.obtenirMaximumColonne(),
        estEchec: colonne.obtenirEstEchec(),
        styleAffichage: colonne.obtenirStyleAffichage(),
      })),
      version: fiche.obtenirVersion(),
    };
  }
}
