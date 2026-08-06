export type PaymentHistoryActorCode =
  | 'CAISSIER'
  | 'ADMINISTRATEUR_ECOLE'
  | 'GESTIONNAIRE_ORGANISATION'
  | 'PROMOTEUR_ORGANISATION'
  | 'ENSEIGNANT'
  | 'PARENT'
  | 'PREFET_ETUDES'
  | 'DIRECTEUR_ETUDES'
  | 'DIRECTEUR_PRIMAIRE'
  | 'DIRECTEUR_MATERNELLE';

export interface FinanceApiContext {
  organisationId: string | null;
  ecoleId: string | null;
  utilisateurId: string | null;
}

export interface MoneyHttp {
  montant: number;
  devise: string;
}

export interface PaymentHistoryApiItem {
  idPaiement: string;
  creeLe: string;
  montantTotal: MoneyHttp;
  modePaiement: string;
  typeFraisDeclare: string;
  statutPaiement: string;
}

export interface PaymentHistoryApiData {
  idEleve: string;
  paiements: PaymentHistoryApiItem[];
}

export interface StudentDetailApiData {
  idEleve: string;
  idOrganisation: string;
  idEcole: string;
  matricule: string;
  nom: string;
  postNom: string;
  prenom?: string;
  sexe: string;
}

export interface DetailResponse<TData> {
  donnee: TData;
}

export interface PaymentHistoryEntry {
  id: string;
  date: string;
  heure: string;
  typeFrais: string;
  modePaiement: string;
  montant: number;
  devise: string;
  statut: string;
}

export interface StudentPaymentHistoryProfile {
  id: string;
  matricule: string;
  fullName: string;
  sexe: string;
  classe: string;
  section: string;
  anneeScolaire: string;
}

export interface PaymentHistoryViewModel {
  profile: StudentPaymentHistoryProfile;
  entries: PaymentHistoryEntry[];
}

export const authorizedPaymentHistoryActors: PaymentHistoryActorCode[] = [
  'CAISSIER',
  'ADMINISTRATEUR_ECOLE',
  'GESTIONNAIRE_ORGANISATION',
  'PROMOTEUR_ORGANISATION',
  'ENSEIGNANT',
  'PARENT',
  'PREFET_ETUDES',
  'DIRECTEUR_ETUDES',
  'DIRECTEUR_PRIMAIRE',
  'DIRECTEUR_MATERNELLE',
];
