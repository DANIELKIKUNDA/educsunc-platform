import { CodeColonneBulletin } from 'contexts/bulletins-evaluations/domain/value-objects/CodeColonneBulletin';
import type { ModifierCoteInput } from 'contexts/bulletins-evaluations/application/dto/input/ModifierCoteInput';
import { ValidationHttpBulletinsEvaluations } from './ValidationHttpBulletinsEvaluations';

// Ce validateur controle la commande HTTP de modification d'une cote existante.
export class ModifierCoteValidator {
  // Cette methode lit les parametres, le corps et les headers pour produire l'input applicatif attendu.
  public static valider(params: unknown, corps: unknown, headers: unknown): ModifierCoteInput {
    const parametres = ValidationHttpBulletinsEvaluations.obtenirObjet(params, 'params');
    const donnees = ValidationHttpBulletinsEvaluations.obtenirObjet(corps, 'body');

    return {
      idFicheCotationEleveCours: ValidationHttpBulletinsEvaluations.lireChaineRequise(
        parametres,
        'idFicheCotationEleveCours',
      ),
      codeColonne: ValidationHttpBulletinsEvaluations.lireEnumRequis(donnees, 'codeColonne', CodeColonneBulletin),
      nouvelleCote: ValidationHttpBulletinsEvaluations.lireEntierRequis(donnees, 'nouvelleCote'),
      versionAttendue: ValidationHttpBulletinsEvaluations.lireEntierRequis(donnees, 'versionAttendue'),
      idUtilisateur: ValidationHttpBulletinsEvaluations.lireHeaderChaineRequise(headers, 'x-user-id'),
      idOrganisation: ValidationHttpBulletinsEvaluations.lireHeaderChaine(headers, 'x-organisation-id'),
      cleIdempotence: ValidationHttpBulletinsEvaluations.lireHeaderChaine(headers, 'x-idempotency-key'),
    };
  }
}
