import { ValidationError } from '../../../../../../shared/exceptions/ValidationError';
import {
  PonderationEvaluation,
  ProprietesPonderationEvaluation,
} from '../../../../domain/value-objects/PonderationEvaluation';

// Cette valeur represente un format de date acceptable provenant de PostgreSQL.
export type ValeurDatePostgres = Date | string;

// Cette classe centralise les conversions communes des mappers PostgreSQL du BC.
export abstract class BaseMapperPostgresReferentielAcademique {
  // Cette methode transforme une valeur de date PostgreSQL en objet Date robuste.
  protected static versDate(valeur: ValeurDatePostgres, nomChamp: string): Date {
    const date = valeur instanceof Date ? new Date(valeur.getTime()) : new Date(valeur);

    if (Number.isNaN(date.getTime())) {
      throw new ValidationError(
        `Le champ "${nomChamp}" doit etre une date PostgreSQL valide.`,
        'MAPPING_POSTGRES_DATE_INVALIDE',
      );
    }

    return date;
  }

  // Cette methode transforme une date PostgreSQL optionnelle en Date optionnelle.
  protected static versDateOptionnelle(
    valeur: ValeurDatePostgres | null | undefined,
    nomChamp: string,
  ): Date | undefined {
    if (valeur === null || valeur === undefined) {
      return undefined;
    }

    return this.versDate(valeur, nomChamp);
  }

  // Cette methode normalise une date de domaine vers un type persistant stable.
  protected static versDatePersistance(date: Date): Date {
    return new Date(date.getTime());
  }

  // Cette methode normalise une date optionnelle de domaine vers un type persistant stable.
  protected static versDatePersistanceOptionnelle(date?: Date): Date | undefined {
    return date === undefined ? undefined : new Date(date.getTime());
  }

  // Cette methode reconstruit un objet valeur de ponderation depuis la persistance.
  protected static versPonderationEvaluation(
    valeur: ProprietesPonderationEvaluation,
  ): PonderationEvaluation {
    return new PonderationEvaluation(valeur);
  }

  // Cette methode serialise un objet valeur de ponderation vers la persistance.
  protected static versPonderationPersistance(
    ponderation: PonderationEvaluation,
  ): ProprietesPonderationEvaluation {
    return ponderation.obtenirValeurs();
  }
}
