import { ObjetValeur } from '../../../domain/ValueObject';

export const CODES_RESTRICTION_METIER = [
  'INTERDICTION_CAISSE',
  'INTERDICTION_BULLETINS',
  'INTERDICTION_FINANCES',
  'INTERDICTION_MODIFICATION_COTES',
  'INTERDICTION_TRANSFERT',
  'INTERDICTION_ABANDON',
] as const;

export type CodeRestrictionMetierValeur = (typeof CODES_RESTRICTION_METIER)[number];

// Cet objet valeur represente une interdiction metier officielle.
export class CodeRestrictionMetier extends ObjetValeur<{ valeur: CodeRestrictionMetierValeur }> {
  constructor(valeur: string) {
    const valeurNormalisee = String(valeur || '').trim() as CodeRestrictionMetierValeur;
    if (!CODES_RESTRICTION_METIER.includes(valeurNormalisee)) {
      throw new Error('Le code de restriction metier est invalide.');
    }

    super({ valeur: valeurNormalisee });
  }

  public obtenirValeur(): CodeRestrictionMetierValeur {
    return this.proprietes.valeur;
  }
}
