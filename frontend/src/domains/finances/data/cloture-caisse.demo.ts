export interface DailyCashClosingSummary {
  dateLabel: string;
  openedAtLabel: string | null;
  openedByLabel: string | null;
  closingWindowLabel: string;
  schoolCashDeskLabel: string;
  status: 'FERMEE' | 'OUVERTE';
  operationsCount: number;
  receiptsCount: number;
  totalCollected: number;
  cashAmount: number;
  mobileMoneyAmount: number;
  transferAmount: number;
}

export const dailyCashClosingSummary: DailyCashClosingSummary = {
  dateLabel: '25 juin 2026',
  openedAtLabel: '06:42',
  openedByLabel: 'Daniel Kikunda',
  closingWindowLabel: '16:00 - 18:00',
  schoolCashDeskLabel: 'Caisse principale - College Saint Raphael',
  status: 'OUVERTE',
  operationsCount: 28,
  receiptsCount: 28,
  totalCollected: 1845000,
  cashAmount: 925000,
  mobileMoneyAmount: 620000,
  transferAmount: 300000,
};
