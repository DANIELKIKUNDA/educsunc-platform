export type CashierAnalyticsActorCode =
  | 'CAISSIER'
  | 'ADMINISTRATEUR_ECOLE'
  | 'GESTIONNAIRE_ORGANISATION'
  | 'PROMOTEUR_ORGANISATION';

export interface CashierAnalyticsRow {
  id: string;
  caissier: string;
  operations: number;
  montantTotal: number;
  moyenne: number;
  modeDominant: string;
}

export interface CashierAnalyticsViewModel {
  periodeLabel: string;
  totalEncaisse: number;
  totalOperations: number;
  totalCaissiers: number;
  rows: CashierAnalyticsRow[];
}

export const authorizedCashierAnalyticsActors: CashierAnalyticsActorCode[] = [
  'CAISSIER',
  'ADMINISTRATEUR_ECOLE',
  'GESTIONNAIRE_ORGANISATION',
  'PROMOTEUR_ORGANISATION',
];

export const cashierAnalyticsViewModel: CashierAnalyticsViewModel = {
  periodeLabel: 'Juin 2026',
  totalEncaisse: 4685000,
  totalOperations: 92,
  totalCaissiers: 3,
  rows: [
    {
      id: 'cashier-1',
      caissier: 'Daniel Kikunda',
      operations: 41,
      montantTotal: 1980000,
      moyenne: 48293,
      modeDominant: 'Especes',
    },
    {
      id: 'cashier-2',
      caissier: 'Aline Mbuyi',
      operations: 33,
      montantTotal: 1765000,
      moyenne: 53485,
      modeDominant: 'Mobile Money',
    },
    {
      id: 'cashier-3',
      caissier: 'Banza Joel',
      operations: 18,
      montantTotal: 940000,
      moyenne: 52222,
      modeDominant: 'Virement',
    },
  ],
};
