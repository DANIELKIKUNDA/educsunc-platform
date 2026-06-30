import { activeContextStore } from '../../../shared/session/active-context.store';
import type {
  SectionFinancialSummaryApiData,
  SectionFinancialSummaryFilters,
  SectionFinancialSummaryRowViewModel,
  SectionFinancialSummaryViewModel,
} from '../models/section-financial-summary.model';

function buildScopeLabel(filters: SectionFinancialSummaryFilters): string {
  const context = activeContextStore.state;
  const section = filters.sectionLabel?.trim() || context.sectionName;
  const annee = filters.anneeScolaireLabel?.trim() || context.schoolYearLabel;
  return `${section} | ${annee}`;
}

function buildPeriodeLabel(data: SectionFinancialSummaryApiData, filters: SectionFinancialSummaryFilters): string {
  const mois = data.moisAnalyseJusqua?.trim() || filters.moisAnalyseJusqua?.trim();
  const annee = filters.anneeScolaireLabel?.trim() || data.idAnneeScolaire;
  return mois ? `Lecture jusqu a ${mois} | ${annee}` : `Lecture annuelle | ${annee}`;
}

function mapRow(row: SectionFinancialSummaryApiData['lignes'][number]): SectionFinancialSummaryRowViewModel {
  return {
    idClassePedagogique: row.idClassePedagogique,
    classe: row.classe,
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

export function mapperSectionFinancialSummaryViewModel(
  data: SectionFinancialSummaryApiData,
  filters: SectionFinancialSummaryFilters,
): SectionFinancialSummaryViewModel {
  return {
    periodeLabel: buildPeriodeLabel(data, filters),
    scopeLabel: buildScopeLabel(filters),
    typeFraisLabel: data.typeFrais ?? 'Tous les frais mensuels',
    rows: data.lignes.map(mapRow),
    totalGeneralSection: {
      idClassePedagogique: 'TOTAL',
      classe: 'TOTAL GENERAL SECTION',
      effectifTotal: data.totalGeneralSection.effectifTotal,
      redevables: data.totalGeneralSection.elevesRedevables,
      enOrdre: data.totalGeneralSection.elevesEnOrdre,
      nonEnOrdre: data.totalGeneralSection.elevesNonEnOrdre,
      montantAttendu: data.totalGeneralSection.montantAttendu.montant,
      montantPaye: data.totalGeneralSection.montantPaye.montant,
      resteARecouvrer: data.totalGeneralSection.resteARecouvrer.montant,
      tauxRecouvrement: data.totalGeneralSection.tauxRecouvrement,
    },
  };
}
