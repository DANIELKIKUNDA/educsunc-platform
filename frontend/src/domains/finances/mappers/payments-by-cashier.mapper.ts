import type {
  PaymentsByCashierApiData,
  PaymentsByCashierViewModel,
} from '../models/payments-by-cashier.model';

function construirePeriodeLabel(dateDebut?: string, dateFin?: string): string {
  if (dateDebut && dateFin) {
    return `${dateDebut} au ${dateFin}`;
  }

  if (dateDebut) {
    return `Depuis ${dateDebut}`;
  }

  if (dateFin) {
    return `Jusqu au ${dateFin}`;
  }

  return 'Toute la periode visible';
}

export function mapperPaymentsByCashierViewModel(
  lecture: PaymentsByCashierApiData,
): PaymentsByCashierViewModel {
  const rows = lecture.lignes.map((ligne) => ({
    id: ligne.idCaissier,
    caissier: ligne.idCaissier,
    montantTotal: ligne.total.montant,
    devise: ligne.total.devise,
  }));

  return {
    periodeLabel: construirePeriodeLabel(lecture.dateDebut, lecture.dateFin),
    totalEncaisse: rows.reduce((total, row) => total + row.montantTotal, 0),
    totalCaissiers: rows.length,
    rows,
  };
}
