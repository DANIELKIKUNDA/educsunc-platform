import { activeContextStore } from '../../../shared/session/active-context.store';
import type {
  OrganizationFinancialSummaryApiData,
  OrganizationFinancialSummaryFilters,
  OrganizationFinancialSummaryRowViewModel,
  OrganizationFinancialSummaryViewModel,
} from '../models/organization-financial-summary.model';

function buildScopeLabel(filters: OrganizationFinancialSummaryFilters): string {
  const context = activeContextStore.state;
  const organisation = filters.organisationLabel?.trim() || context.organizationName;
  const annee = filters.anneeScolaireLabel?.trim() || context.schoolYearLabel;
  return `${organisation} | ${annee}`;
}

function buildPeriodeLabel(data: OrganizationFinancialSummaryApiData, filters: OrganizationFinancialSummaryFilters): string {
  const mois = data.moisAnalyseJusqua?.trim() || filters.moisAnalyseJusqua?.trim();
  const annee = filters.anneeScolaireLabel?.trim() || data.idAnneeScolaire;
  return mois ? `Lecture jusqu a ${mois} | ${annee}` : `Lecture annuelle | ${annee}`;
}

function mapRow(row: OrganizationFinancialSummaryApiData['lignes'][number]): OrganizationFinancialSummaryRowViewModel {
  return {
    idEcole: row.idEcole,
    ecole: row.ecole,
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

export function mapperOrganizationFinancialSummaryViewModel(
  data: OrganizationFinancialSummaryApiData,
  filters: OrganizationFinancialSummaryFilters,
): OrganizationFinancialSummaryViewModel {
  return {
    periodeLabel: buildPeriodeLabel(data, filters),
    scopeLabel: buildScopeLabel(filters),
    typeFraisLabel: data.typeFrais ?? 'Tous les frais mensuels',
    rows: data.lignes.map(mapRow),
    totalGeneralOrganisation: {
      idEcole: 'TOTAL',
      ecole: 'TOTAL GENERAL ORGANISATION',
      effectifTotal: data.totalGeneralOrganisation.effectifTotal,
      redevables: data.totalGeneralOrganisation.elevesRedevables,
      enOrdre: data.totalGeneralOrganisation.elevesEnOrdre,
      nonEnOrdre: data.totalGeneralOrganisation.elevesNonEnOrdre,
      montantAttendu: data.totalGeneralOrganisation.montantAttendu.montant,
      montantPaye: data.totalGeneralOrganisation.montantPaye.montant,
      resteARecouvrer: data.totalGeneralOrganisation.resteARecouvrer.montant,
      tauxRecouvrement: data.totalGeneralOrganisation.tauxRecouvrement,
    },
  };
}
