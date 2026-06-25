export interface PaymentReceiptListItem {
  idRecu: string;
  numeroRecu: string;
  idPaiement: string;
  idEleve: string;
  eleveNom: string;
  dateEmission: string;
  heureEmission: string;
  modePaiement: string;
  totalPaye: number;
  statutRecu: 'VALIDE' | 'ANNULE';
}

export interface PaymentReceiptListViewModel {
  totalRecus: number;
  pageCourante: number;
  pageSize: number;
  rows: PaymentReceiptListItem[];
}

export const paymentReceiptListViewModel: PaymentReceiptListViewModel = {
  totalRecus: 6,
  pageCourante: 1,
  pageSize: 10,
  rows: [
    {
      idRecu: 'recu-250625-001',
      numeroRecu: 'RC-250625-001',
      idPaiement: 'pay-001',
      idEleve: 'elv-001',
      eleveNom: 'Mukuta Musenge Josias',
      dateEmission: '25/06/2026',
      heureEmission: '07:18',
      modePaiement: 'Especes',
      totalPaye: 50000,
      statutRecu: 'VALIDE',
    },
    {
      idRecu: 'recu-250625-002',
      numeroRecu: 'RC-250625-002',
      idPaiement: 'pay-002',
      idEleve: 'elv-002',
      eleveNom: 'Kabongo Sarah Grace',
      dateEmission: '25/06/2026',
      heureEmission: '07:42',
      modePaiement: 'Mobile Money',
      totalPaye: 80000,
      statutRecu: 'VALIDE',
    },
    {
      idRecu: 'recu-250625-003',
      numeroRecu: 'RC-250625-003',
      idPaiement: 'pay-003',
      idEleve: 'elv-003',
      eleveNom: 'Kalenga Ruth Esther',
      dateEmission: '25/06/2026',
      heureEmission: '08:04',
      modePaiement: 'Especes',
      totalPaye: 120000,
      statutRecu: 'VALIDE',
    },
    {
      idRecu: 'recu-250625-004',
      numeroRecu: 'RC-250625-004',
      idPaiement: 'pay-004',
      idEleve: 'elv-004',
      eleveNom: 'Mwamba Bienvenu David',
      dateEmission: '25/06/2026',
      heureEmission: '09:26',
      modePaiement: 'Virement',
      totalPaye: 20000,
      statutRecu: 'VALIDE',
    },
    {
      idRecu: 'recu-250625-005',
      numeroRecu: 'RC-250625-005',
      idPaiement: 'pay-005',
      idEleve: 'elv-005',
      eleveNom: 'Tshibangu Prisca',
      dateEmission: '25/06/2026',
      heureEmission: '10:15',
      modePaiement: 'Mobile Money',
      totalPaye: 95000,
      statutRecu: 'ANNULE',
    },
    {
      idRecu: 'recu-250625-006',
      numeroRecu: 'RC-250625-006',
      idPaiement: 'pay-006',
      idEleve: 'elv-001',
      eleveNom: 'Mukuta Musenge Josias',
      dateEmission: '25/06/2026',
      heureEmission: '11:02',
      modePaiement: 'Especes',
      totalPaye: 150000,
      statutRecu: 'VALIDE',
    },
  ],
};
