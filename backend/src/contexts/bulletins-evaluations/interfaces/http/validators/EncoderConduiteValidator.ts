import { CodePeriodeSimple } from 'contexts/bulletins-evaluations/domain/value-objects/CodePeriodeSimple';
import type { EncoderConduiteInput } from 'contexts/bulletins-evaluations/application/dto/input/EncoderConduiteInput';
import { ValidationHttpBulletinsEvaluations } from './ValidationHttpBulletinsEvaluations';

// Ce validateur controle la commande HTTP d'encodage de conduite.
export class EncoderConduiteValidator {
  // Cette methode produit l'input applicatif attendu pour l'encodage de conduite.
  public static valider(corps: unknown, headers: unknown): EncoderConduiteInput {
    const donnees = ValidationHttpBulletinsEvaluations.obtenirObjet(corps, 'body');

    return {
      idResultatBulletinEleve: ValidationHttpBulletinsEvaluations.lireChaineRequise(
        donnees,
        'idResultatBulletinEleve',
      ),
      codePeriode: ValidationHttpBulletinsEvaluations.lireEnumRequis(donnees, 'codePeriode', CodePeriodeSimple),
      pointsConduite: ValidationHttpBulletinsEvaluations.lireEntierRequis(donnees, 'pointsConduite'),
      idUtilisateur: ValidationHttpBulletinsEvaluations.lireHeaderChaineRequise(headers, 'x-user-id'),
      idOrganisation: ValidationHttpBulletinsEvaluations.lireHeaderChaine(headers, 'x-organisation-id'),
    };
  }
}
