import { CategorieFraisEtat } from 'contexts/paiements-facturation/domain/value-objects/CategorieFraisEtat';
import { CategorieTechnique } from 'contexts/paiements-facturation/domain/value-objects/CategorieTechnique';
import { Money } from 'contexts/paiements-facturation/domain/value-objects/Money';
import { TypeFrais } from 'contexts/paiements-facturation/domain/value-objects/TypeFrais';

export interface CreerGrilleTarificationInput {
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
  obligatoire: boolean;
  creePar: string;
}

export interface ModifierGrilleTarificationInput {
  idGrilleTarification: string;
  libelle?: string;
  montant?: Money;
  actif?: boolean;
  modifiePar: string;
}

export interface DesactiverGrilleTarificationInput {
  idGrilleTarification: string;
  modifiePar: string;
}

export interface ListerGrillesTarificationInput {
  idEcole: string;
  idAnneeScolaire?: string;
  typeFrais?: TypeFrais;
  actif?: boolean;
}
