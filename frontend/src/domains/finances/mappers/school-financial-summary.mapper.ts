import { activeContextStore } from '../../../shared/session/active-context.store';
import type {
  SchoolFinancialSummaryApiData,
  SchoolFinancialSummaryFilters,
  SchoolFinancialSummaryRowViewModel,
  SchoolFinancialSummaryViewModel,
} from '../models/school-financial-summary.model';

function buildScopeLabel(filters: SchoolFinancialSummaryFilters): string {
  const context = activeContextStore.state;
  const ecole = filters.ecoleLabel?.trim() || context.schoolName;
  const annee = filters.anneeScolaireLabel?.trim() || context.schoolYearLabel;
  return `${ecole} | ${annee}`;
}

function buildPeriodeLabel(data: SchoolFinancialSummaryApiData, filters: SchoolFinancialSummaryFilters): string {
  const mois = data.moisAnalyseJusqua?.trim() || filters.moisAnalyseJusqua?.trim();
  const annee = filters.anneeScolaireLabel?.trim() || data.idAnneeScolaire;
  return mois ? `Lecture jusqu a ${mois} | ${annee}` : `Lecture annuelle | ${annee}`;
}

function mapRow(row: SchoolFinancialSummaryApiData['lignes'][number]): SchoolFinancialSummaryRowViewModel {
  return {
    idSectionScolaire: row.idSectionScolaire,
    section: row.section,
    effectifTotal: row.effectifTotal,
    redevables: row.elevesRedevables,
    enOrdre: row.elevesEnOrdre,
    nonEnOrdre: row.elevesNonEnOrdre,
    montantAttendu: row.montantAttendu.montant,
    montantPaye: row.montantPaye.montant,
    resteARecouvrer: row.resteARecouvrer.montant,
    tauxRecouvrement: row.tauxRecouvrement,
  };
}

export function mapperSchoolFinancialSummaryViewModel(
  data: SchoolFinancialSummaryApiData,
  filters: SchoolFinancialSummaryFilters,
): SchoolFinancialSummaryViewModel {
  return {
    periodeLabel: buildPeriodeLabel(data, filters),
    scopeLabel: buildScopeLabel(filters),
    typeFraisLabel: data.typeFrais ?? 'Tous les frais mensuels',
    rows: data.lignes.map(mapRow),
    totalGeneralEcole: {
      idSectionScolaire: 'TOTAL',
      section: 'TOTAL GENERAL ECOLE',
      effectifTotal: data.totalGeneralEcole.effectifTotal,
      redevables: data.totalGeneralEcole.elevesRedevables,
      enOrdre: data.totalGeneralEcole.elevesEnOrdre,
      nonEnOrdre: data.totalGeneralEcole.elevesNonEnOrdre,
      montantAttendu: data.totalGeneralEcole.montantAttendu.montant,
      montantPaye: data.totalGeneralEcole.montantPaye.montant,
      resteARecouvrer: data.totalGeneralEcole.resteARecouvrer.montant,
      tauxRecouvrement: data.totalGeneralEcole.tauxRecouvrement,
    },
  };
}
