import type { DetailResponse, MoneyHttp } from './payment-history.model';

export interface PaymentReceiptApiData {
  idRecu: string;
  numeroRecu: string;
  idPaiement: string;
  dateEmission: string;
  heureEmission: string;
  statutRecu: string;
  modePaiement: string;
  totalPaye: MoneyHttp;
  montantEnLettres: string;
  ecole: {
    idEcole: string;
    nom: string;
    sigle?: string;
    adresse?: string;
    telephone?: string;
    email?: string;
    logoUrl?: string;
    cachetUrl?: string;
  };
  contexteScolaire: {
    anneeScolaire?: string;
    classe?: string;
  };
  eleve: {
    idEleve: string;
    code: string;
    nom: string;
    postnom: string;
    prenom?: string;
    sexe: string;
  };
  caissier: {
    idUtilisateur: string;
    nomComplet: string;
    signatureUrl?: string;
  };
  lignes: Array<{
    numeroLigne: number;
    typeFrais: string;
    libelle: string;
    montant: MoneyHttp;
  }>;
}

export interface PaymentReceiptLineViewModel {
  id: string;
  numero: number;
  typeFrais: string;
  libelle: string;
  montant: number;
  devise: string;
}

export interface PaymentReceiptViewModel {
  id: string;
  numeroRecu: string;
  dateLabel: string;
  heureLabel: string;
  modePaiement: string;
  montantTotal: number;
  devise: string;
  montantEnLettres: string;
  caissierNom: string;
  signatureDisponible: boolean;
  signatureUrl?: string;
  cachetDisponible: boolean;
  messageFinal: string;
  school: {
    sigle: string;
    nom: string;
    adresse: string;
    telephone: string;
    email: string;
    logoUrl?: string;
    cachetUrl?: string;
  };
  student: {
    matricule: string;
    nom: string;
    postnom: string;
    prenom: string;
    sexe: string;
    classe: string;
    anneeScolaire: string;
  };
  lines: PaymentReceiptLineViewModel[];
}

export type PaymentReceiptResponse = DetailResponse<PaymentReceiptApiData>;
