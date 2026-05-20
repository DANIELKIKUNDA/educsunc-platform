import { ObjetValeur } from '../../../domain/ValueObject';

export const ETATS_AFFECTATION_SECURITE = ['ACTIVE', 'INACTIVE', 'EXPIREE'] as const;
export type EtatAffectationValeur = (typeof ETATS_AFFECTATION_SECURITE)[number];

// Cet objet valeur porte l'etat metier d'une affectation.
export class EtatAffectation extends ObjetValeur<{ valeur: EtatAffectationValeur }> {
  constructor(valeur: string) {
    const valeurNormalisee = String(valeur || '').trim() as EtatAffectationValeur;
    if (!ETATS_AFFECTATION_SECURITE.includes(valeurNormalisee)) {
      throw new Error("L'etat d'affectation est invalide.");
    }

    super({ valeur: valeurNormalisee });
  }

  public obtenirValeur(): EtatAffectationValeur {
    return this.proprietes.valeur;
  }
}
