import type {
  ClassRankingApiData,
  ClassRankingFilters,
  ClassRankingViewModel,
  RankingLineViewModel,
} from '../models/class-ranking.model';

const columnLabels: Record<string, string> = {
  P1: 'Periode 1',
  P2: 'Periode 2',
  EX1: 'Examen 1',
  TOTAL_S1: 'Total semestre 1',
  P3: 'Periode 3',
  P4: 'Periode 4',
  EX2: 'Examen 2',
  TOTAL_S2: 'Total semestre 2',
  TOTAL_GENERAL: 'Total general',
  TOTAL_T1: 'Total trimestre 1',
  TOTAL_T2: 'Total trimestre 2',
  P5: 'Periode 5',
  P6: 'Periode 6',
  EX3: 'Examen 3',
  TOTAL_T3: 'Total trimestre 3',
};

function formatDecimal(value: number | undefined): string {
  if (value === undefined) {
    return 'Non renseigne';
  }

  return new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 2,
  }).format(value);
}

function formatPercent(value: number | undefined): string {
  return value === undefined ? 'Non renseigne' : `${formatDecimal(value)} %`;
}

function formatRank(value: number | undefined): string {
  return value === undefined ? 'Non classe' : `${value}`;
}

function actorScopeMessage(actorCode: string): string {
  switch (actorCode) {
    case 'TITULAIRE':
      return 'Lecture bornee a la classe titulaire et a l annee scolaire active.';
    case 'PREFET_ETUDES':
    case 'DIRECTEUR_ETUDES':
      return 'Lecture bornee a la section secondaire autorisee dans l ecole active.';
    default:
      return 'Aucun perimetre de classement officiel n est ouvert pour cet acteur.';
  }
}

export function mapClassRankingViewModel(
  data: ClassRankingApiData,
  filters: ClassRankingFilters,
  actorCode: string,
): ClassRankingViewModel {
  const classe = filters.classeLabel?.trim() || `Classe ${filters.idClassePedagogique}`;
  const section = filters.sectionLabel?.trim() || 'Section active';
  const annee = filters.anneeScolaireLabel?.trim() || filters.idAnneeScolaire;

  const lines: RankingLineViewModel[] = data.lignes.map((line) => ({
    idEleve: line.idEleve,
    displayLabel: line.nomComplet,
    sexe: line.sexe,
    totalObtenu: formatDecimal(line.totalObtenu),
    maximumGeneral: formatDecimal(line.maximumGeneral),
    pourcentage: formatPercent(line.pourcentage),
    rang: formatRank(line.rang),
    estNonClasse: line.estNonClasse,
  }));

  const bestPercentage = Math.max(...data.lignes.map((line) => line.pourcentage ?? 0), 0);
  const nonClassesCount = data.lignes.filter((line) => line.estNonClasse).length;

  return {
    scopeLabel: `${classe} | ${section} | ${annee}`,
    activeColumnLabel: columnLabels[filters.codeColonne] ?? filters.codeColonne,
    actorScopeMessage: actorScopeMessage(actorCode),
    lineCount: lines.length,
    nonClassesCount,
    bestPercentage: bestPercentage > 0 ? `${formatDecimal(bestPercentage)} %` : 'Non renseigne',
    lines,
  };
}
