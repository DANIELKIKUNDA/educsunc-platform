import { ValidationError } from 'shared/exceptions/ValidationError';

// Ce helper centralise les validations HTTP simples pour SECURITY.
export class ValidationHttpSecurity {
  public static obtenirObjet(valeur: unknown, nomChamp: string): Record<string, unknown> {
    if (typeof valeur !== 'object' || valeur === null || Array.isArray(valeur)) {
      throw new ValidationError(`Le champ "${nomChamp}" doit etre un objet.`, 'SECURITY_HTTP_INVALID_OBJECT');
    }
    return valeur as Record<string, unknown>;
  }

  public static lireChaineRequise(source: Record<string, unknown>, nomChamp: string): string {
    const valeur = source[nomChamp];
    if (typeof valeur !== 'string' || valeur.trim() === '') {
      throw new ValidationError(`Le champ "${nomChamp}" est obligatoire.`, 'SECURITY_HTTP_REQUIRED_FIELD');
    }
    return valeur.trim();
  }

  public static lireChaineOptionnelle(source: Record<string, unknown>, nomChamp: string): string | undefined {
    const valeur = source[nomChamp];
    if (typeof valeur !== 'string') {
      return undefined;
    }
    const propre = valeur.trim();
    return propre === '' ? undefined : propre;
  }

  public static lireBooleenOptionnel(source: Record<string, unknown>, nomChamp: string): boolean | undefined {
    const valeur = source[nomChamp];
    return typeof valeur === 'boolean' ? valeur : undefined;
  }

  public static lireTableauChaines(source: Record<string, unknown>, nomChamp: string): string[] {
    const valeur = source[nomChamp];
    if (!Array.isArray(valeur)) {
      throw new ValidationError(`Le champ "${nomChamp}" doit etre un tableau.`, 'SECURITY_HTTP_INVALID_ARRAY');
    }
    return valeur.map((element, index) => {
      if (typeof element !== 'string' || element.trim() === '') {
        throw new ValidationError(`L'element ${index} du champ "${nomChamp}" est invalide.`, 'SECURITY_HTTP_INVALID_ARRAY_ITEM');
      }
      return element.trim();
    });
  }
}
