import { ValidationHttpBulletinsEvaluations } from './ValidationHttpBulletinsEvaluations';

// Ce validateur normalise les filtres de lecture HTTP du BC.
export class QueryFilterValidator {
  // Cette methode lit les filtres les plus courants de classe, annee, periode et colonne.
  public static valider(query: unknown): {
    idClassePedagogique?: string;
    idAnneeScolaire?: string;
    codePeriode?: string;
    codeColonne?: string;
  } {
    const donnees = ValidationHttpBulletinsEvaluations.obtenirObjet(query, 'query');

    return {
      idClassePedagogique: ValidationHttpBulletinsEvaluations.lireChaineOptionnelle(donnees, 'idClassePedagogique'),
      idAnneeScolaire: ValidationHttpBulletinsEvaluations.lireChaineOptionnelle(donnees, 'idAnneeScolaire'),
      codePeriode: ValidationHttpBulletinsEvaluations.lireChaineOptionnelle(donnees, 'codePeriode'),
      codeColonne: ValidationHttpBulletinsEvaluations.lireChaineOptionnelle(donnees, 'codeColonne'),
    };
  }
}
