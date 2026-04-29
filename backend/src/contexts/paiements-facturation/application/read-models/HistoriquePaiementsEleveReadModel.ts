import { Money } from '../../domain/value-objects/Money';
import { ModePaiement } from '../../domain/value-objects/ModePaiement';
import { StatutPaiement } from '../../domain/value-objects/StatutPaiement';
import { TypeFrais } from '../../domain/value-objects/TypeFrais';

export interface PaiementHistoriqueItem {
  idPaiement: string;
  creeLe: Date;
  montantTotal: Money;
  modePaiement: ModePaiement;
  typeFraisDeclare: TypeFrais;
  statutPaiement: StatutPaiement;
}

export interface HistoriquePaiementsEleveReadModel {
  idEleve: string;
  paiements: PaiementHistoriqueItem[];
}
