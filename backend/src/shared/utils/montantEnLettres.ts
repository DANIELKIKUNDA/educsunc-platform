// Cet utilitaire convertit un montant entier en toutes lettres, avec devise configurable.
const UNITES = [
  'zero',
  'un',
  'deux',
  'trois',
  'quatre',
  'cinq',
  'six',
  'sept',
  'huit',
  'neuf',
  'dix',
  'onze',
  'douze',
  'treize',
  'quatorze',
  'quinze',
  'seize',
];

const DIZAINES = [
  '',
  'dix',
  'vingt',
  'trente',
  'quarante',
  'cinquante',
  'soixante',
];

export interface OptionsMontantEnLettres {
  devise?: string;
  majusculeInitiale?: boolean;
  suffixeImpression?: string;
}

interface DefinitionDevise {
  code: string;
  singulier: string;
  pluriel: string;
}

const DEFINITIONS_DEVISES: Record<string, DefinitionDevise> = {
  CDF: {
    code: 'CDF',
    singulier: 'franc congolais',
    pluriel: 'francs congolais',
  },
  USD: {
    code: 'USD',
    singulier: 'dollar americain',
    pluriel: 'dollars americains',
  },
};

const convertirMoinsDeCent = (montant: number): string => {
  if (montant < 17) {
    return UNITES[montant];
  }

  if (montant < 20) {
    return `dix-${UNITES[montant - 10]}`;
  }

  if (montant < 70) {
    const dizaine = Math.floor(montant / 10);
    const unite = montant % 10;
    const base = DIZAINES[dizaine];

    if (unite === 0) {
      return base;
    }

    if (unite === 1) {
      return `${base} et un`;
    }

    return `${base}-${UNITES[unite]}`;
  }

  if (montant < 80) {
    if (montant === 71) {
      return 'soixante et onze';
    }

    return `soixante-${convertirMoinsDeCent(montant - 60)}`;
  }

  if (montant === 80) {
    return 'quatre-vingts';
  }

  return `quatre-vingt-${convertirMoinsDeCent(montant - 80)}`;
};

const convertirMoinsDeMille = (montant: number): string => {
  if (montant < 100) {
    return convertirMoinsDeCent(montant);
  }

  const centaines = Math.floor(montant / 100);
  const reste = montant % 100;

  if (centaines === 1) {
    return reste === 0 ? 'cent' : `cent ${convertirMoinsDeCent(reste)}`;
  }

  const prefixe = reste === 0 ? `${UNITES[centaines]} cents` : `${UNITES[centaines]} cent`;
  return reste === 0 ? prefixe : `${prefixe} ${convertirMoinsDeCent(reste)}`;
};

const convertirEntier = (montant: number): string => {
  if (montant === 0) {
    return UNITES[0];
  }

  if (montant < 1000) {
    return convertirMoinsDeMille(montant);
  }

  if (montant < 1_000_000) {
    const milliers = Math.floor(montant / 1000);
    const reste = montant % 1000;
    const prefixe = milliers === 1 ? 'mille' : `${convertirMoinsDeMille(milliers)} mille`;

    return reste === 0 ? prefixe : `${prefixe} ${convertirMoinsDeMille(reste)}`;
  }

  if (montant < 1_000_000_000) {
    const millions = Math.floor(montant / 1_000_000);
    const reste = montant % 1_000_000;
    const prefixe = millions === 1 ? 'un million' : `${convertirEntier(millions)} millions`;

    return reste === 0 ? prefixe : `${prefixe} ${convertirEntier(reste)}`;
  }

  const milliards = Math.floor(montant / 1_000_000_000);
  const reste = montant % 1_000_000_000;
  const prefixe = milliards === 1 ? 'un milliard' : `${convertirEntier(milliards)} milliards`;

  return reste === 0 ? prefixe : `${prefixe} ${convertirEntier(reste)}`;
};

const resoudreLibelleDevise = (
  montant: number,
  deviseBrute?: string,
): string | undefined => {
  if (deviseBrute === undefined || deviseBrute.trim().length === 0) {
    return undefined;
  }

  const deviseNormalisee = deviseBrute.trim().toUpperCase();
  const definition = DEFINITIONS_DEVISES[deviseNormalisee];

  if (definition === undefined) {
    return deviseBrute.trim();
  }

  return montant <= 1 ? definition.singulier : definition.pluriel;
};

const appliquerMajusculeInitiale = (valeur: string): string => {
  if (valeur.length === 0) {
    return valeur;
  }

  return `${valeur.charAt(0).toUpperCase()}${valeur.slice(1)}`;
};

export function convertirMontantEnLettres(
  montant: number,
  options: OptionsMontantEnLettres = {},
): string {
  if (!Number.isInteger(montant) || montant < 0) {
    throw new Error('Le montant a convertir en lettres doit etre un entier positif ou nul.');
  }

  const montantEnLettres = convertirEntier(montant);
  const libelleDevise = resoudreLibelleDevise(montant, options.devise);
  const suffixeImpression = options.suffixeImpression?.trim();
  const segments = [montantEnLettres];

  if (libelleDevise !== undefined) {
    segments.push(libelleDevise);
  }

  if (suffixeImpression !== undefined && suffixeImpression.length > 0) {
    segments.push(suffixeImpression);
  }

  const rendu = segments.join(' ').replace(/\s+/g, ' ').trim();

  if (options.majusculeInitiale === false) {
    return rendu;
  }

  return appliquerMajusculeInitiale(rendu);
}
