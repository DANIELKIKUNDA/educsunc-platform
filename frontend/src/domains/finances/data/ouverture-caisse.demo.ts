export type CashRegisterStatus = 'FERMEE' | 'OUVERTE';

export interface DailyCashRegisterContext {
  dateLabel: string;
  openedAtLabel: string | null;
  openedByLabel: string | null;
  openingWindowLabel: string;
  schoolCashDeskLabel: string;
  status: CashRegisterStatus;
}

export const dailyCashRegisterContext: DailyCashRegisterContext = {
  dateLabel: '25 juin 2026',
  openedAtLabel: null,
  openedByLabel: null,
  openingWindowLabel: '06:30 - 08:00',
  schoolCashDeskLabel: 'Caisse principale - College Saint Raphael',
  status: 'FERMEE',
};
