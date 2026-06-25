export type StudentArrearsActorCode =
  | 'CAISSIER'
  | 'ADMINISTRATEUR_ECOLE'
  | 'GESTIONNAIRE_ORGANISATION'
  | 'PROMOTEUR_ORGANISATION'
  | 'TITULAIRE'
  | 'PREFET_ETUDES'
  | 'DIRECTEUR_ETUDES'
  | 'DIRECTEUR_PRIMAIRE'
  | 'DIRECTEUR_MATERNELLE';

export interface StudentArrearItem {
  id: string;
  typeFrais: string;
  libelle: string;
  periode: string;
  montantInitial: number;
  montantPaye: number;
  montantRestant: number;
}

export interface StudentArrearsViewModel {
  eleve: string;
  matricule: string;
  classe: string;
  section: string;
  totalArrieres: number;
  nombreLignes: number;
  rows: StudentArrearItem[];
}

export const authorizedStudentArrearsActors: StudentArrearsActorCode[] = [
  'CAISSIER',
  'ADMINISTRATEUR_ECOLE',
  'GESTIONNAIRE_ORGANISATION',
  'PROMOTEUR_ORGANISATION',
  'TITULAIRE',
  'PREFET_ETUDES',
  'DIRECTEUR_ETUDES',
  'DIRECTEUR_PRIMAIRE',
  'DIRECTEUR_MATERNELLE',
];

export const studentArrearsViewModel: StudentArrearsViewModel = {
  eleve: 'Mukuta Musenge Josias',
  matricule: 'ELV-000381',
  classe: '4e H - ELEC',
  section: 'Secondaire',
  totalArrieres: 80000,
  nombreLignes: 2,
  rows: [
    {
      id: 'arr-1',
      typeFrais: 'Frais Etat',
      libelle: 'Tranche 2',
      periode: 'Mars 2026',
      montantInitial: 50000,
      montantPaye: 25000,
      montantRestant: 25000,
    },
    {
      id: 'arr-2',
      typeFrais: 'Frais techniques',
      libelle: 'Atelier technique',
      periode: 'Mai 2026',
      montantInitial: 55000,
      montantPaye: 0,
      montantRestant: 55000,
    },
  ],
};
