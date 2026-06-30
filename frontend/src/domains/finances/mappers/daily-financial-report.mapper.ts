import type {
  DailyFinancialReportApiData,
  DailyFinancialReportViewModel,
} from '../models/daily-financial-report.model';

export function mapperDailyFinancialReportViewModel(
  report: DailyFinancialReportApiData,
): DailyFinancialReportViewModel {
  return {
    dateLabel: report.periode,
    totalEncaisse: report.totalEncaisse.montant,
    totalConsomme: report.totalConsomme.montant,
    totalAnticipe: report.totalAnticipe.montant,
    totalRestitue: report.totalRestitue.montant,
    totalAnnule: report.totalAnnule.montant,
  };
}
