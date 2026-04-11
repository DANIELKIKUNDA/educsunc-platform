import type { Pagination } from '../../../../../shared/application/Pagination';
import { ValidationError } from '../../../../../shared/exceptions/ValidationError';
import { validerDonnees } from '../../../../../shared/validation/validator';

// Ce type represente un objet HTTP simple exploitable par les validators du BC.
export type ObjetHttpReferentielAcademique = Record<string, unknown>;

// Cette classe centralise les helpers techniques de validation HTTP du BC.
export class OutilsValidationHttpReferentielAcademique {
  // Cette methode transforme une valeur inconnue en objet HTTP simple.
  public static obtenirObjet(
    valeur: unknown,
    nomSource: string,
  ): ObjetHttpReferentielAcademique {
    if (valeur === null || valeur === undefined) {
      return {};
    }

    if (typeof valeur !== 'object' || Array.isArray(valeur)) {
      throw new ValidationError(
        `La source HTTP "${nomSource}" doit etre un objet JSON.`,
        'VALIDATION_HTTP_SOURCE_INVALIDE',
        {
          nomSource,
        },
      );
    }

    return valeur as ObjetHttpReferentielAcademique;
  }

  // Cette methode applique un schema minimal de presence sur un objet HTTP.
  public static validerChampsRequis(
    donnees: ObjetHttpReferentielAcademique,
    schema: Record<string, unknown>,
    contexte: string,
  ): void {
    const resultat = validerDonnees(donnees, schema);

    if (!resultat.valide) {
      throw new ValidationError(
        `La requete HTTP est invalide pour "${contexte}".`,
        'VALIDATION_HTTP_CHAMPS_REQUIS',
        {
          contexte,
          erreurs: resultat.erreurs,
        },
      );
    }
  }

  // Cette methode lit une chaine obligatoire et non vide.
  public static lireChaineRequise(
    donnees: ObjetHttpReferentielAcademique,
    nomChamp: string,
  ): string {
    const valeur = donnees[nomChamp];

    if (typeof valeur !== 'string') {
      throw this.creerErreurChamp(
        nomChamp,
        'doit etre une chaine de caracteres',
      );
    }

    const valeurNettoyee = valeur.trim();

    if (valeurNettoyee.length === 0) {
      throw this.creerErreurChamp(nomChamp, 'est obligatoire');
    }

    return valeurNettoyee;
  }

  // Cette methode lit une chaine optionnelle et la normalise.
  public static lireChaineOptionnelle(
    donnees: ObjetHttpReferentielAcademique,
    nomChamp: string,
  ): string | undefined {
    const valeur = donnees[nomChamp];

    if (valeur === null || valeur === undefined) {
      return undefined;
    }

    if (typeof valeur !== 'string') {
      throw this.creerErreurChamp(
        nomChamp,
        'doit etre une chaine de caracteres',
      );
    }

    const valeurNettoyee = valeur.trim();

    return valeurNettoyee.length === 0 ? undefined : valeurNettoyee;
  }

  // Cette methode lit un entier obligatoire depuis une valeur HTTP.
  public static lireNombreEntierRequis(
    donnees: ObjetHttpReferentielAcademique,
    nomChamp: string,
  ): number {
    const valeur = this.convertirEnEntier(donnees[nomChamp], nomChamp);

    if (valeur === undefined) {
      throw this.creerErreurChamp(nomChamp, 'est obligatoire');
    }

    return valeur;
  }

  // Cette methode lit un entier optionnel depuis une valeur HTTP.
  public static lireNombreEntierOptionnel(
    donnees: ObjetHttpReferentielAcademique,
    nomChamp: string,
  ): number | undefined {
    return this.convertirEnEntier(donnees[nomChamp], nomChamp);
  }

  // Cette methode lit un booleen obligatoire depuis une valeur HTTP.
  public static lireBooleenRequis(
    donnees: ObjetHttpReferentielAcademique,
    nomChamp: string,
  ): boolean {
    const valeur = this.convertirEnBooleen(donnees[nomChamp], nomChamp);

    if (valeur === undefined) {
      throw this.creerErreurChamp(nomChamp, 'est obligatoire');
    }

    return valeur;
  }

  // Cette methode lit un booleen optionnel depuis une valeur HTTP.
  public static lireBooleenOptionnel(
    donnees: ObjetHttpReferentielAcademique,
    nomChamp: string,
  ): boolean | undefined {
    return this.convertirEnBooleen(donnees[nomChamp], nomChamp);
  }

  // Cette methode lit une date obligatoire depuis une valeur HTTP.
  public static lireDateRequise(
    donnees: ObjetHttpReferentielAcademique,
    nomChamp: string,
  ): Date {
    const valeur = this.convertirEnDate(donnees[nomChamp], nomChamp);

    if (valeur === undefined) {
      throw this.creerErreurChamp(nomChamp, 'est obligatoire');
    }

    return valeur;
  }

