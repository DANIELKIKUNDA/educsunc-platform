import type { GenererProclamationClasseInput } from 'contexts/bulletins-evaluations/application/dto/input/GenererProclamationClasseInput';
import { CodeColonneBulletin } from 'contexts/bulletins-evaluations/domain/value-objects/CodeColonneBulletin';
import { TypeProclamation } from 'contexts/bulletins-evaluations/domain/value-objects/TypeProclamation';
import { ValidationHttpBulletinsEvaluations } from './ValidationHttpBulletinsEvaluations';

// Ce validateur controle la commande HTTP de generation de proclamation de classe.
export class GenererProclamationValidator {
  // Cette methode lit la requete HTTP et produit l'input applicatif attendu.
  public static valider(corps: unknown, headers: unknown): GenererProclamationClasseInput {
    const donnees = ValidationHttpBulletinsEvaluations.obtenirObjet(corps, 'body');

    return {
      idOrganisation: ValidationHttpBulletinsEvaluations.lireHeaderChaine(headers, 'x-organisation-id'),
      idClassePedagogique: ValidationHttpBulletinsEvaluations.lireChaineRequise(donnees, 'idClassePedagogique'),
      idAnneeScolaire: ValidationHttpBulletinsEvaluations.lireChaineRequise(donnees, 'idAnneeScolaire'),
      codeColonne: ValidationHttpBulletinsEvaluations.lireEnumRequis(donnees, 'codeColonne', CodeColonneBulletin),
      typeProclamation: ValidationHttpBulletinsEvaluations.lireEnumRequis(
        donnees,
        'typeProclamation',
        TypeProclamation,
      ),
      idUtilisateur: ValidationHttpBulletinsEvaluations.lireHeaderChaineRequise(headers, 'x-user-id'),
    };
  }
}
