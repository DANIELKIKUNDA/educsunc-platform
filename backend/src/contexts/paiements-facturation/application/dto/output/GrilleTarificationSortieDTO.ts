import { GrilleTarification } from 'contexts/paiements-facturation/domain/aggregates/GrilleTarification';
import { CategorieFraisEtat } from 'contexts/paiements-facturation/domain/value-objects/CategorieFraisEtat';
import { CategorieTechnique } from 'contexts/paiements-facturation/domain/value-objects/CategorieTechnique';
import { Money } from 'contexts/paiements-facturation/domain/value-objects/Money';
import { MoisScolaire } from 'contexts/paiements-facturation/domain/value-objects/MoisScolaire';
import { TrancheFraisEtat } from 'contexts/paiements-facturation/domain/value-objects/TrancheFraisEtat';
import { TypeFrais } from 'contexts/paiements-facturation/domain/value-objects/TypeFrais';

export interface GrilleTarificationOutput {
  idGrilleTarification: string;
  idEcole: string;
  idAnneeScolaire: string;
  typeFrais: TypeFrais;
  libelle: string;
  montant: Money;
  section?: string;
  categorieFraisEtat?: CategorieFraisEtat;
  categorieTechnique?: CategorieTechnique;
  estClasseTENASOSP?: boolean;
  estClasseEXETAT?: boolean;
  estClasseFinaliste?: boolean;
  moisScolaire?: MoisScolaire;
  trancheFraisEtat?: TrancheFraisEtat;
  actif: boolean;
  obligatoire: boolean;
  dateDebutValidite?: string;
  dateFinValidite?: string;
}

export const versGrilleTarificationOutput = (grille: GrilleTarification): GrilleTarificationOutput => ({
  idGrilleTarification: grille.obtenirId(),
  idEcole: grille.obtenirIdEcole(),
  idAnneeScolaire: grille.obtenirIdAnneeScolaire(),
  typeFrais: grille.obtenirTypeFrais(),
  libelle: grille.obtenirLibelle(),
  montant: grille.obtenirMontant(),
  section: grille.obtenirSection(),
  categorieFraisEtat: grille.obtenirCategorieFraisEtat(),
  categorieTechnique: grille.obtenirCategorieTechnique(),
  estClasseTENASOSP: grille.obtenirEstClasseTENASOSP(),
  estClasseEXETAT: grille.obtenirEstClasseEXETAT(),
  estClasseFinaliste: grille.obtenirEstClasseFinaliste(),
  moisScolaire: grille.obtenirMoisScolaire(),
  trancheFraisEtat: grille.obtenirTrancheFraisEtat(),
  actif: grille.obtenirActif(),
  obligatoire: grille.obtenirObligatoire(),
  dateDebutValidite: grille.obtenirDateDebutValidite(),
  dateFinValidite: grille.obtenirDateFinValidite(),
});
