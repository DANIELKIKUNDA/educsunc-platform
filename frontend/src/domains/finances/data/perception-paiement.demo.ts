export interface FinancialObligation {
  id: string;
  typeFrais: string;
  libelle: string;
  montantExigible: number;
  delegationAutorisee: boolean;
  minervalNaturelOnly?: boolean;
}

export interface StudentPaymentContext {
  id: string;
  matricule: string;
  fullName: string;
  section: string;
  classe: string;
  redevabilite: string[];
  obligations: FinancialObligation[];
}

export const studentPaymentContexts: StudentPaymentContext[] = [
  {
    id: 'eleve-1',
    matricule: 'ELV-000381',
    fullName: 'Mukuta Musenge Josias',
    section: 'Secondaire',
    classe: '4e H - ELEC',
    redevabilite: ['AG', 'FN'],
    obligations: [
      {
        id: 'obl-1',
        typeFrais: 'FRAIS_ETAT_TRANCHE_1',
        libelle: 'Frais Etat - Tranche 1',
        montantExigible: 50000,
        delegationAutorisee: true,
      },
      {
        id: 'obl-2',
        typeFrais: 'FRAIS_BULLETIN',
        libelle: 'Frais bulletin',
        montantExigible: 20000,
        delegationAutorisee: true,
      },
      {
        id: 'obl-3',
        typeFrais: 'FRAIS_MINERVAL',
        libelle: 'Minerval - Juin',
        montantExigible: 45000,
        delegationAutorisee: false,
        minervalNaturelOnly: true,
      },
    ],
  },
  {
    id: 'eleve-2',
    matricule: 'ELV-000921',
    fullName: 'Kabongo Sarah Grace',
    section: 'Primaire',
    classe: '6e Primaire',
    redevabilite: ['EX'],
    obligations: [],
  },
];

export const paymentModes = [
  'Especes',
  'Mobile Money',
  'Virement',
] as const;
