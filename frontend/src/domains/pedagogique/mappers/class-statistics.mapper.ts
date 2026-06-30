import type {
  ClassStatisticsApiData,
  ClassStatisticsFilters,
  ClassStatisticsMetricViewModel,
  ClassStatisticsViewModel,
} from '../models/class-statistics.model';

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

function formatPercent(value: number): string {
  return `${new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 2,
  }).format(value)} %`;
}

function actorScopeMessage(actorCode: string): string {
  switch (actorCode) {
    case 'TITULAIRE':
      return 'Lecture bornee a la classe titulaire et a l annee scolaire active.';
    case 'PREFET_ETUDES':
    case 'DIRECTEUR_ETUDES':
    case 'DIRECTEUR_DISCIPLINE':
      return 'Lecture bornee aux classes de la section autorisee dans l ecole active.';
    default:
      return 'Aucun perimetre statistique officiel n est ouvert pour cet acteur.';
  }
}

function buildMetric(
  code: string,
  label: string,
  garcons: number,
  filles: number,
  total: number,
): ClassStatisticsMetricViewModel {
  return {
    code,
    label,
    garcons: `${garcons}`,
    filles: `${filles}`,
    total: `${total}`,
  };
}

export function mapClassStatisticsViewModel(
  data: ClassStatisticsApiData,
  filters: ClassStatisticsFilters,
  actorCode: string,
): ClassStatisticsViewModel {
  const classe = filters.classeLabel?.trim() || `Classe ${filters.idClassePedagogique}`;
  const section = filters.sectionLabel?.trim() || 'Section active';
  const annee = filters.anneeScolaireLabel?.trim() || filters.idAnneeScolaire;

  return {
    scopeLabel: `${classe} | ${section} | ${annee}`,
    activeColumnLabel: columnLabels[filters.codeColonne] ?? filters.codeColonne,
    actorScopeMessage: actorScopeMessage(actorCode),
    metrics: [
      buildMetric('inscrits', 'Inscrits', data.inscritsGarcons, data.inscritsFilles, data.inscritsTotal),
      buildMetric('participants', 'Participants', data.participantsGarcons, data.participantsFilles, data.participantsTotal),
      buildMetric('classes', 'Classes', data.classesGarcons, data.classesFilles, data.classesTotal),
      buildMetric('non-classes', 'Non classes', data.nonClassesGarcons, data.nonClassesFilles, data.nonClassesTotal),
      buildMetric('abandons', 'Abandons', data.abandonsGarcons, data.abandonsFilles, data.abandonsTotal),
      buildMetric('reussites', 'Reussites', data.reussitesGarcons, data.reussitesFilles, data.reussitesTotal),
      buildMetric('echecs', 'Echecs', data.echecsGarcons, data.echecsFilles, data.echecsTotal),
    ],
    tauxParticipation: formatPercent(data.tauxParticipation),
    tauxReussite: formatPercent(data.tauxReussite),
    tauxEchec: formatPercent(data.tauxEchec),
    tauxAbandon: formatPercent(data.tauxAbandon),
  };
}
