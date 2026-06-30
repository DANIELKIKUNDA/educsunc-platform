import { activeContextStore } from '../../../shared/session/active-context.store';
import type {
  ClassFinancialSummaryApiData,
  ClassFinancialSummaryFilters,
  ClassFinancialSummaryRowViewModel,
  ClassFinancialSummaryViewModel,
} from '../models/class-financial-summary.model';

function buildScopeLabel(filters: ClassFinancialSummaryFilters): string {
  const context = activeContextStore.state;
  const classe = filters.classeLabel?.trim() || 'Classe cible';
  const section = filters.sectionLabel?.trim() || context.sectionName;
  const annee = filters.anneeScolaireLabel?.trim() || context.schoolYearLabel;

  return `${classe} | ${section} | ${annee}`;
}

function buildPeriodeLabel(data: ClassFinancialSummaryApiData, filters: ClassFinancialSummaryFilters): string {
  const mois = data.moisAnalyseJusqua?.trim() || filters.moisAnalyseJusqua?.trim();
  const annee = filters.anneeScolaireLabel?.trim() || data.idAnneeScolaire;

  return mois ? `Lecture jusqu a ${mois} | ${annee}` : `Lecture annuelle | ${annee}`;
}

function mapRow(row: ClassFinancialSummaryApiData['lignes'][number]): ClassFinancialSummaryRowViewModel {
  return {
    id: row.code,
    mois: row.libelle,
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

export function mapperClassFinancialSummaryViewModel(
  data: ClassFinancialSummaryApiData,
  filters: ClassFinancialSummaryFilters,
): ClassFinancialSummaryViewModel {
  return {
    periodeLabel: buildPeriodeLabel(data, filters),
    scopeLabel: buildScopeLabel(filters),
    typeFraisLabel: data.typeFrais ?? 'Tous les frais mensuels',
    rows: data.lignes
      .slice()
      .sort((left, right) => left.ordre - right.ordre)
      .map(mapRow),
    situationActuelle: {
      id: 'situation-actuelle',
      mois: 'Situation actuelle',
      effectifTotal: data.situationActuelle.effectifTotal,
      redevables: data.situationActuelle.elevesRedevables,
      enOrdre: data.situationActuelle.elevesEnOrdre,
      nonEnOrdre: data.situationActuelle.elevesNonEnOrdre,
      montantAttendu: data.situationActuelle.montantAttendu.montant,
      montantPaye: data.situationActuelle.montantPaye.montant,
      resteARecouvrer: data.situationActuelle.resteARecouvrer.montant,
      tauxRecouvrement: data.situationActuelle.tauxRecouvrement,
    },
  };
}
