import type {
  AnticipatedFundsApiData,
  AnticipatedFundsViewModel,
} from '../models/anticipated-funds.model';

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

export function mapperAnticipatedFundsViewModel(
  lecture: AnticipatedFundsApiData,
): AnticipatedFundsViewModel {
  return {
    totalDisponible: lecture.totalFondsAnticipes.montant,
    totalLignes: lecture.lignes.length,
    periodeLabel: construirePeriodeLabel(lecture.dateDebut, lecture.dateFin),
    rows: lecture.lignes.map((ligne, index) => ({
      id: `${ligne.origineAffectation}-${index + 1}`,
      origineAffectation: ligne.origineAffectation,
      total: ligne.total.montant,
      devise: ligne.total.devise,
    })),
  };
}
