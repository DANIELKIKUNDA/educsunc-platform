import { ValidationError } from 'shared/exceptions/ValidationError';

// Ce type represente un objet HTTP simple deja normalise.
export type ObjetHttpBulletinsEvaluations = Record<string, unknown>;

// Cette classe centralise les lectures et validations techniques des donnees HTTP du BC.
export class ValidationHttpBulletinsEvaluations {
  // Cette methode transforme une valeur inconnue en objet HTTP simple.
  public static obtenirObjet(valeur: unknown, nomSource: string): ObjetHttpBulletinsEvaluations {
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

    return valeur as ObjetHttpBulletinsEvaluations;
  }

  // Cette methode lit une chaine obligatoire.
  public static lireChaineRequise(donnees: ObjetHttpBulletinsEvaluations, nomChamp: string): string {
    const valeur = donnees[nomChamp];

    if (typeof valeur !== 'string' || valeur.trim().length === 0) {
      throw this.creerErreurChamp(nomChamp, 'doit etre une chaine non vide');
    }

    return valeur.trim();
  }

  // Cette methode lit une chaine optionnelle.
  public static lireChaineOptionnelle(donnees: ObjetHttpBulletinsEvaluations, nomChamp: string): string | undefined {
    const valeur = donnees[nomChamp];

    if (valeur === undefined || valeur === null) {
      return undefined;
    }

    if (typeof valeur !== 'string') {
      throw this.creerErreurChamp(nomChamp, 'doit etre une chaine');
    }

    const texte = valeur.trim();
    return texte.length === 0 ? undefined : texte;
  }

  // Cette methode lit un entier obligatoire.
  public static lireEntierRequis(donnees: ObjetHttpBulletinsEvaluations, nomChamp: string): number {
    const valeur = donnees[nomChamp];

    if (typeof valeur !== 'number' || !Number.isInteger(valeur)) {
      throw this.creerErreurChamp(nomChamp, 'doit etre un entier');
    }

    return valeur;
  }

  // Cette methode lit un entier nullable.
  public static lireEntierOuNull(donnees: ObjetHttpBulletinsEvaluations, nomChamp: string): number | null {
    const valeur = donnees[nomChamp];

    if (valeur === null) {
      return null;
    }

    return this.lireEntierRequis(donnees, nomChamp);
  }

  // Cette methode lit un booleen optionnel.
  public static lireBooleenOptionnel(donnees: ObjetHttpBulletinsEvaluations, nomChamp: string): boolean | undefined {
    const valeur = donnees[nomChamp];

    if (valeur === undefined || valeur === null) {
      return undefined;
    }

    if (typeof valeur !== 'boolean') {
      throw this.creerErreurChamp(nomChamp, 'doit etre un booleen');
    }

    return valeur;
  }

  // Cette methode lit une enumeration textuelle obligatoire.
  public static lireEnumRequis<TValeur extends string>(
    donnees: ObjetHttpBulletinsEvaluations,
    nomChamp: string,
    enumeration: Record<string, TValeur>,
  ): TValeur {
    const valeur = this.lireChaineRequise(donnees, nomChamp);
    const valeursPossibles = Object.values(enumeration);

    if (!valeursPossibles.includes(valeur as TValeur)) {
      throw new ValidationError(
        `Le champ "${nomChamp}" doit appartenir a l'enumeration attendue.`,
        'VALIDATION_HTTP_ENUM_INVALIDE',
        { nomChamp, valeur, valeursPossibles },
      );
    }

    return valeur as TValeur;
  }

  // Cette methode lit un header texte optionnel.
  public static lireHeaderChaine(headers: unknown, nomHeader: string): string | undefined {
    const objetHeaders = this.obtenirObjet(headers, 'headers');
    const valeur = objetHeaders[nomHeader];

    if (Array.isArray(valeur)) {
      const premiereValeur = valeur[0];
      return typeof premiereValeur === 'string' && premiereValeur.trim().length > 0
        ? premiereValeur.trim()
        : undefined;
    }

    return typeof valeur === 'string' && valeur.trim().length > 0 ? valeur.trim() : undefined;
  }

  // Cette methode lit une date optionnelle a partir d'un texte ISO.
  public static lireDateOptionnelle(donnees: ObjetHttpBulletinsEvaluations, nomChamp: string): Date | undefined {
    const valeur = this.lireChaineOptionnelle(donnees, nomChamp);

    if (valeur === undefined) {
      return undefined;
    }

    const date = new Date(valeur);

    if (Number.isNaN(date.getTime())) {
      throw this.creerErreurChamp(nomChamp, 'doit etre une date valide');
    }

    return date;
  }

  // Cette methode lit n'importe quelle charge utile presente.
  public static lireValeur(donnees: ObjetHttpBulletinsEvaluations, nomChamp: string): unknown {
    return donnees[nomChamp];
  }

  // Cette methode construit une erreur de validation uniforme.
  private static creerErreurChamp(nomChamp: string, message: string): ValidationError {
    return new ValidationError(
      `Le champ "${nomChamp}" ${message}.`,
      'VALIDATION_HTTP_CHAMP_INVALIDE',
      { nomChamp, message },
    );
  }
}
