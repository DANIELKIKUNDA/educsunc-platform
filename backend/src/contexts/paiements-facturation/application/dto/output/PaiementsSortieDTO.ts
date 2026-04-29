import { Money } from 'contexts/paiements-facturation/domain/value-objects/Money';
import { ModePaiement } from 'contexts/paiements-facturation/domain/value-objects/ModePaiement';
import { StatutPaiement } from 'contexts/paiements-facturation/domain/value-objects/StatutPaiement';
import { TypeFrais } from 'contexts/paiements-facturation/domain/value-objects/TypeFrais';

export interface RepartitionPaiementOutput {
  idRepartition: string;
  idObligation: string;
  montantAffecte: Money;
  ordreAffectation: number;
  origineAffectation: string;
}

export interface RestitutionOutput {
  idRestitution: string;
  montant: Money;
  raison: string;
}

export interface PaiementEnregistreOutput {
  idPaiement: string;
  montantTotal: Money;
  modePaiement: ModePaiement;
  typeFraisDeclare: TypeFrais;
  statutPaiement: StatutPaiement;
  repartitions: RepartitionPaiementOutput[];
  recus: RecuPaiementOutput[];
  restitution?: RestitutionOutput;
}

export interface PaiementHistoriqueOutput {
  idPaiement: string;
  montantTotal: Money;
  modePaiement: ModePaiement;
  typeFraisDeclare: TypeFrais;
  statutPaiement: StatutPaiement;
  creeLe: Date;
}

export interface RecuPaiementOutput {
  idRecu: string;
  numeroRecu: string;
  idPaiement: string;
  idObligation: string;
  libelle: string;
  montant: Money;
  montantEnLettres: string;
  dateEmission: Date;
  statutRecu: string;
}
