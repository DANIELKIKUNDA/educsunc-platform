import { Money } from 'contexts/paiements-facturation/domain/value-objects/Money';
import { TypeFrais } from 'contexts/paiements-facturation/domain/value-objects/TypeFrais';

export interface ObligationFinanciereOutput {
  idObligation: string;
  idEcole: string;
  idEleve: string;
  idAnneeScolaire: string;
  typeFrais: TypeFrais;
  referenceFrais: string;
  libelle: string;
  montantDuHistorique: Money;
  montantPaye: Money;
  montantExonere: Money;
  solde: Money;
  statut: string;
}
