import type { ModePaiement } from '../../domain/value-objects/ModePaiement';

export interface LigneRecuPaiementOfficiel {
  idLigne: string;
  numeroLigne: number;
  idRecuLigne: string;
  idObligation: string;
  typeFrais: string;
  referenceFrais: string;
  libelle: string;
  montant: number;
  devise: string;
}

export interface RecuPaiementOfficielPersistable {
  idRecu: string;
  numeroRecu: string;
  idPaiement: string;
  idEcole: string;
  idEleve: string;
  totalPaye: number;
  devise: string;
  montantEnLettres: string;
  modePaiement: ModePaiement;
  idCaissier: string;
  dateEmission: Date;
  statutRecu: string;
  lignes: LigneRecuPaiementOfficiel[];
}

export interface DepotRecuPaiementOfficielPort {
  sauvegarder(recu: RecuPaiementOfficielPersistable): Promise<void>;
  trouverParIdRecu(idRecu: string): Promise<RecuPaiementOfficielPersistable | null>;
  trouverParPaiement(idPaiement: string): Promise<RecuPaiementOfficielPersistable | null>;
}
