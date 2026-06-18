import type { InitialiserProclamationClasseInput } from 'contexts/bulletins-evaluations/application/dto/input/InitialiserProclamationClasseInput';
import { CodeColonneBulletin } from 'contexts/bulletins-evaluations/domain/value-objects/CodeColonneBulletin';
import { ValidationHttpBulletinsEvaluations } from './ValidationHttpBulletinsEvaluations';

// Ce validateur controle la commande HTTP d'initialisation de proclamation.
export class InitialiserProclamationValidator {
  public static valider(corps: unknown, headers: unknown): InitialiserProclamationClasseInput {
    const donnees = ValidationHttpBulletinsEvaluations.obtenirObjet(corps, 'body');

    return {
      idClassePedagogique: ValidationHttpBulletinsEvaluations.lireChaineRequise(donnees, 'idClassePedagogique'),
      idAnneeScolaire: ValidationHttpBulletinsEvaluations.lireChaineRequise(donnees, 'idAnneeScolaire'),
      idEcole: ValidationHttpBulletinsEvaluations.lireChaineRequise(donnees, 'idEcole'),
      codeColonne: ValidationHttpBulletinsEvaluations.lireEnumRequis(donnees, 'codeColonne', CodeColonneBulletin),
      versionReferentielProgramme: ValidationHttpBulletinsEvaluations.lireChaineRequise(
        donnees,
        'versionReferentielProgramme',
      ),
      creePar: ValidationHttpBulletinsEvaluations.lireHeaderChaineRequise(headers, 'x-user-id'),
    };
  }
}
