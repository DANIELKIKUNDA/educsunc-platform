import type { InitialiserSyntheseResultatsInput } from 'contexts/bulletins-evaluations/application/dto/input/InitialiserSyntheseResultatsInput';
import { CodeColonneBulletin } from 'contexts/bulletins-evaluations/domain/value-objects/CodeColonneBulletin';
import { TypeSyntheseResultats } from 'contexts/bulletins-evaluations/domain/value-objects/TypeSyntheseResultats';
import { ValidationHttpBulletinsEvaluations } from './ValidationHttpBulletinsEvaluations';

// Ce validateur controle la commande HTTP d'initialisation de synthese.
export class InitialiserSyntheseValidator {
  public static valider(corps: unknown, headers: unknown): InitialiserSyntheseResultatsInput {
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
      creePar: ValidationHttpBulletinsEvaluations.lireHeaderChaineRequise(headers, 'x-user-id'),
    };
  }
}
