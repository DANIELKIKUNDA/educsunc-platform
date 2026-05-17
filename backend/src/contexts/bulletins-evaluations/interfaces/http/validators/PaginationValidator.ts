import { ValidationHttpBulletinsEvaluations } from './ValidationHttpBulletinsEvaluations';

// Ce validateur controle les parametres de pagination HTTP.
export class PaginationValidator {
  // Cette methode retourne une pagination standardisee pour les listes.
  public static valider(query: unknown): {
    page: number;
    limit: number;
    sort?: string;
    direction?: string;
  } {
    const donnees = ValidationHttpBulletinsEvaluations.obtenirObjet(query, 'query');

    return {
      page: this.lireEntierPositif(donnees, 'page', 1),
      limit: this.lireEntierPositif(donnees, 'limit', 20),
      sort: ValidationHttpBulletinsEvaluations.lireChaineOptionnelle(donnees, 'sort'),
      direction: ValidationHttpBulletinsEvaluations.lireChaineOptionnelle(donnees, 'direction'),
    };
  }

  // Cette methode lit un entier positif optionnel.
  private static lireEntierPositif(donnees: Record<string, unknown>, champ: string, valeurParDefaut: number): number {
    const valeur = donnees[champ];

    if (valeur === undefined || valeur === null || valeur === '') {
      return valeurParDefaut;
    }

    if (typeof valeur === 'string') {
      const nombre = Number(valeur);
      if (Number.isInteger(nombre) && nombre > 0) {
        return nombre;
      }
    }

    if (typeof valeur === 'number' && Number.isInteger(valeur) && valeur > 0) {
      return valeur;
    }

    return valeurParDefaut;
  }
}
