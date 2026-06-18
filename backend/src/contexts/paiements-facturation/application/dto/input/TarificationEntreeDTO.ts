import { CategorieFraisEtat } from 'contexts/paiements-facturation/domain/value-objects/CategorieFraisEtat';
import { CategorieTechnique } from 'contexts/paiements-facturation/domain/value-objects/CategorieTechnique';
import { Money } from 'contexts/paiements-facturation/domain/value-objects/Money';
import { MoisScolaire } from 'contexts/paiements-facturation/domain/value-objects/MoisScolaire';
import { TrancheFraisEtat } from 'contexts/paiements-facturation/domain/value-objects/TrancheFraisEtat';
import { TypeFrais } from 'contexts/paiements-facturation/domain/value-objects/TypeFrais';

export interface CreerGrilleTarificationInput {
  idOrganisation: string;
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
  obligatoire: boolean;
  dateDebutValidite?: string;
  dateFinValidite?: string;
  roleActif?: string;
  creePar: string;
}

export interface ModifierGrilleTarificationInput {
  idOrganisation: string;
  idEcole: string;
  idGrilleTarification: string;
  idAnneeScolaire: string;
  libelle?: string;
  montant?: Money;
  section?: string;
  categorieFraisEtat?: CategorieFraisEtat;
  categorieTechnique?: CategorieTechnique;
  estClasseTENASOSP?: boolean;
  estClasseEXETAT?: boolean;
  estClasseFinaliste?: boolean;
  moisScolaire?: MoisScolaire;
  trancheFraisEtat?: TrancheFraisEtat;
  obligatoire?: boolean;
  actif?: boolean;
  dateDebutValidite?: string;
  dateFinValidite?: string;
  roleActif?: string;
  modifiePar: string;
}

export interface DesactiverGrilleTarificationInput {
  idOrganisation: string;
  idEcole: string;
  idGrilleTarification: string;
  idAnneeScolaire: string;
  roleActif?: string;
  modifiePar: string;
}

export interface ListerGrillesTarificationInput {
  idOrganisation: string;
  idEcole: string;
  idAnneeScolaire: string;
  typeFrais?: TypeFrais;
  actif?: boolean;
  roleActif?: string;
  idUtilisateur: string;
}
