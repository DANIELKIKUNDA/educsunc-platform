import { Money } from '../../../domain/value-objects/Money';

// Ce fichier regroupe les transformations HTTP communes des presenters paiements.
export interface MontantHttp {
  montant: number;
  devise: string;
}

// Cette classe contient des helpers simples pour produire un JSON stable et lisible.
export class PresentationHttpPaiementsFacturation {
  // Cette methode enveloppe une ressource unique dans le format detail du BC.
  public static detail<TDonnee>(donnee: TDonnee): { donnee: TDonnee } {
    return { donnee };
  }

  // Cette methode convertit un montant domaine ou brut en objet JSON stable.
  public static presenterMontant(valeur: unknown): MontantHttp {
    if (valeur instanceof Money) {
      return valeur.versJSON();
    }

    if (
      typeof valeur === 'object' &&
      valeur !== null &&
      'montant' in valeur &&
      'devise' in valeur
    ) {
      const montant = (valeur as { montant: unknown }).montant;
      const devise = (valeur as { devise: unknown }).devise;

      return {
        montant: Number(montant),
        devise: String(devise),
      };
    }

    throw new Error('Le montant HTTP ne peut pas etre presente car son format est invalide.');
  }

  // Cette methode transforme une date en chaine ISO exploitable cote client.
  public static presenterDate(valeur: unknown): string {
    if (valeur instanceof Date) {
      return valeur.toISOString();
    }

    if (typeof valeur === 'string') {
      const date = new Date(valeur);
      return Number.isNaN(date.getTime()) ? valeur : date.toISOString();
    }

    throw new Error('La date HTTP ne peut pas etre presentee car son format est invalide.');
  }
}
