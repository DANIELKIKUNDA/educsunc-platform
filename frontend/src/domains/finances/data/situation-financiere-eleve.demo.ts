export type StudentFinancialSituationActorCode =
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

export interface StudentDebtObligation {
  id: string;
  typeFrais: string;
  libelle: string;
  periode: string;
  montantAttendu: number;
  montantPaye: number;
  reste: number;
  statut: 'EN_ORDRE' | 'PARTIEL' | 'IMPAYE';
}

export interface StudentFinancialSituationProfile {
  id: string;
  matricule: string;
  fullName: string;
  classe: string;
  section: string;
  anneeScolaire: string;
  totalDette: number;
  totalExigible: number;
  totalArrieres: number;
  obligations: StudentDebtObligation[];
}

export const authorizedStudentFinancialSituationActors: StudentFinancialSituationActorCode[] = [
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

export const studentFinancialSituationProfile: StudentFinancialSituationProfile = {
  id: 'eleve-1',
  matricule: 'ELV-000381',
  fullName: 'Mukuta Musenge Josias',
  classe: '4e H - ELEC',
  section: 'Secondaire',
  anneeScolaire: '2025 - 2026',
  totalDette: 255000,
  totalExigible: 175000,
  totalArrieres: 80000,
  obligations: [
    {
      id: 'obl-001',
      typeFrais: 'Minerval',
      libelle: 'Minerval - Juin',
      periode: 'Juin 2026',
      montantAttendu: 130000,
      montantPaye: 0,
      reste: 130000,
      statut: 'IMPAYE',
    },
    {
      id: 'obl-002',
      typeFrais: 'Frais Etat',
      libelle: 'Tranche 2',
      periode: 'Mars 2026',
      montantAttendu: 50000,
      montantPaye: 25000,
      reste: 25000,
      statut: 'PARTIEL',
    },
    {
      id: 'obl-003',
      typeFrais: 'Frais techniques',
      libelle: 'Atelier technique',
      periode: 'Mai 2026',
      montantAttendu: 45000,
      montantPaye: 0,
      reste: 45000,
      statut: 'IMPAYE',
    },
    {
      id: 'obl-004',
      typeFrais: 'Frais inscription',
      libelle: 'Inscription annuelle',
      periode: 'Septembre 2025',
      montantAttendu: 80000,
      montantPaye: 80000,
      reste: 0,
      statut: 'EN_ORDRE',
    },
    {
      id: 'obl-005',
      typeFrais: 'Frais bulletin',
      libelle: 'Bulletin 2e periode',
      periode: 'Mars 2026',
      montantAttendu: 20000,
      montantPaye: 20000,
      reste: 0,
      statut: 'EN_ORDRE',
    },
  ],
};
