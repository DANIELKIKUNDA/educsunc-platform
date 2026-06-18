import { Money } from 'contexts/paiements-facturation/domain/value-objects/Money';

export interface OuvrirCaisseJourInput {
  idOrganisation: string;
  idEcole: string;
  date: string;
  idUtilisateur: string;
}

export interface ConsulterCaisseJourInput {
  idOrganisation: string;
  idEcole: string;
  date: string;
  idUtilisateur: string;
}

export interface CloturerCaisseJourInput {
  idOrganisation: string;
  idEcole: string;
  idCaisseJour: string;
  montantPhysiqueDeclare?: Money;
  observation?: string;
  clotureePar: string;
}
