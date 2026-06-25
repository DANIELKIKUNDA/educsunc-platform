export type CashViewerActorCode =
  | 'CAISSIER'
  | 'ADMINISTRATEUR_ECOLE'
  | 'GESTIONNAIRE_ORGANISATION'
  | 'PROMOTEUR_ORGANISATION';

export interface CashOperationItem {
  id: string;
  heure: string;
  numeroRecu: string;
  eleve: string;
  classe: string;
  typeFrais: string;
  modePaiement: string;
  montant: number;
  acteur: string;
}

export interface DailyCashWorkbench {
  dateLabel: string;
  schoolCashDeskLabel: string;
  status: 'FERMEE' | 'OUVERTE';
  totalCollected: number;
  operationsCount: number;
  receiptsCount: number;
  cashAmount: number;
  mobileMoneyAmount: number;
  transferAmount: number;
  operations: CashOperationItem[];
}

export const authorizedCashWorkbenchActors: CashViewerActorCode[] = [
  'CAISSIER',
  'ADMINISTRATEUR_ECOLE',
  'GESTIONNAIRE_ORGANISATION',
  'PROMOTEUR_ORGANISATION',
];

export const dailyCashWorkbench: DailyCashWorkbench = {
  dateLabel: '25 juin 2026',
  schoolCashDeskLabel: 'Caisse principale - College Saint Raphael',
  status: 'OUVERTE',
  totalCollected: 1845000,
  operationsCount: 6,
  receiptsCount: 6,
  cashAmount: 925000,
  mobileMoneyAmount: 620000,
  transferAmount: 300000,
  operations: [
    {
      id: 'op-001',
      heure: '07:18',
      numeroRecu: 'RC-250625-001',
      eleve: 'Mukuta Musenge Josias',
      classe: '4e H - ELEC',
      typeFrais: 'Frais Etat - Tranche 1',
      modePaiement: 'Especes',
      montant: 50000,
      acteur: 'Daniel Kikunda',
    },
    {
      id: 'op-002',
      heure: '07:42',
      numeroRecu: 'RC-250625-002',
      eleve: 'Kabongo Sarah Grace',
      classe: '6e Primaire',
      typeFrais: 'Frais inscription',
      modePaiement: 'Mobile Money',
      montant: 80000,
      acteur: 'Daniel Kikunda',
    },
    {
      id: 'op-003',
      heure: '08:04',
      numeroRecu: 'RC-250625-003',
      eleve: 'Kalenga Ruth Esther',
      classe: '2e Humanites - CG',
      typeFrais: 'Minerval - Juin',
      modePaiement: 'Especes',
      montant: 120000,
      acteur: 'Daniel Kikunda',
    },
    {
      id: 'op-004',
      heure: '09:26',
      numeroRecu: 'RC-250625-004',
      eleve: 'Mwamba Bienvenu David',
      classe: '8e EB',
      typeFrais: 'Frais bulletin',
      modePaiement: 'Virement',
      montant: 20000,
      acteur: 'Aline Mbuyi',
    },
    {
      id: 'op-005',
      heure: '10:15',
      numeroRecu: 'RC-250625-005',
      eleve: 'Tshibangu Prisca',
      classe: '3e Humanites - SC',
      typeFrais: 'Frais techniques',
      modePaiement: 'Mobile Money',
      montant: 95000,
      acteur: 'Daniel Kikunda',
    },
    {
      id: 'op-006',
      heure: '11:02',
      numeroRecu: 'RC-250625-006',
      eleve: 'Kabuya Jeremy',
      classe: '1re Humanites - LIT',
      typeFrais: 'Minerval - Juin',
      modePaiement: 'Especes',
      montant: 150000,
      acteur: 'Aline Mbuyi',
    },
  ],
};
