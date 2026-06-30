import type {
  GradeSheetApiColumn,
  GradeSheetApiRow,
  GradeSheetFilters,
  GradeSheetViewModel,
  GradeSheetColumnViewModel,
  GradeSheetCellViewModel,
  GradeSheetRowViewModel,
} from '../models/grade-sheet.model';
import {
  semestrialGradeSheetOrder,
  trimestrialGradeSheetOrder,
} from '../models/grade-sheet.model';

const totalColumnCodes = new Set([
  'TOTAL_S1',
  'TOTAL_S2',
  'TOTAL_T1',
  'TOTAL_T2',
  'TOTAL_T3',
  'TOTAL_GENERAL',
]);

const examColumnCodes = new Set(['EX1', 'EX2', 'EX3']);

function buildColumnOrder(typeStructureEvaluation: 'SEMESTRIEL' | 'TRIMESTRIEL'): readonly string[] {
  return typeStructureEvaluation === 'TRIMESTRIEL'
    ? trimestrialGradeSheetOrder
    : semestrialGradeSheetOrder;
}

function buildColumnCatalog(
  firstRow: GradeSheetApiRow | undefined,
): GradeSheetColumnViewModel[] {
  if (!firstRow) {
    return [];
  }

  const byCode = new Map<string, GradeSheetApiColumn>();
  firstRow.colonnes.forEach((column) => byCode.set(column.codeColonne, column));

  return buildColumnOrder(firstRow.typeStructureEvaluation)
    .filter((code) => byCode.has(code))
    .map((code) => {
      const column = byCode.get(code) as GradeSheetApiColumn;
      const isTotal = totalColumnCodes.has(code);
      const isExam = examColumnCodes.has(code);

      return {
        code,
        label: code.replaceAll('_', ' '),
        maximum: column.maximumColonne ?? null,
        isEditable: !isTotal,
        isTotal,
        isExam,
      };
    });
}

function buildCell(
  code: string,
  source: GradeSheetApiColumn | undefined,
  row: GradeSheetApiRow,
): GradeSheetCellViewModel {
  const isTotal = totalColumnCodes.has(code);
  const isExam = examColumnCodes.has(code);
  const maximum = source?.maximumColonne ?? 0;

  return {
    code,
    value: source?.coteObtenue ?? null,
    displayValue: source?.coteObtenue === null || source?.coteObtenue === undefined ? '' : String(source.coteObtenue),
    maximum,
    isEditable: !isTotal && (!isExam || row.aExamen),
    isTotal,
    isFailure: source?.estEchec ?? false,
    styleAffichage: source?.styleAffichage ?? 'NORMAL',
  };
}

function buildRowViewModel(
  row: GradeSheetApiRow,
  columns: GradeSheetColumnViewModel[],
  index: number,
): GradeSheetRowViewModel {
  const byCode = new Map<string, GradeSheetApiColumn>();
  row.colonnes.forEach((column) => byCode.set(column.codeColonne, column));

  const cells = columns.map((column) => buildCell(column.code, byCode.get(column.code), row));
  const editableCells = cells.filter((cell) => cell.isEditable);

  return {
    idFicheCotationEleveCours: row.idFicheCotationEleveCours,
    idEleve: row.idEleve,
    eleveLabel: row.identiteEleve?.nomComplet?.trim() || `Eleve ${index + 1}`,
    eleveMetaLabel: [
      row.identiteEleve?.matricule?.trim(),
      row.identiteEleve?.sexe?.trim(),
      row.idEleve,
    ].filter(Boolean).join(' • '),
    version: row.version,
    estCalculable: row.estCalculable,
    aExamen: row.aExamen,
    cells,
    filledCells: editableCells.filter((cell) => cell.value !== null).length,
    emptyCells: editableCells.filter((cell) => cell.value === null).length,
    failureCount: cells.filter((cell) => cell.isFailure).length,
  };
}

export function mapGradeSheetViewModel(
  rows: GradeSheetApiRow[],
  filters: GradeSheetFilters,
  actorCode: string,
): GradeSheetViewModel {
  const columns = buildColumnCatalog(rows[0]);
  const viewRows = rows.map((row, index) => buildRowViewModel(row, columns, index));
  const totalEditableCells = viewRows.reduce((sum, row) => sum + row.cells.filter((cell) => cell.isEditable).length, 0);
  const totalFilledCells = viewRows.reduce((sum, row) => sum + row.filledCells, 0);
  const totalFailures = viewRows.reduce((sum, row) => sum + row.failureCount, 0);
  const structureLabel = rows[0]?.typeStructureEvaluation === 'TRIMESTRIEL'
    ? 'Structure trimestrielle'
    : 'Structure semestrielle';

  return {
    actorScopeMessage: actorCode === 'TITULAIRE'
      ? 'Lecture et encodage limites a la classe titulaire, via les capacites effectives d enseignant.'
      : 'Lecture et encodage limites au cours et a la classe reellement affectes a l enseignant.',
    scopeLabel: [
      filters.anneeScolaireLabel,
      filters.classeLabel,
      filters.coursLabel,
    ].filter(Boolean).join(' / ') || `${filters.idAnneeScolaire} / ${filters.idClassePedagogique} / ${filters.idReferentielCours}`,
    structureLabel,
    encodeStatusLabel: 'Colonnes de total en lecture seule, cotes simples en saisie controlee.',
    totalsReadonlyLabel: 'Les totaux viennent uniquement du backend et ne sont jamais saisis localement.',
    columns,
    rows: viewRows,
    totalStudents: viewRows.length,
    totalEditableCells,
    totalFilledCells,
    totalEmptyCells: Math.max(totalEditableCells - totalFilledCells, 0),
    totalFailures,
  };
}
