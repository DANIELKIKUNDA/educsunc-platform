export type PaymentHistoryActorCode =
  | 'CAISSIER'
  | 'ADMINISTRATEUR_ECOLE'
  | 'GESTIONNAIRE_ORGANISATION'
  | 'PROMOTEUR_ORGANISATION'
  | 'TITULAIRE'
  | 'PARENT'
  | 'PREFET_ETUDES'
  | 'DIRECTEUR_ETUDES'
  | 'DIRECTEUR_PRIMAIRE'
  | 'DIRECTEUR_MATERNELLE';

export interface StudentPaymentHistoryEntry {
  id: string;
  date: string;
  heure: string;
  numeroRecu: string;
  typeFrais: string;
  libelle: string;
  modePaiement: string;
  montant: number;
  percepteur: string;
  statut: 'VALIDE' | 'ANNULE';
}

export interface StudentPaymentHistoryProfile {
  id: string;
  matricule: string;
  fullName: string;
  sexe: string;
  classe: string;
  section: string;
  anneeScolaire: string;
  responsable: string;
  totalPaye: number;
  nombrePaiements: number;
  dernierPaiementLabel: string;
  entries: StudentPaymentHistoryEntry[];
}

export const authorizedPaymentHistoryActors: PaymentHistoryActorCode[] = [
  'CAISSIER',
  'ADMINISTRATEUR_ECOLE',
  'GESTIONNAIRE_ORGANISATION',
  'PROMOTEUR_ORGANISATION',
  'TITULAIRE',
  'PARENT',
  'PREFET_ETUDES',
  'DIRECTEUR_ETUDES',
  'DIRECTEUR_PRIMAIRE',
  'DIRECTEUR_MATERNELLE',
];

export const studentPaymentHistoryProfile: StudentPaymentHistoryProfile = {
  id: 'eleve-1',
  matricule: 'ELV-000381',
  fullName: 'Mukuta Musenge Josias',
  sexe: 'M',
  classe: '4e H - ELEC',
  section: 'Secondaire',
  anneeScolaire: '2025 - 2026',
  responsable: 'Mukuta Daniel',
  totalPaye: 345000,
  nombrePaiements: 5,
  dernierPaiementLabel: '25 juin 2026 a 11:02',
  entries: [
    {
      id: 'pay-001',
      date: '08 sept. 2025',
      heure: '07:22',
      numeroRecu: 'RC-080925-001',
      typeFrais: 'Frais inscription',
      libelle: 'Inscription annuelle',
      modePaiement: 'Especes',
      montant: 80000,
      percepteur: 'Daniel Kikunda',
      statut: 'VALIDE',
    },
    {
      id: 'pay-002',
      date: '02 oct. 2025',
      heure: '10:14',
      numeroRecu: 'RC-021025-017',
      typeFrais: 'Minerval',
      libelle: 'Minerval - Octobre',
      modePaiement: 'Mobile Money',
      montant: 65000,
      percepteur: 'Daniel Kikunda',
      statut: 'VALIDE',
    },
    {
      id: 'pay-003',
      date: '05 janv. 2026',
      heure: '09:18',
      numeroRecu: 'RC-050126-011',
      typeFrais: 'Frais Etat',
      libelle: 'Tranche 1',
      modePaiement: 'Especes',
      montant: 50000,
      percepteur: 'Aline Mbuyi',
      statut: 'VALIDE',
    },
    {
      id: 'pay-004',
      date: '12 mars 2026',
      heure: '08:46',
      numeroRecu: 'RC-120326-008',
      typeFrais: 'Frais bulletin',
      libelle: 'Bulletin 2e periode',
      modePaiement: 'Virement',
      montant: 20000,
      percepteur: 'Daniel Kikunda',
      statut: 'VALIDE',
    },
    {
      id: 'pay-005',
      date: '25 juin 2026',
      heure: '11:02',
      numeroRecu: 'RC-250625-006',
      typeFrais: 'Minerval',
      libelle: 'Minerval - Juin',
      modePaiement: 'Especes',
      montant: 130000,
      percepteur: 'Aline Mbuyi',
      statut: 'VALIDE',
    },
  ],
};
