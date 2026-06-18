import type { ConsulterAbandonsInput } from 'contexts/bulletins-evaluations/application/dto/input/ConsulterAbandonsInput';
import type { ConsulterNonClassesInput } from 'contexts/bulletins-evaluations/application/dto/input/ConsulterNonClassesInput';
import type { ConsulterStatistiquesClasseInput } from 'contexts/bulletins-evaluations/application/dto/input/ConsulterStatistiquesClasseInput';
import type { ConsulterStatistiquesEcoleInput } from 'contexts/bulletins-evaluations/application/dto/input/ConsulterStatistiquesEcoleInput';
import { CodeColonneBulletin } from 'contexts/bulletins-evaluations/domain/value-objects/CodeColonneBulletin';
import { QueryFilterValidator } from './QueryFilterValidator';
import { ValidationHttpBulletinsEvaluations } from './ValidationHttpBulletinsEvaluations';

// Ce validateur transforme les lectures statistiques HTTP en inputs applicatifs propres.
export class ConsulterStatistiquesValidator {
  public static validerClasse(query: unknown, headers: unknown): ConsulterStatistiquesClasseInput {
    const filtres = QueryFilterValidator.valider(query);

    return {
      idClassePedagogique: ValidationHttpBulletinsEvaluations.lireChaineRequise(
        filtres as Record<string, unknown>,
        'idClassePedagogique',
      ),
      idEcole: ValidationHttpBulletinsEvaluations.lireHeaderChaineRequise(headers, 'x-tenant-id'),
      idAnneeScolaire: ValidationHttpBulletinsEvaluations.lireChaineRequise(
        filtres as Record<string, unknown>,
        'idAnneeScolaire',
      ),
      codeColonne: ValidationHttpBulletinsEvaluations.lireEnumRequis(
        filtres as Record<string, unknown>,
        'codeColonne',
        CodeColonneBulletin,
      ),
      idUtilisateur: ValidationHttpBulletinsEvaluations.lireHeaderChaineRequise(headers, 'x-user-id'),
      idOrganisation: ValidationHttpBulletinsEvaluations.lireHeaderChaine(headers, 'x-organisation-id'),
    };
  }

  public static validerEcole(query: unknown, headers: unknown): ConsulterStatistiquesEcoleInput {
    const filtres = QueryFilterValidator.valider(query);

    return {
      idEcole: ValidationHttpBulletinsEvaluations.lireChaineRequise(
        filtres as Record<string, unknown>,
        'idEcole',
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
      idUtilisateur: ValidationHttpBulletinsEvaluations.lireHeaderChaineRequise(headers, 'x-user-id'),
      idOrganisation: ValidationHttpBulletinsEvaluations.lireHeaderChaine(headers, 'x-organisation-id'),
    };
  }

  public static validerNonClasses(query: unknown, headers: unknown): ConsulterNonClassesInput {
    return this.validerClasse(query, headers);
  }

  public static validerAbandons(query: unknown, headers: unknown): ConsulterAbandonsInput {
    const filtres = QueryFilterValidator.valider(query);

    return {
      idClassePedagogique: ValidationHttpBulletinsEvaluations.lireChaineRequise(
        filtres as Record<string, unknown>,
        'idClassePedagogique',
      ),
      idEcole: ValidationHttpBulletinsEvaluations.lireHeaderChaineRequise(headers, 'x-tenant-id'),
      idAnneeScolaire: ValidationHttpBulletinsEvaluations.lireChaineRequise(
        filtres as Record<string, unknown>,
        'idAnneeScolaire',
      ),
      idUtilisateur: ValidationHttpBulletinsEvaluations.lireHeaderChaineRequise(headers, 'x-user-id'),
      idOrganisation: ValidationHttpBulletinsEvaluations.lireHeaderChaine(headers, 'x-organisation-id'),
    };
  }
}
