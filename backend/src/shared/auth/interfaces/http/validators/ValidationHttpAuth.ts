import { ValidationError } from 'shared/exceptions/ValidationError';

// Ce helper centralise la lecture defensive des donnees HTTP de la couche AUTH.
export class ValidationHttpAuth {
  // Cette methode s'assure qu'une valeur inconnue est bien un objet exploitable.
  public static obtenirObjet(valeur: unknown, nomChamp: string): Record<string, unknown> {
    if (typeof valeur !== 'object' || valeur === null || Array.isArray(valeur)) {
      throw new ValidationError(`Le champ ${nomChamp} doit etre un objet.`);
    }

    return valeur as Record<string, unknown>;
  }

  // Cette methode lit une chaine obligatoire dans un objet HTTP.
  public static lireChaineRequise(source: Record<string, unknown>, cle: string): string {
    const valeur = source[cle];
    if (typeof valeur !== 'string' || valeur.trim() === '') {
      throw new ValidationError(`Le champ ${cle} est obligatoire.`);
    }

    return valeur.trim();
  }

  // Cette methode lit une chaine optionnelle dans un objet HTTP.
  public static lireChaineOptionnelle(source: Record<string, unknown>, cle: string): string | undefined {
    const valeur = source[cle];
    if (valeur === undefined || valeur === null || valeur === '') {
      return undefined;
    }

    if (typeof valeur !== 'string') {
      throw new ValidationError(`Le champ ${cle} doit etre une chaine.`);
    }

    const resultat = valeur.trim();
    return resultat === '' ? undefined : resultat;
  }

  // Cette methode lit un booleen optionnel dans un objet HTTP.
  public static lireBooleenOptionnel(source: Record<string, unknown>, cle: string): boolean | undefined {
    const valeur = source[cle];
    if (valeur === undefined || valeur === null || valeur === '') {
      return undefined;
    }

    if (typeof valeur === 'boolean') {
      return valeur;
    }

    if (typeof valeur === 'string') {
      if (valeur === 'true') {
        return true;
      }

      if (valeur === 'false') {
        return false;
      }
    }

    throw new ValidationError(`Le champ ${cle} doit etre un booleen.`);
  }

  // Cette methode controle qu'un email respecte un format minimum.
  public static lireEmailRequis(source: Record<string, unknown>, cle: string): string {
    const email = this.lireChaineRequise(source, cle);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new ValidationError(`Le champ ${cle} doit contenir une adresse email valide.`);
    }

    return email;
  }

  // Cette methode lit une chaine dans les headers HTTP.
  public static lireHeaderChaine(headers: unknown, nomHeader: string): string | undefined {
    if (typeof headers !== 'object' || headers === null) {
      return undefined;
    }

    const dictionnaire = headers as Record<string, unknown>;
    const valeur = dictionnaire[nomHeader] ?? dictionnaire[nomHeader.toLowerCase()];
    if (typeof valeur !== 'string') {
      return undefined;
    }

    const resultat = valeur.trim();
    return resultat === '' ? undefined : resultat;
  }

  // Cette methode lit une chaine dans les cookies HTTP.
  public static lireCookieChaine(cookies: unknown, nomCookie: string): string | undefined {
    if (typeof cookies !== 'object' || cookies === null) {
      return undefined;
    }

    const dictionnaire = cookies as Record<string, unknown>;
    const valeur = dictionnaire[nomCookie];
    if (typeof valeur !== 'string') {
      return undefined;
    }

    const resultat = valeur.trim();
    return resultat === '' ? undefined : resultat;
  }
}
