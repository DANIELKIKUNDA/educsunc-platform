import { ObjetValeur } from '../../../domain/ValueObject';

export const TYPES_SCOPE_SECURITE = ['PLATEFORME', 'ORGANISATION', 'ECOLE', 'SECTION', 'CLASSE', 'COURS'] as const;
export type TypeScopeValeur = (typeof TYPES_SCOPE_SECURITE)[number];

// Cet objet valeur porte le type d'une portee de securite.
export class TypeScope extends ObjetValeur<{ valeur: TypeScopeValeur }> {
  constructor(valeur: string) {
    const valeurNormalisee = String(valeur || '').trim() as TypeScopeValeur;
    if (!TYPES_SCOPE_SECURITE.includes(valeurNormalisee)) {
      throw new Error('Le type de scope est invalide.');
    }

    super({ valeur: valeurNormalisee });
  }

  public obtenirValeur(): TypeScopeValeur {
    return this.proprietes.valeur;
  }
}
