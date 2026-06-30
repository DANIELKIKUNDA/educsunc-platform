import { activeContextStore } from '../../../shared/session/active-context.store';
import type {
  ClassFinancialRegisterApiCell,
  ClassFinancialRegisterApiData,
  ClassFinancialRegisterApiStatistic,
  ClassFinancialRegisterCellViewModel,
  ClassFinancialRegisterColumnViewModel,
  ClassFinancialRegisterFilters,
  ClassFinancialRegisterRowViewModel,
  ClassFinancialRegisterStatisticRowViewModel,
  ClassFinancialRegisterViewModel,
} from '../models/class-financial-register.model';

function formatCurrency(value: number): string {
  return `${new Intl.NumberFormat('fr-FR').format(value)} FC`;
}

function formatPercent(value: number): string {
  return `${new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 1,
    minimumFractionDigits: 0,
  }).format(value)} %`;
}

function formatDate(value: string): string {
  if (value.trim().length === 0) {
    return 'Non renseignee';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('fr-FR').format(date);
}

function buildShortLabel(label: string): string {
  const compact = label.trim();

  if (compact.length <= 12) {
    return compact;
  }

  return `${compact.slice(0, 11)}…`;
}

function buildScopeLabel(filters: ClassFinancialRegisterFilters): string {
  const context = activeContextStore.state;
  const classLabel = filters.classeLabel?.trim() || 'Classe cible';
  const sectionLabel = filters.sectionLabel?.trim() || context.sectionName;
  const yearLabel = filters.anneeScolaireLabel?.trim() || context.schoolYearLabel;

  return `${classLabel} | ${sectionLabel} | ${yearLabel}`;
}

function buildPeriodeLabel(
  data: ClassFinancialRegisterApiData,
  filters: ClassFinancialRegisterFilters,
): string {
  const mois = data.moisAnalyseJusqua?.trim() || filters.moisAnalyseJusqua?.trim();
  const yearLabel = filters.anneeScolaireLabel?.trim() || data.idAnneeScolaire;

  return mois ? `Analyse jusqu a ${mois} | ${yearLabel}` : `Situation annuelle | ${yearLabel}`;
}

function mapCell(cell: ClassFinancialRegisterApiCell): ClassFinancialRegisterCellViewModel {
  return {
    colonneCode: cell.colonneCode,
    montantAttendu: cell.montantAttendu,
    montantPaye: cell.montantPaye,
    montantExonere: cell.montantExonere,
    resteARecouvrer: cell.resteARecouvrer,
    estRedevable: cell.estRedevable,
    estEnOrdre: cell.estEnOrdre,
    statutAffiche: cell.statutAffiche?.trim() || (cell.estRedevable ? (cell.estEnOrdre ? 'OK' : 'DU') : 'NR'),
  };
}

function mapRows(data: ClassFinancialRegisterApiData): ClassFinancialRegisterRowViewModel[] {
  const columnsOrder = data.colonnes
    .slice()
    .sort((left, right) => left.ordre - right.ordre)
    .map((column) => column.code);

  return data.lignes.map((row) => {
    const cellMap = new Map(row.cellules.map((cell) => [cell.colonneCode, mapCell(cell)]));
    const cells = columnsOrder.map((columnCode) =>
      cellMap.get(columnCode) ?? {
        colonneCode: columnCode,
        montantAttendu: 0,
        montantPaye: 0,
        montantExonere: 0,
        resteARecouvrer: 0,
        estRedevable: false,
        estEnOrdre: false,
        statutAffiche: 'NR',
      });

    return {
      id: row.idEleve,
      numeroOrdre: row.numeroOrdre,
      matricule: row.matricule,
      fullName: [row.nom, row.postNom, row.prenom].filter(Boolean).join(' '),
      nom: row.nom,
      postNom: row.postNom,
      prenom: row.prenom ?? '',
      sexe: row.sexe,
      dateInscription: formatDate(row.dateInscription),
      statutScolaire: row.statutScolaire,
      cells,
      totalAttendu: row.situationFinanciere.totalAttendu,
      totalPaye: row.situationFinanciere.totalPaye,
      totalExonere: row.situationFinanciere.totalExonere,
      totalReste: row.situationFinanciere.totalReste,
      estEnOrdre: row.situationFinanciere.estEnOrdre,
    };
  });
}

function buildStatisticRows(
  statisticsByColumn: Map<string, ClassFinancialRegisterApiStatistic>,
  columns: ClassFinancialRegisterColumnViewModel[],
): ClassFinancialRegisterStatisticRowViewModel[] {
  const metrics: Array<{
    metricCode: ClassFinancialRegisterStatisticRowViewModel['metricCode'];
    metricLabel: string;
    readValue: (stat: ClassFinancialRegisterApiStatistic) => string;
  }> = [
    {
      metricCode: 'redevables',
      metricLabel: 'Eleves redevables',
      readValue: (stat) => String(stat.elevesRedevables),
    },
    {
      metricCode: 'attendu',
      metricLabel: 'Montant attendu',
      readValue: (stat) => formatCurrency(stat.montantAttendu),
    },
    {
      metricCode: 'paye',
      metricLabel: 'Montant recouvre',
      readValue: (stat) => formatCurrency(stat.montantPaye),
    },
    {
      metricCode: 'reste',
      metricLabel: 'Reste a recouvrer',
      readValue: (stat) => formatCurrency(stat.resteARecouvrer),
    },
    {
      metricCode: 'en-ordre',
      metricLabel: 'Eleves en ordre',
      readValue: (stat) => String(stat.elevesEnOrdre),
    },
    {
      metricCode: 'non-en-ordre',
      metricLabel: 'Eleves non en ordre',
      readValue: (stat) => String(stat.elevesNonEnOrdre),
    },
    {
      metricCode: 'taux',
      metricLabel: 'Taux de recouvrement',
      readValue: (stat) => formatPercent(stat.tauxRecouvrement),
    },
  ];

  return metrics.map((metric) => ({
    metricCode: metric.metricCode,
    metricLabel: metric.metricLabel,
    values: Object.fromEntries(
      columns.map((column) => {
        const statistic = statisticsByColumn.get(column.code);
        return [column.code, statistic ? metric.readValue(statistic) : metric.metricCode === 'taux' ? '0 %' : '0'];
      }),
    ),
  }));
}

export function mapperClassFinancialRegisterViewModel(
  data: ClassFinancialRegisterApiData,
  filters: ClassFinancialRegisterFilters,
): ClassFinancialRegisterViewModel {
  const columns = data.colonnes
    .slice()
    .sort((left, right) => left.ordre - right.ordre)
    .map<ClassFinancialRegisterColumnViewModel>((column) => ({
      code: column.code,
      type: column.type,
      libelle: column.libelle,
      shortLabel: buildShortLabel(column.libelle),
      ordre: column.ordre,
      isSituation: column.type === 'SITUATION_FINANCIERE',
    }));

  const rows = mapRows(data);
  const statisticsByColumn = new Map(
    data.statistiquesParColonne.map((statistic) => [statistic.colonneCode, statistic]),
  );
  const statisticRows = buildStatisticRows(statisticsByColumn, columns);
  const currentSituation = statisticsByColumn.get('SITUATION_FINANCIERE');

  return {
    periodeLabel: buildPeriodeLabel(data, filters),
    scopeLabel: buildScopeLabel(filters),
    columns,
    rows,
    statisticRows,
    totalEleves: rows.length,
    totalRedevablesActuels: currentSituation?.elevesRedevables ?? 0,
    totalAttenduActuel: currentSituation?.montantAttendu ?? 0,
    totalPayeActuel: currentSituation?.montantPaye ?? 0,
    totalResteActuel: currentSituation?.resteARecouvrer ?? 0,
  };
}
