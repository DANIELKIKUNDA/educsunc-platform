import { Money } from 'contexts/paiements-facturation/domain/value-objects/Money';

export interface ExonerationOutput {
  idExoneration: string;
  idObligation: string;
  montantExonere: Money;
  raison: string;
  statut: string;
}
