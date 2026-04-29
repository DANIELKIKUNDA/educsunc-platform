import { GrilleTarification } from '../aggregates/GrilleTarification';
import { ObligationFinanciereEleve } from '../aggregates/ObligationFinanciereEleve';
import { OrigineObligation } from '../value-objects/OrigineObligation';
import { ReferenceFrais } from '../value-objects/ReferenceFrais';

export interface ParametresGenerationObligation {
  idEcole: string;
  idEleve: string;
  idAnneeScolaire: string;
  idInscriptionScolaire?: string;
  creePar?: string;
}

export class MoteurGenerationObligations {
  public genererDepuisGrilles(parametres: ParametresGenerationObligation, grilles: GrilleTarification[]): ObligationFinanciereEleve[] {
    return grilles
      .filter((grille) => grille.obtenirActif())
      .map((grille, index) => ObligationFinanciereEleve.creer({
        idObligation: `${parametres.idEleve}-${parametres.idAnneeScolaire}-${index + 1}-${grille.obtenirTypeFrais()}`,
        idEcole: parametres.idEcole,
        idEleve: parametres.idEleve,
        idAnneeScolaire: parametres.idAnneeScolaire,
        idInscriptionScolaire: parametres.idInscriptionScolaire,
        typeFrais: grille.obtenirTypeFrais(),
        referenceFrais: new ReferenceFrais(grille.obtenirMoisScolaire() ?? grille.obtenirTrancheFraisEtat() ?? grille.obtenirTypeFrais()),
        libelle: grille.obtenirLibelle(),
        montantDuHistorique: grille.obtenirMontant(),
        origineCreation: OrigineObligation.GENERATION_INITIALE,
        idGrilleTarification: grille.obtenirId(),
        creePar: parametres.creePar,
      }));
  }
}
