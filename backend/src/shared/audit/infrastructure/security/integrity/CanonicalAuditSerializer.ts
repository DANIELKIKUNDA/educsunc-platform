import { createHash } from 'node:crypto';

function normaliser(valeur: unknown): unknown {
  if (valeur instanceof Date) return valeur.toISOString();
  if (Array.isArray(valeur)) return valeur.map(normaliser);
  if (valeur && typeof valeur === 'object') {
    return Object.fromEntries(
      Object.entries(valeur as Record<string, unknown>)
        .filter(([, contenu]) => contenu !== undefined)
        .sort(([gauche], [droite]) => gauche.localeCompare(droite))
        .map(([cle, contenu]) => [cle, normaliser(contenu)]),
    );
  }
  return valeur;
}

export function serialiserAuditCanoniquement(valeur: unknown): string {
  return JSON.stringify(normaliser(valeur));
}

export function calculerChecksumAudit(valeur: unknown): string {
  return createHash('sha256').update(serialiserAuditCanoniquement(valeur), 'utf8').digest('hex');
}
