import type { RecalculerClassementInput } from 'contexts/bulletins-evaluations/application/dto/input/RecalculerClassementInput';
import { CodeColonneBulletin } from 'contexts/bulletins-evaluations/domain/value-objects/CodeColonneBulletin';
import { ValidationHttpBulletinsEvaluations } from './ValidationHttpBulletinsEvaluations';

// Ce validateur controle la commande HTTP de recalcul de classement de classe.
export class RecalculClassementValidator {
  // Cette methode construit l'input applicatif du recalcul de classement.
  public static valider(corps: unknown): RecalculerClassementInput {
    const donnees = ValidationHttpBulletinsEvaluations.obtenirObjet(corps, 'body');

    return {
      idClassePedagogique: ValidationHttpBulletinsEvaluations.lireChaineRequise(donnees, 'idClassePedagogique'),
      idAnneeScolaire: ValidationHttpBulletinsEvaluations.lireChaineRequise(donnees, 'idAnneeScolaire'),
      codeColonne: ValidationHttpBulletinsEvaluations.lireEnumRequis(donnees, 'codeColonne', CodeColonneBulletin),
    };
  }
}
