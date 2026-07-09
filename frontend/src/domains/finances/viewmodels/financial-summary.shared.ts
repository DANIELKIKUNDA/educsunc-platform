export const financialSummaryMonthOptions = [
  'Septembre',
  'Octobre',
  'Novembre',
  'Decembre',
  'Janvier',
  'Fevrier',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
];

export const financialSummaryFeeTypeOptions = [
  { value: 'FRAIS_MINERVAL', label: 'Minerval' },
  { value: 'FRAIS_SCOLAIRES', label: 'Frais scolaires' },
  { value: 'FRAIS_ETAT', label: 'Frais Etat' },
  { value: 'FRAIS_INSCRIPTION', label: 'Frais inscription' },
  { value: 'FRAIS_TECHNIQUES', label: 'Frais techniques' },
  { value: 'AUTRE', label: 'Autre' },
];

export function formatFinancialCurrency(value: number): string {
  return `${new Intl.NumberFormat('fr-FR').format(value)} FC`;
}

export function formatFinancialPercent(value: number): string {
  return `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 }).format(value)} %`;
}
