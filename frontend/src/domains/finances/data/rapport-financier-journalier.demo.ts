export type DailyFinancialReportActorCode =
  | 'CAISSIER'
  | 'ADMINISTRATEUR_ECOLE'
  | 'GESTIONNAIRE_ORGANISATION'
  | 'PROMOTEUR_ORGANISATION';

export interface DailyFinancialBreakdownRow {
  id: string;
  regroupement: string;
  operations: number;
  montant: number;
  part: number;
}

export interface DailyFinancialReportViewModel {
  dateLabel: string;
  totalJour: number;
  nombreOperations: number;
  panierMoyen: number;
  rowsByType: DailyFinancialBreakdownRow[];
  rowsByChannel: DailyFinancialBreakdownRow[];
}

export const authorizedDailyFinancialReportActors: DailyFinancialReportActorCode[] = [
  'CAISSIER',
  'ADMINISTRATEUR_ECOLE',
  'GESTIONNAIRE_ORGANISATION',
  'PROMOTEUR_ORGANISATION',
];

export const dailyFinancialReportViewModel: DailyFinancialReportViewModel = {
  dateLabel: '2026-06-25',
  totalJour: 1845000,
  nombreOperations: 28,
  panierMoyen: 65892,
  rowsByType: [
    { id: 'type-1', regroupement: 'Minerval', operations: 10, montant: 750000, part: 41 },
    { id: 'type-2', regroupement: 'Frais Etat', operations: 6, montant: 300000, part: 16 },
    { id: 'type-3', regroupement: 'Frais inscription', operations: 4, montant: 320000, part: 17 },
    { id: 'type-4', regroupement: 'Frais techniques', operations: 5, montant: 355000, part: 19 },
    { id: 'type-5', regroupement: 'Frais bulletin', operations: 3, montant: 120000, part: 7 },
  ],
  rowsByChannel: [
    { id: 'channel-1', regroupement: 'Especes', operations: 15, montant: 925000, part: 50 },
    { id: 'channel-2', regroupement: 'Mobile Money', operations: 9, montant: 620000, part: 34 },
    { id: 'channel-3', regroupement: 'Virement', operations: 4, montant: 300000, part: 16 },
  ],
};
