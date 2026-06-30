import type { FamilleItem } from '../models/scolarite.model';

function escapeCsvValue(value: string | number): string {
  return `"${String(value).replace(/"/g, '""')}"`;
}

export function mapperTotalResponsables(entries: FamilleItem[]): number {
  return entries.reduce((total, entry) => total + entry.responsables.length, 0);
}

export function mapperFamillesCsv(entries: FamilleItem[]): string {
  const headers = ['Code', 'Nom famille', 'Telephone', 'Email', 'Responsables', 'Eleves actifs'];
  const rows = entries.map((entry) => [
    entry.codeFamille,
    entry.nomFamille,
    entry.telephonePrincipal,
    entry.email ?? '',
    entry.responsables.length,
    entry.nombreElevesActifs ?? '',
  ]);

  return [headers, ...rows]
    .map((line) => line.map((value) => escapeCsvValue(value)).join(';'))
    .join('\n');
}
