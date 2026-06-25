export type PaymentAnalyticsActorCode =
  | 'CAISSIER'
  | 'ADMINISTRATEUR_ECOLE'
  | 'GESTIONNAIRE_ORGANISATION'
  | 'PROMOTEUR_ORGANISATION'
  | 'TITULAIRE'
  | 'PREFET_ETUDES'
  | 'DIRECTEUR_ETUDES'
  | 'DIRECTEUR_PRIMAIRE'
  | 'DIRECTEUR_MATERNELLE';

export interface PaymentTypeAnalyticsRow {
  id: string;
  typeFrais: string;
  effectif: number;
  operations: number;
  montantTotal: number;
  moyennePaiement: number;
  tauxRecouvrement: number;
  perimetre: string;
}

export interface PaymentTypeAnalyticsViewModel {
  periodeLabel: string;
  totalEncaisse: number;
  totalOperations: number;
  typesActifs: number;
  rows: PaymentTypeAnalyticsRow[];
}

export const authorizedPaymentAnalyticsActors: PaymentAnalyticsActorCode[] = [
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

export const paymentTypeAnalyticsViewModel: PaymentTypeAnalyticsViewModel = {
  periodeLabel: 'Juin 2026',
  totalEncaisse: 4685000,
  totalOperations: 92,
  typesActifs: 6,
  rows: [
    {
      id: 'type-1',
      typeFrais: 'Minerval',
      effectif: 41,
      operations: 41,
      montantTotal: 2460000,
      moyennePaiement: 60000,
      tauxRecouvrement: 78,
      perimetre: 'Ecole active',
    },
    {
      id: 'type-2',
      typeFrais: 'Frais Etat',
      effectif: 18,
      operations: 18,
      montantTotal: 900000,
      moyennePaiement: 50000,
      tauxRecouvrement: 82,
      perimetre: 'Ecole active',
    },
    {
      id: 'type-3',
      typeFrais: 'Frais inscription',
      effectif: 9,
      operations: 9,
      montantTotal: 720000,
      moyennePaiement: 80000,
      tauxRecouvrement: 100,
      perimetre: 'Ecole active',
    },
    {
      id: 'type-4',
      typeFrais: 'Frais techniques',
      effectif: 12,
      operations: 12,
      montantTotal: 420000,
      moyennePaiement: 35000,
      tauxRecouvrement: 69,
      perimetre: 'Ecole active',
    },
    {
      id: 'type-5',
      typeFrais: 'Frais bulletin',
      effectif: 8,
      operations: 8,
      montantTotal: 160000,
      moyennePaiement: 20000,
      tauxRecouvrement: 88,
      perimetre: 'Ecole active',
    },
    {
      id: 'type-6',
      typeFrais: 'Autres frais',
      effectif: 4,
      operations: 4,
      montantTotal: 25000,
      moyennePaiement: 6250,
      tauxRecouvrement: 54,
      perimetre: 'Ecole active',
    },
  ],
};
