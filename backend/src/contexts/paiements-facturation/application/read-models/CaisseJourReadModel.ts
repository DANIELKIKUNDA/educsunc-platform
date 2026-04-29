import { Money } from '../../domain/value-objects/Money';
import { TypeFrais } from '../../domain/value-objects/TypeFrais';

export interface CaissierTotalReadModel {
  idCaissier: string;
  total: Money;
}

export interface TypeFraisTotalReadModel {
  typeFrais: TypeFrais;
  total: Money;
}

export interface CaisseJourReadModel {
  idEcole: string;
  date: string;
  totalEncaisse: Money;
  totalCash: Money;
  totalMobileMoney: Money;
  totalParCaissier: CaissierTotalReadModel[];
  totalParTypeFrais: TypeFraisTotalReadModel[];
  totalFondsAnticipes: Money;
  totalFondsConsommes: Money;
  disponibleReel: Money;
}
