import { ValidationError } from '../../../../../shared/exceptions/ValidationError';
import { Money, type DeviseMoney } from '../../../domain/value-objects/Money';

// Ce fichier centralise les lectures techniques des donnees HTTP du BC Paiements & Facturation.
export type ObjetHttpPaiementsFacturation = Record<string, unknown>;

// Cette classe evite de dupliquer la validation technique dans tous les validators HTTP.
export class ValidationHttpPaiementsFacturation {
  // Cette methode transforme une valeur inconnue en objet HTTP simple.
  public static obtenirObjet(
    valeur: unknown,
    nomSource: string,
  ): ObjetHttpPaiementsFacturation {
    if (valeur === null || valeur === undefined) {
      return {};
    }

    if (typeof valeur !== 'object' || Array.isArray(valeur)) {
      throw new ValidationError(
        `La source HTTP "${nomSource}" doit etre un objet JSON.`,
        'VALIDATION_HTTP_SOURCE_INVALIDE',
        { nomSource },
      );
    }

    return valeur as ObjetHttpPaiementsFacturation;
  }

  // Cette methode lit une chaine obligatoire et retire les espaces parasites.
  public static lireChaineRequise(
    donnees: ObjetHttpPaiementsFacturation,
    nomChamp: string,
  ): string {
    const valeur = donnees[nomChamp];

    if (typeof valeur !== 'string' || valeur.trim().length === 0) {
      throw this.creerErreurChamp(nomChamp, 'doit etre une chaine non vide');
    }

    return valeur.trim();
  }

  // Cette methode lit une chaine optionnelle.
  public static lireChaineOptionnelle(
    donnees: ObjetHttpPaiementsFacturation,
    nomChamp: string,
  ): string | undefined {
    const valeur = donnees[nomChamp];

    if (valeur === undefined || valeur === null) {
      return undefined;
    }

    if (typeof valeur !== 'string') {
      throw this.creerErreurChamp(nomChamp, 'doit etre une chaine de caracteres');
    }

    const valeurNettoyee = valeur.trim();

    return valeurNettoyee.length === 0 ? undefined : valeurNettoyee;
  }

  // Cette methode lit une enumeration textuelle obligatoire.
  public static lireEnumRequis<TValeur extends string>(
    donnees: ObjetHttpPaiementsFacturation,
    nomChamp: string,
    enumeration: Record<string, TValeur>,
  ): TValeur {
    const valeur = this.lireChaineRequise(donnees, nomChamp);
    const valeursPossibles = Object.values(enumeration);

    if (!valeursPossibles.includes(valeur as TValeur)) {
      throw new ValidationError(
        `Le champ "${nomChamp}" doit appartenir a l'enumeration attendue.`,
        'VALIDATION_HTTP_ENUM_INVALIDE',
        {
          nomChamp,
          valeur,
          valeursPossibles,
        },
      );
    }

    return valeur as TValeur;
  }

  // Cette methode lit un header texte optionnel sans imposer le type Fastify.
  public static lireHeaderChaine(
    headers: unknown,
    nomHeader: string,
  ): string | undefined {
    const objetHeaders = this.obtenirObjet(headers, 'headers');
    const valeur = objetHeaders[nomHeader];

    if (Array.isArray(valeur)) {
      const premiereValeur = valeur[0];
      return typeof premiereValeur === 'string' && premiereValeur.trim().length > 0
        ? premiereValeur.trim()
        : undefined;
    }

    return typeof valeur === 'string' && valeur.trim().length > 0
      ? valeur.trim()
      : undefined;
  }

  // Cette methode lit un montant monetaire obligatoire au format { montant, devise }.
  public static lireMontantRequis(
    donnees: ObjetHttpPaiementsFacturation,
    nomChamp: string,
  ): Money {
    const objetMontant = this.obtenirObjet(donnees[nomChamp], nomChamp);
    const montantBrut = objetMontant.montant;
    const deviseBrute = objetMontant.devise;

    if (typeof montantBrut !== 'number' || !Number.isInteger(montantBrut)) {
      throw this.creerErreurChamp(
        `${nomChamp}.montant`,
        'doit etre un entier positif ou nul',
      );
    }

    if (deviseBrute !== 'CDF' && deviseBrute !== 'USD') {
      throw this.creerErreurChamp(
        `${nomChamp}.devise`,
        'doit etre CDF ou USD',
      );
    }

    return new Money(montantBrut, deviseBrute as DeviseMoney);
  }

  // Cette methode lit une date texte obligatoire au format exploitable par le backend.
  public static lireDateTexteRequise(
    donnees: ObjetHttpPaiementsFacturation,
    nomChamp: string,
  ): string {
    const valeur = this.lireChaineRequise(donnees, nomChamp);
    const date = new Date(valeur);

    if (Number.isNaN(date.getTime())) {
      throw this.creerErreurChamp(nomChamp, 'doit etre une date valide');
    }

    return valeur;
  }

  // Cette methode construit une erreur de validation uniforme pour un champ HTTP.
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
