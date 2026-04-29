import { Money } from 'contexts/paiements-facturation/domain/value-objects/Money';

export interface OuvrirCaisseJourInput {
  idEcole: string;
  date: string;
  idUtilisateur: string;
}

export interface ConsulterCaisseJourInput {
  idEcole: string;
  date: string;
}

export interface CloturerCaisseJourInput {
  idCaisseJour: string;
  montantPhysiqueDeclare?: Money;
  observation?: string;
  clotureePar: string;
}
