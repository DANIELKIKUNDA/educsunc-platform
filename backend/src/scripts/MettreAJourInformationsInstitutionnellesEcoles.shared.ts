export type EnregistrementInformationsInstitutionnellesEcole = {
  idEcole: string;
  sigle?: string;
  adresse?: string;
  telephone?: string;
  email?: string;
  provinceEducationnelle?: string;
  ville?: string;
  communeOuTerritoire?: string;
};

export function validerEnregistrementInformationsInstitutionnellesEcole(
  valeur: unknown,
  index: number,
): EnregistrementInformationsInstitutionnellesEcole {
  if (valeur === null || typeof valeur !== 'object') {
    throw new Error(`L'enregistrement #${index + 1} doit etre un objet JSON.`);
  }

  const objet = valeur as Record<string, unknown>;
  const idEcole = lireTexteObligatoire(objet.idEcole, `idEcole[#${index + 1}]`);
  const sortie = {
    idEcole,
    sigle: lireTexteOptionnel(objet.sigle),
    adresse: lireTexteOptionnel(objet.adresse),
    telephone: lireTexteOptionnel(objet.telephone),
    email: lireTexteOptionnel(objet.email),
    provinceEducationnelle: lireTexteOptionnel(objet.provinceEducationnelle),
    ville: lireTexteOptionnel(objet.ville),
    communeOuTerritoire: lireTexteOptionnel(objet.communeOuTerritoire),
  };

  if (
    sortie.sigle === undefined
    && sortie.adresse === undefined
    && sortie.telephone === undefined
    && sortie.email === undefined
    && sortie.provinceEducationnelle === undefined
    && sortie.ville === undefined
    && sortie.communeOuTerritoire === undefined
  ) {
    throw new Error(
      `L'enregistrement #${index + 1} doit contenir au moins une information institutionnelle.`,
    );
  }

  return sortie;
}

export function construirePayloadInformationsInstitutionnellesEcole(
  ecole: EnregistrementInformationsInstitutionnellesEcole,
): Record<string, string> {
  const payload: Record<string, string> = {};

  if (ecole.sigle !== undefined) payload.sigle = ecole.sigle;
  if (ecole.adresse !== undefined) payload.adresse = ecole.adresse;
  if (ecole.telephone !== undefined) payload.telephone = ecole.telephone;
  if (ecole.email !== undefined) payload.email = ecole.email;
  if (ecole.provinceEducationnelle !== undefined) {
    payload.provinceEducationnelle = ecole.provinceEducationnelle;
  }
  if (ecole.ville !== undefined) payload.ville = ecole.ville;
  if (ecole.communeOuTerritoire !== undefined) {
    payload.communeOuTerritoire = ecole.communeOuTerritoire;
  }

  return payload;
}

function lireTexteObligatoire(valeur: unknown, nomChamp: string): string {
  if (typeof valeur !== 'string') {
    throw new Error(`Le champ ${nomChamp} doit etre une chaine.`);
  }

  const valeurNettoyee = valeur.trim();
  if (valeurNettoyee.length === 0) {
    throw new Error(`Le champ ${nomChamp} est obligatoire.`);
  }

  return valeurNettoyee;
}

function lireTexteOptionnel(valeur: unknown): string | undefined {
  if (valeur === undefined || valeur === null) {
    return undefined;
  }

  if (typeof valeur !== 'string') {
    throw new Error('Une valeur institutionnelle optionnelle doit etre une chaine.');
  }

  const valeurNettoyee = valeur.trim();
  return valeurNettoyee.length > 0 ? valeurNettoyee : undefined;
}
