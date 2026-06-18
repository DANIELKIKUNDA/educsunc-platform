import { Money } from 'contexts/paiements-facturation/domain/value-objects/Money';
import { TypeExoneration } from 'contexts/paiements-facturation/domain/value-objects/TypeExoneration';

export interface AccorderExonerationInput {
  idOrganisation: string;
  idUtilisateur: string;
  idEleve: string;
  idObligation: string;
  idEcole: string;
  roleActif?: string;
  typeExoneration: TypeExoneration;
  montantExonere?: Money;
  pourcentage?: number;
  raison: string;
  validePar: string;
}

export interface AnnulerExonerationInput {
  idOrganisation: string;
  idUtilisateur: string;
  idEcole: string;
  roleActif?: string;
  idExoneration: string;
}
