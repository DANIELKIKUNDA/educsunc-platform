import { ObjetValeur } from '../../../domain/ValueObject';

export const NIVEAUX_ACCES_SECURITE = ['PLATEFORME', 'ORGANISATION', 'ECOLE'] as const;
export type NiveauAccesValeur = (typeof NIVEAUX_ACCES_SECURITE)[number];

// Cet objet valeur represente le niveau d'acces officiel d'un role ou d'une affectation.
export class NiveauAcces extends ObjetValeur<{ valeur: NiveauAccesValeur }> {
  constructor(valeur: string) {
    const valeurNormalisee = String(valeur || '').trim() as NiveauAccesValeur;
    if (!NIVEAUX_ACCES_SECURITE.includes(valeurNormalisee)) {
      throw new Error("Le niveau d'acces est invalide.");
    }

    super({ valeur: valeurNormalisee });
  }

  public obtenirValeur(): NiveauAccesValeur {
    return this.proprietes.valeur;
  }
}
