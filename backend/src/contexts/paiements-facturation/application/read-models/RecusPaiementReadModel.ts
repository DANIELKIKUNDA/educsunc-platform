import type { Money } from '../../domain/value-objects/Money';

export interface RecuPaiementResumeReadModel {
  idRecu: string;
  numeroRecu: string;
  idPaiement: string;
  idEleve: string;
  idCaissier: string;
  dateEmission: Date;
  modePaiement: string;
  totalPaye: Money;
  statutRecu: string;
}

export interface RecusPaiementReadModel {
  idEcole: string;
  filtres: {
    idEleve?: string;
    numeroRecu?: string;
    dateDebut?: string;
    dateFin?: string;
  };
  recus: ReadonlyArray<RecuPaiementResumeReadModel>;
}
