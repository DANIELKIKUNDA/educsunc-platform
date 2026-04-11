type ErreurValidation = {
  champ: string;
  message: string;
};

type ResultatValidation = {
  valide: boolean;
  erreurs: ErreurValidation[];
};

// Cette fonction verifie qu'une valeur est vide selon des regles techniques simples.
export const estVide = (valeur: unknown): boolean => {
  if (valeur === null || valeur === undefined) {
    return true;
  }

  if (typeof valeur === 'string') {
    return valeur.trim().length === 0;
  }

  if (Array.isArray(valeur)) {
    return valeur.length === 0;
  }

  return false;
};

// Cette fonction verifie qu'une valeur peut etre traitee comme un objet simple.
const estObjetSimple = (valeur: any): valeur is Record<string, unknown> => {
  return valeur !== null && typeof valeur === 'object' && !Array.isArray(valeur);
};

// Cette fonction indique si une definition de schema marque un champ comme requis.
const estChampRequis = (definition: any): boolean => {
  if (typeof definition === 'boolean') {
    return definition;
  }

  if (estObjetSimple(definition) && 'requis' in definition) {
    return Boolean(definition.requis);
  }

  return true;
};

// Cette fonction verifie qu'un champ est present dans les donnees a valider.
const estChampPresent = (donnees: Record<string, unknown>, cle: string): boolean => {
  if (!Object.prototype.hasOwnProperty.call(donnees, cle)) {
    return false;
  }

  return !estVide(donnees[cle]);
};

// Cette fonction fournit une validation technique simple des donnees et pourra evoluer plus tard vers Zod ou une autre solution specialisee.
export const validerDonnees = (
  valeur: any,
  schema: any,
): ResultatValidation => {
  if (schema === null || schema === undefined) {
    return { valide: true, erreurs: [] };
  }

  if (!estObjetSimple(schema)) {
    return {
      valide: false,
      erreurs: [
        {
          champ: 'schema',
          message: 'schema invalide',
        },
      ],
    };
  }

  const erreurs: ErreurValidation[] = [];
  const donnees = estObjetSimple(valeur) ? valeur : {};
  const schemaObjet = schema as Record<string, unknown>;

  for (const [cle, definition] of Object.entries(schemaObjet)) {
    if (!estChampRequis(definition)) {
      continue;
    }

    if (!estChampPresent(donnees, cle)) {
      erreurs.push({
        champ: cle,
        message: 'champ requis',
      });
    }
  }

  return {
    valide: erreurs.length === 0,
    erreurs,
  };
};
