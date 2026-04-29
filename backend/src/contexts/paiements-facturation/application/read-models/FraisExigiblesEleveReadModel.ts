import { Money } from '../../domain/value-objects/Money';
import { TypeFrais } from '../../domain/value-objects/TypeFrais';

export interface FraisDisponibleReadModel {
  typeFrais: TypeFrais;
  libelle: string;
  montantAttendu: Money;
  resteAPayer: Money;
  paiementPartielAutorise: boolean;
}

export interface FraisExigiblesEleveReadModel {
  idEleve: string;
  frais: FraisDisponibleReadModel[];
}
