import { ValidationError } from '../../../../../../shared/exceptions/ValidationError';
import { Money, type DeviseMoney } from '../../../../domain/value-objects/Money';

export type ValeurDatePostgresPaiements = Date | string;

// Cette classe centralise les conversions communes des mappers PostgreSQL paiements.
export abstract class BaseMapperPostgresPaiementsFacturation {
  // Cette methode convertit une date PostgreSQL en Date valide.
  protected static versDate(
    valeur: ValeurDatePostgresPaiements,
    nomChamp: string,
  ): Date {
    const date =
      valeur instanceof Date ? new Date(valeur.getTime()) : new Date(valeur);

    if (Number.isNaN(date.getTime())) {
      throw new ValidationError(
        `Le champ "${nomChamp}" doit contenir une date PostgreSQL valide.`,
        'DATE_POSTGRES_PAIEMENTS_INVALIDE',
      );
    }

    return date;
  }

  // Cette methode convertit une date optionnelle.
  protected static versDateOptionnelle(
    valeur: ValeurDatePostgresPaiements | null | undefined,
    nomChamp: string,
  ): Date | undefined {
    if (valeur === null || valeur === undefined) {
      return undefined;
    }

    return this.versDate(valeur, nomChamp);
  }

  // Cette methode convertit un montant persiste vers le value object Money.
  protected static versMoney(
    montant: number,
    devise: string,
    nomChampMontant: string,
    nomChampDevise: string,
  ): Money {
    if (!Number.isInteger(montant) || montant < 0) {
      throw new ValidationError(
        `Le champ "${nomChampMontant}" doit etre un entier positif ou nul.`,
        'MONTANT_POSTGRES_PAIEMENTS_INVALIDE',
      );
    }

    if (devise !== 'CDF' && devise !== 'USD') {
      throw new ValidationError(
        `Le champ "${nomChampDevise}" doit contenir une devise valide.`,
        'DEVISE_POSTGRES_PAIEMENTS_INVALIDE',
      );
    }

    return new Money(montant, devise as DeviseMoney);
  }

  // Cette methode serialise un montant pour la persistance.
  protected static versPersistanceMoney(
    montant: Money,
  ): { montant: number; devise: DeviseMoney } {
    return {
      montant: montant.obtenirMontant(),
      devise: montant.obtenirDevise(),
    };
  }
}