  // Cette methode lit une valeur d'enumeration obligatoire depuis une valeur HTTP.
  public static lireEnumRequis<TValeur extends string>(
    donnees: ObjetHttpReferentielAcademique,
    nomChamp: string,
    enumeration: Record<string, TValeur>,
  ): TValeur {
    const valeur = donnees[nomChamp];

    if (typeof valeur !== 'string') {
      throw this.creerErreurChamp(
        nomChamp,
        'doit etre une valeur de type enum sous forme de chaine',
      );
    }

    const valeurNettoyee = valeur.trim();
    const valeursPossibles = Object.values(enumeration);

    if (!valeursPossibles.includes(valeurNettoyee as TValeur)) {
      throw new ValidationError(
        `Le champ "${nomChamp}" doit appartenir a l'enumeration attendue.`,
        'VALIDATION_HTTP_ENUM_INVALIDE',
        {
          nomChamp,
          valeur: valeurNettoyee,
          valeursPossibles,
        },
      );
    }

    return valeurNettoyee as TValeur;
  }

  // Cette methode lit un tableau obligatoire depuis un objet HTTP.
  public static lireTableauRequis(
    donnees: ObjetHttpReferentielAcademique,
    nomChamp: string,
  ): readonly unknown[] {
    const valeur = donnees[nomChamp];

    if (!Array.isArray(valeur)) {
      throw this.creerErreurChamp(nomChamp, 'doit etre un tableau JSON');
    }

    return valeur;
  }

  // Cette methode lit un objet obligatoire imbrique.
  public static lireObjetRequis(
    donnees: ObjetHttpReferentielAcademique,
    nomChamp: string,
  ): ObjetHttpReferentielAcademique {
    const valeur = donnees[nomChamp];

    if (valeur === null || valeur === undefined) {
      throw this.creerErreurChamp(nomChamp, 'est obligatoire');
    }

    return this.obtenirObjet(valeur, nomChamp);
  }

  // Cette methode normalise une pagination HTTP avec des valeurs par defaut raisonnables.
  public static lirePagination(valeur: unknown): Pagination {
    const donnees = this.obtenirObjet(valeur, 'query');
    const page = this.lireNombreEntierOptionnel(donnees, 'page') ?? 1;
    const taillePage = this.lireNombreEntierOptionnel(donnees, 'taillePage') ?? 20;

    if (page <= 0) {
      throw this.creerErreurChamp('page', 'doit etre un entier strictement positif');
    }

    if (taillePage <= 0) {
      throw this.creerErreurChamp(
        'taillePage',
        'doit etre un entier strictement positif',
      );
    }

    return {
      page,
      taillePage,
    };
  }

  // Cette methode convertit une valeur HTTP en entier si possible.
  private static convertirEnEntier(
    valeur: unknown,
    nomChamp: string,
  ): number | undefined {
    if (valeur === null || valeur === undefined || valeur === '') {
      return undefined;
    }

    if (typeof valeur === 'number' && Number.isInteger(valeur)) {
      return valeur;
    }

    if (typeof valeur === 'string' && /^-?\d+$/.test(valeur.trim())) {
      return Number.parseInt(valeur.trim(), 10);
    }

    throw this.creerErreurChamp(nomChamp, 'doit etre un entier');
  }

  // Cette methode convertit une valeur HTTP en booleen si possible.
  private static convertirEnBooleen(
    valeur: unknown,
    nomChamp: string,
  ): boolean | undefined {
    if (valeur === null || valeur === undefined || valeur === '') {
      return undefined;
    }

    if (typeof valeur === 'boolean') {
      return valeur;
    }

    if (typeof valeur === 'string') {
      const valeurNettoyee = valeur.trim().toLowerCase();

      if (valeurNettoyee === 'true') {
        return true;
      }

      if (valeurNettoyee === 'false') {
        return false;
      }
    }

    throw this.creerErreurChamp(nomChamp, 'doit etre un booleen');
  }

  // Cette methode convertit une valeur HTTP en date valide si possible.
  private static convertirEnDate(
    valeur: unknown,
    nomChamp: string,
  ): Date | undefined {
    if (valeur === null || valeur === undefined || valeur === '') {
      return undefined;
    }

    if (valeur instanceof Date && !Number.isNaN(valeur.getTime())) {
      return new Date(valeur.getTime());
    }

    if (typeof valeur === 'string') {
      const date = new Date(valeur.trim());

      if (!Number.isNaN(date.getTime())) {
        return date;
      }
    }

    throw this.creerErreurChamp(nomChamp, 'doit etre une date valide');
  }

  // Cette methode construit une erreur de validation coherente pour un champ HTTP.
  private static creerErreurChamp(
    nomChamp: string,
    message: string,
  ): ValidationError {
    return new ValidationError(
      `Le champ "${nomChamp}" ${message}.`,
      'VALIDATION_HTTP_CHAMP_INVALIDE',
      {
        nomChamp,
        message,
      },
    );
  }
}
