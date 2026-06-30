import type { AnneeScolaireItem } from '../models/academique.model';

function dateValue(value?: string): number {
  if (!value) {
    return 0;
  }

  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

export function mapperAnneesScolaires(items: AnneeScolaireItem[]): AnneeScolaireItem[] {
  return items
    .slice()
    .sort((left, right) => dateValue(right.dateDebut) - dateValue(left.dateDebut) || right.code.localeCompare(left.code, 'fr'));
}
