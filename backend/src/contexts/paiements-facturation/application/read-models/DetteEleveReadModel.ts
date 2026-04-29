import { Money } from '../../domain/value-objects/Money';
import { TypeFrais } from '../../domain/value-objects/TypeFrais';

export interface LigneDetteReadModel {
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

export interface DetteAnnuelleReadModel {
  idAnneeScolaire: string;
  statutAnnee: 'ACTIVE' | 'CLOTUREE';
  lignes: LigneDetteReadModel[];
  totalDu: Money;
  totalPaye: Money;
  totalExonere: Money;
  soldeRestant: Money;
}

export interface DetteEleveReadModel {
  idEleve: string;
  totalArrieres: Money;
  totalAnneeActive: Money;
  totalGlobal: Money;
  annees: DetteAnnuelleReadModel[];
}
