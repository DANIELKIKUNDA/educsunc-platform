import { Money } from 'contexts/paiements-facturation/domain/value-objects/Money';

export interface CaissierTotalOutput {
  idCaissier: string;
  total: Money;
}

export interface TypeFraisTotalOutput {
  typeFrais: string;
  total: Money;
}

export interface CaisseJourOutput {
  idCaisseJour: string;
  idEcole: string;
  date: string;
  totalEncaisse: Money;
  totalCash: Money;
  totalMobileMoney: Money;
  totalParCaissier: CaissierTotalOutput[];
  totalParTypeFrais: TypeFraisTotalOutput[];
  totalFondsAnticipes: Money;
  totalFondsConsommes: Money;
  disponibleReel: Money;
  statut: string;
}
