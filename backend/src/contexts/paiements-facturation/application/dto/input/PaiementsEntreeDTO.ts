import { Money } from 'contexts/paiements-facturation/domain/value-objects/Money';
import { CiblePaiement } from 'contexts/paiements-facturation/domain/value-objects/CiblePaiement';
import { ModePaiement } from 'contexts/paiements-facturation/domain/value-objects/ModePaiement';
import { TypeFrais } from 'contexts/paiements-facturation/domain/value-objects/TypeFrais';

export interface EnregistrerPaiementInput {
  idEleve: string;
  idEcole: string;
  typeFraisDeclare: TypeFrais;
  montant: Money;
  modePaiement: ModePaiement;
  ciblePaiement?: CiblePaiement;
  idempotencyKey: string;
  idCaissier: string;
}

export interface EnregistrerPaiementArriereInput {
  idEleve: string;
  idEcole: string;
  montant: Money;
  typeFraisDeclare?: TypeFrais;
  modePaiement: ModePaiement;
  idCaissier: string;
  idempotencyKey: string;
}

export interface EnregistrerPaiementAnticipeInput {
  idEleve: string;
  idEcole: string;
  montant: Money;
  typeFraisDeclare: TypeFrais;
  modePaiement: ModePaiement;
  idCaissier: string;
  idempotencyKey: string;
}

export interface AppliquerLissageFraisInput {
  idEleve: string;
  idEcole: string;
  montant: Money;
  typeFraisDeclare: TypeFrais;
}
