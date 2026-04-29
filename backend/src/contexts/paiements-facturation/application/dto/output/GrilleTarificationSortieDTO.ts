import { GrilleTarification } from 'contexts/paiements-facturation/domain/aggregates/GrilleTarification';
import { Money } from 'contexts/paiements-facturation/domain/value-objects/Money';
import { TypeFrais } from 'contexts/paiements-facturation/domain/value-objects/TypeFrais';

export interface GrilleTarificationOutput {
  idGrilleTarification: string;
  idEcole: string;
  idAnneeScolaire: string;
  typeFrais: TypeFrais;
  libelle: string;
  montant: Money;
  actif: boolean;
  obligatoire: boolean;
}

export const versGrilleTarificationOutput = (grille: GrilleTarification): GrilleTarificationOutput => ({
  idGrilleTarification: grille.obtenirId(),
  idEcole: grille.obtenirIdEcole(),
  idAnneeScolaire: grille.obtenirIdAnneeScolaire(),
  typeFrais: grille.obtenirTypeFrais(),
  libelle: grille.obtenirLibelle(),
  montant: grille.obtenirMontant(),
  actif: grille.obtenirActif(),
  obligatoire: grille.obtenirObligatoire(),
});
