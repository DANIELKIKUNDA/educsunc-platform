import { CodeColonneBulletin } from 'contexts/bulletins-evaluations/domain/value-objects/CodeColonneBulletin';
import type { ViderCoteInput } from 'contexts/bulletins-evaluations/application/dto/input/ViderCoteInput';
import { ValidationHttpBulletinsEvaluations } from './ValidationHttpBulletinsEvaluations';

// Ce validateur controle la commande HTTP de vidage logique d'une cote.
export class ViderCoteValidator {
  // Cette methode normalise les donnees HTTP avant appel du cas d'usage de vidage.
  public static valider(params: unknown, corps: unknown, headers: unknown): ViderCoteInput {
    const parametres = ValidationHttpBulletinsEvaluations.obtenirObjet(params, 'params');
    const donnees = ValidationHttpBulletinsEvaluations.obtenirObjet(corps, 'body');

    return {
      idFicheCotationEleveCours: ValidationHttpBulletinsEvaluations.lireChaineRequise(
        parametres,
        'idFicheCotationEleveCours',
      ),
      codeColonne: ValidationHttpBulletinsEvaluations.lireEnumRequis(donnees, 'codeColonne', CodeColonneBulletin),
      versionAttendue: ValidationHttpBulletinsEvaluations.lireEntierRequis(donnees, 'versionAttendue'),
      idUtilisateur: ValidationHttpBulletinsEvaluations.lireHeaderChaine(headers, 'x-user-id') ?? 'SYSTEME',
    };
  }
}
