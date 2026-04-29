import { Money } from 'contexts/paiements-facturation/domain/value-objects/Money';
import { TypeExoneration } from 'contexts/paiements-facturation/domain/value-objects/TypeExoneration';

export interface AccorderExonerationInput {
  idEleve: string;
  idObligation: string;
  idEcole: string;
  typeExoneration: TypeExoneration;
  montantExonere?: Money;
  pourcentage?: number;
  raison: string;
  validePar: string;
}

export interface AnnulerExonerationInput {
  idExoneration: string;
}
