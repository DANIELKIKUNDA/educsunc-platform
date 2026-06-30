import { activeContextStore } from '../../../shared/session/active-context.store';
import type { CashDayApiData, CashDayViewModel } from '../models/cash-opening.model';

function formaterDateTexte(dateIso: string): string {
  const date = new Date(dateIso);

  if (Number.isNaN(date.getTime())) {
    return dateIso;
  }

  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function mapperCashDayViewModel(caisse: CashDayApiData): CashDayViewModel {
  return {
    id: caisse.idCaisseJour,
    date: caisse.date,
    dateLabel: formaterDateTexte(caisse.date),
    status: caisse.statut,
    totalEncaisse: caisse.totalEncaisse.montant,
    totalCash: caisse.totalCash.montant,
    totalMobileMoney: caisse.totalMobileMoney.montant,
    totalFondsAnticipes: caisse.totalFondsAnticipes.montant,
    totalFondsConsommes: caisse.totalFondsConsommes.montant,
    disponibleReel: caisse.disponibleReel.montant,
    cashDeskLabel: `Caisse principale - ${activeContextStore.state.schoolName}`,
    totalsByCashier: caisse.totalParCaissier.map((ligne) => ({
      cashierId: ligne.idCaissier,
      cashierLabel: `Caissier ${ligne.idCaissier}`,
      total: ligne.total.montant,
    })),
    totalsByFeeType: caisse.totalParTypeFrais.map((ligne) => ({
      feeType: ligne.typeFrais,
      total: ligne.total.montant,
    })),
  };
}
