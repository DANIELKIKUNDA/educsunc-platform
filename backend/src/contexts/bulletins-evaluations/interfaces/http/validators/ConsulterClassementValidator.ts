import type { ConsulterClassementInput } from 'contexts/bulletins-evaluations/application/dto/input/ConsulterClassementInput';
import { CodeColonneBulletin } from 'contexts/bulletins-evaluations/domain/value-objects/CodeColonneBulletin';
import { QueryFilterValidator } from './QueryFilterValidator';
import { ValidationHttpBulletinsEvaluations } from './ValidationHttpBulletinsEvaluations';

// Ce validateur transforme la lecture HTTP d'un classement en input applicatif propre.
export class ConsulterClassementValidator {
  public static valider(query: unknown, headers: unknown): ConsulterClassementInput {
    const filtres = QueryFilterValidator.valider(query);

    return {
      idClassePedagogique: ValidationHttpBulletinsEvaluations.lireChaineRequise(
        filtres as Record<string, unknown>,
        'idClassePedagogique',
      ),
      idAnneeScolaire: ValidationHttpBulletinsEvaluations.lireChaineRequise(
        filtres as Record<string, unknown>,
        'idAnneeScolaire',
      ),
      codeColonne: ValidationHttpBulletinsEvaluations.lireEnumRequis(
        filtres as Record<string, unknown>,
        'codeColonne',
        CodeColonneBulletin,
      ),
      idEcole: ValidationHttpBulletinsEvaluations.lireHeaderChaineRequise(headers, 'x-tenant-id'),
      idUtilisateur: ValidationHttpBulletinsEvaluations.lireHeaderChaineRequise(headers, 'x-user-id'),
      idOrganisation: ValidationHttpBulletinsEvaluations.lireHeaderChaine(headers, 'x-organisation-id'),
    };
  }
}
