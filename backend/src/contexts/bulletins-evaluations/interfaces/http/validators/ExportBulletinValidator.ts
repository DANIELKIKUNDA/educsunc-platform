import { ValidationHttpBulletinsEvaluations } from './ValidationHttpBulletinsEvaluations';

// Ce validateur controle les parametres HTTP des exports de bulletin.
export class ExportBulletinValidator {
  // Cette methode valide les champs minimaux d'une requete d'export.
  public static valider(query: unknown): {
    typeExport: string;
    idClassePedagogique?: string;
    idAnneeScolaire?: string;
    format?: string;
  } {
    const donnees = ValidationHttpBulletinsEvaluations.obtenirObjet(query, 'query');

    return {
      typeExport: ValidationHttpBulletinsEvaluations.lireChaineRequise(donnees, 'typeExport'),
      idClassePedagogique: ValidationHttpBulletinsEvaluations.lireChaineOptionnelle(donnees, 'idClassePedagogique'),
      idAnneeScolaire: ValidationHttpBulletinsEvaluations.lireChaineOptionnelle(donnees, 'idAnneeScolaire'),
      format: ValidationHttpBulletinsEvaluations.lireChaineOptionnelle(donnees, 'format'),
    };
  }
}
