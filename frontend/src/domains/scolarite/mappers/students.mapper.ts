import { construireNomComplet, type EleveItem } from '../models/scolarite.model';

function escapeCsvValue(value: string | number): string {
  return `"${String(value).replace(/"/g, '""')}"`;
}

export function mapperNomCompletEleve(entry: Pick<EleveItem, 'nom' | 'postNom' | 'prenom'>): string {
  return construireNomComplet(entry.nom, entry.postNom, entry.prenom);
}

export function mapperElevesCsv(entries: EleveItem[]): string {
  const headers = ['Matricule', 'Nom complet', 'Sexe', 'Statut', 'Famille', 'Provenance'];
  const rows = entries.map((entry) => [
    entry.matricule,
    mapperNomCompletEleve(entry),
    entry.sexe,
    entry.statutGlobal,
    entry.idFamille ?? '',
    entry.nomEcoleProvenance,
  ]);

  return [headers, ...rows]
    .map((line) => line.map((value) => escapeCsvValue(value)).join(';'))
    .join('\n');
}
