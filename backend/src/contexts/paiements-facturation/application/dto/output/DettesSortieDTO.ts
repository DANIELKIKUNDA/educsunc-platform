import { Money } from 'contexts/paiements-facturation/domain/value-objects/Money';
import { TypeFrais } from 'contexts/paiements-facturation/domain/value-objects/TypeFrais';

export interface LigneDetteOutput {
  idObligation: string;
  typeFrais: TypeFrais;
  referenceFrais: string;
  libelle: string;
  montantDuHistorique: Money;
  montantPaye: Money;
  montantExonere: Money;
  solde: Money;
  statut: string;
}

export interface DetteAnnuelleOutput {
  idAnneeScolaire: string;
  statutAnnee: 'ACTIVE' | 'CLOTUREE';
  lignes: LigneDetteOutput[];
  totalDu: Money;
  totalPaye: Money;
  totalExonere: Money;
  soldeRestant: Money;
}

export interface DetteEleveOutput {
  idEleve: string;
  totalArrieres: Money;
  totalAnneeActive: Money;
  totalGlobal: Money;
  dettesParAnnee: DetteAnnuelleOutput[];
}

export interface FraisDisponibleOutput {
  typeFrais: TypeFrais;
  libelle: string;
  montantAttendu: Money;
  paiementPartielAutorise: boolean;
  resteAPayer: Money;
}

export interface FraisExigiblesEleveOutput {
  idEleve: string;
  fraisDisponibles: FraisDisponibleOutput[];
}
