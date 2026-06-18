// Ce fichier centralise les helpers partages des validateurs HTTP Notifications.

/** Cette fonction retourne un objet exploitable ou echoue si la valeur n est pas un objet. */
export function exigerObjet(valeur: unknown, message: string): Readonly<Record<string, unknown>> {
  if (typeof valeur !== 'object' || valeur === null || Array.isArray(valeur)) {
    throw new Error(message);
  }
  return valeur as Readonly<Record<string, unknown>>;
}

/** Cette fonction lit une chaine obligatoire dans un objet donne. */
export function exigerChaine(objet: Readonly<Record<string, unknown>>, cle: string, message?: string): string {
  const valeur = objet[cle];
  if (typeof valeur !== 'string' || valeur.trim().length === 0) {
    throw new Error(message ?? `Le champ ${cle} est obligatoire.`);
  }
  return valeur.trim();
}

/** Cette fonction lit une chaine optionnelle dans un objet donne. */
export function lireChaine(objet: Readonly<Record<string, unknown>>, cle: string): string | undefined {
  const valeur = objet[cle];
  return typeof valeur === 'string' && valeur.trim().length > 0 ? valeur.trim() : undefined;
}

/** Cette fonction lit un booleen optionnel dans un objet donne. */
export function lireBooleen(objet: Readonly<Record<string, unknown>>, cle: string): boolean | undefined {
  const valeur = objet[cle];
  if (typeof valeur === 'boolean') {
    return valeur;
  }
  if (valeur === 'true') {
    return true;
  }
  if (valeur === 'false') {
    return false;
  }
  return undefined;
}

/** Cette fonction lit une date optionnelle dans un objet donne. */
export function lireDate(objet: Readonly<Record<string, unknown>>, cle: string): Date | undefined {
  const valeur = objet[cle];
  if (typeof valeur !== 'string' || valeur.trim().length === 0) {
    return undefined;
  }
  const date = new Date(valeur);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Le champ ${cle} doit etre une date valide.`);
  }
  return date;
}

/** Cette fonction lit un entier positif avec valeur par defaut. */
export function lireEntierPositif(
  objet: Readonly<Record<string, unknown>> | undefined,
  cle: string,
  valeurParDefaut: number,
): number {
  const brute = objet?.[cle];
  if (brute == null || brute === '') {
    return valeurParDefaut;
  }
  const valeur = typeof brute === 'number' ? brute : Number(brute);
  if (!Number.isFinite(valeur) || valeur <= 0) {
    throw new Error(`Le champ ${cle} doit etre un entier positif.`);
  }
  return Math.trunc(valeur);
}
