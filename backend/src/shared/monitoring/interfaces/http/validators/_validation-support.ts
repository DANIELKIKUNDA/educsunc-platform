import { MonitoringValidationException } from '../../../application';

export const objetRequis = (entree: unknown, nom: string): Record<string, unknown> => {
  if (typeof entree !== 'object' || entree === null || Array.isArray(entree)) {
    throw new MonitoringValidationException(`${nom} doit etre un objet JSON.`);
  }
  return entree as Record<string, unknown>;
};

export const texteRequis = (objet: Record<string, unknown>, cle: string, max = 255): string => {
  const valeur = objet[cle];
  if (typeof valeur !== 'string' || !valeur.trim() || valeur.trim().length > max) {
    throw new MonitoringValidationException(`${cle} est requis et doit contenir au maximum ${max} caracteres.`);
  }
  return valeur.trim();
};

export const texteOptionnel = (objet: Record<string, unknown>, cle: string, max = 500): string | undefined => {
  const valeur = objet[cle];
  if (valeur === undefined || valeur === null) return undefined;
  if (typeof valeur !== 'string' || !valeur.trim() || valeur.trim().length > max) {
    throw new MonitoringValidationException(`${cle} doit contenir au maximum ${max} caracteres.`);
  }
  return valeur.trim();
};

export const nombreRequis = (objet: Record<string, unknown>, cle: string, min?: number): number => {
  const valeur = objet[cle];
  if (typeof valeur !== 'number' || !Number.isFinite(valeur) || (min !== undefined && valeur < min)) {
    throw new MonitoringValidationException(`${cle} doit etre un nombre valide${min !== undefined ? ` superieur ou egal a ${min}` : ''}.`);
  }
  return valeur;
};

export const booleenRequis = (objet: Record<string, unknown>, cle: string): boolean => {
  const valeur = objet[cle];
  if (typeof valeur !== 'boolean') throw new MonitoringValidationException(`${cle} doit etre un booleen.`);
  return valeur;
};

export const valeurEnumRequise = <T extends string>(objet: Record<string, unknown>, cle: string, valeurs: readonly T[]): T => {
  const valeur = objet[cle];
  if (typeof valeur !== 'string' || !valeurs.includes(valeur as T)) {
    throw new MonitoringValidationException(`${cle} doit appartenir a: ${valeurs.join(', ')}.`);
  }
  return valeur as T;
};
