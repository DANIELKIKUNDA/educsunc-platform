import type { GenererSyntheseEcoleInput } from 'contexts/bulletins-evaluations/application/dto/input/GenererSyntheseEcoleInput';
import { CodeColonneBulletin } from 'contexts/bulletins-evaluations/domain/value-objects/CodeColonneBulletin';
import { TypeSyntheseResultats } from 'contexts/bulletins-evaluations/domain/value-objects/TypeSyntheseResultats';
import { ValidationHttpBulletinsEvaluations } from './ValidationHttpBulletinsEvaluations';

// Ce validateur controle la commande HTTP de generation de synthese des resultats.
export class GenererSyntheseValidator {
  // Cette methode lit les donnees HTTP et construit l'input applicatif de synthese.
  public static valider(corps: unknown, headers: unknown): GenererSyntheseEcoleInput {
    const donnees = ValidationHttpBulletinsEvaluations.obtenirObjet(corps, 'body');

    return {
      idEcole: ValidationHttpBulletinsEvaluations.lireChaineRequise(donnees, 'idEcole'),
      idAnneeScolaire: ValidationHttpBulletinsEvaluations.lireChaineRequise(donnees, 'idAnneeScolaire'),
      codeColonne: ValidationHttpBulletinsEvaluations.lireEnumRequis(donnees, 'codeColonne', CodeColonneBulletin),
      typeSynthese: ValidationHttpBulletinsEvaluations.lireEnumRequis(
        donnees,
        'typeSynthese',
        TypeSyntheseResultats,
      ),
      idUtilisateur: ValidationHttpBulletinsEvaluations.lireHeaderChaineRequise(headers, 'x-user-id'),
    };
  }
}
