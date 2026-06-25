export type AnticipatedFundsActorCode =
  | 'CAISSIER'
  | 'ADMINISTRATEUR_ECOLE'
  | 'GESTIONNAIRE_ORGANISATION'
  | 'PROMOTEUR_ORGANISATION'
  | 'TITULAIRE'
  | 'PREFET_ETUDES'
  | 'DIRECTEUR_ETUDES'
  | 'DIRECTEUR_PRIMAIRE'
  | 'DIRECTEUR_MATERNELLE';

export interface AnticipatedFundsRow {
  id: string;
  eleve: string;
  matricule: string;
  classe: string;
  section: string;
  fondsDisponible: number;
  sourceDominante: 'ANTICIPE' | 'LISSAGE';
}

export interface AnticipatedFundsViewModel {
  totalDisponible: number;
  totalEleves: number;
  totalLignes: number;
  rows: AnticipatedFundsRow[];
}

export const authorizedAnticipatedFundsActors: AnticipatedFundsActorCode[] = [
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

export const anticipatedFundsViewModel: AnticipatedFundsViewModel = {
  totalDisponible: 785000,
  totalEleves: 7,
  totalLignes: 7,
  rows: [
    {
      id: 'fonds-1',
      eleve: 'Mukuta Musenge Josias',
      matricule: 'ELV-000381',
      classe: '4e H - ELEC',
      section: 'Secondaire',
      fondsDisponible: 150000,
      sourceDominante: 'ANTICIPE',
    },
    {
      id: 'fonds-2',
      eleve: 'Kabongo Sarah Grace',
      matricule: 'ELV-000921',
      classe: '6e Primaire',
      section: 'Primaire',
      fondsDisponible: 90000,
      sourceDominante: 'LISSAGE',
    },
    {
      id: 'fonds-3',
      eleve: 'Kalenga Ruth Esther',
      matricule: 'ELV-000552',
      classe: '2e Humanites - CG',
      section: 'Secondaire',
      fondsDisponible: 120000,
      sourceDominante: 'ANTICIPE',
    },
    {
      id: 'fonds-4',
      eleve: 'Mwamba Bienvenu David',
      matricule: 'ELV-000801',
      classe: '8e EB',
      section: 'Secondaire',
      fondsDisponible: 45000,
      sourceDominante: 'LISSAGE',
    },
    {
      id: 'fonds-5',
      eleve: 'Tshibangu Prisca',
      matricule: 'ELV-000615',
      classe: '3e Humanites - SC',
      section: 'Secondaire',
      fondsDisponible: 180000,
      sourceDominante: 'ANTICIPE',
    },
    {
      id: 'fonds-6',
      eleve: 'Kabuya Jeremy',
      matricule: 'ELV-000744',
      classe: '1re Humanites - LIT',
      section: 'Secondaire',
      fondsDisponible: 100000,
      sourceDominante: 'ANTICIPE',
    },
    {
      id: 'fonds-7',
      eleve: 'Mbuyi Deborah',
      matricule: 'ELV-001012',
      classe: '5e Primaire',
      section: 'Primaire',
      fondsDisponible: 100000,
      sourceDominante: 'LISSAGE',
    },
  ],
};
