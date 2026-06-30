import type {
  PaymentTypeAnalyticsApiData,
  PaymentTypeAnalyticsViewModel,
} from '../models/payment-type-analytics.model';

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

export function mapperPaymentTypeAnalyticsViewModel(
  lecture: PaymentTypeAnalyticsApiData,
  perimetre: string,
): PaymentTypeAnalyticsViewModel {
  const rows = lecture.lignes.map((ligne, index) => ({
    id: `${ligne.typeFrais}-${index + 1}`,
    typeFrais: ligne.typeFrais,
    montantTotal: ligne.total.montant,
    devise: ligne.total.devise,
    perimetre,
  }));

  return {
    periodeLabel: construirePeriodeLabel(lecture.dateDebut, lecture.dateFin),
    totalEncaisse: rows.reduce((total, row) => total + row.montantTotal, 0),
    typesActifs: rows.length,
    rows,
  };
}
