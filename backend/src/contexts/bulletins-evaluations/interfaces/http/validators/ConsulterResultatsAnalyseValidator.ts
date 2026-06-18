import type { ConsulterComparatifClassesInput } from 'contexts/bulletins-evaluations/application/dto/input/ConsulterComparatifClassesInput';
import type { ConsulterCoursProblematiqueInput } from 'contexts/bulletins-evaluations/application/dto/input/ConsulterCoursProblematiquesInput';
import type { ConsulterEchecsClasseInput } from 'contexts/bulletins-evaluations/application/dto/input/ConsulterEchecsClasseInput';
import type { ConsulterEvolutionResultatInput } from 'contexts/bulletins-evaluations/application/dto/input/ConsulterEvolutionResultatInput';
import type { ConsulterPerequationClasseInput } from 'contexts/bulletins-evaluations/application/dto/input/ConsulterPerequationClasseInput';
import type { ConsulterRepechageClasseInput } from 'contexts/bulletins-evaluations/application/dto/input/ConsulterRepechageClasseInput';
import type { ConsulterDeliberationClasseInput } from 'contexts/bulletins-evaluations/application/dto/input/ConsulterDeliberationClasseInput';
import type { ConsulterSecondeSessionClasseInput } from 'contexts/bulletins-evaluations/application/dto/input/ConsulterSecondeSessionClasseInput';
import { CodeColonneBulletin } from 'contexts/bulletins-evaluations/domain/value-objects/CodeColonneBulletin';
import { ValidationError } from 'shared/exceptions/ValidationError';
import { QueryFilterValidator } from './QueryFilterValidator';
import { ValidationHttpBulletinsEvaluations } from './ValidationHttpBulletinsEvaluations';

// Ce validateur transforme les lectures d'analyse resultat en inputs applicatifs propres.
export class ConsulterResultatsAnalyseValidator {
  public static validerEchecsClasse(query: unknown, headers: unknown): ConsulterEchecsClasseInput {
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

  public static validerCoursProblematique(query: unknown, headers: unknown): ConsulterCoursProblematiqueInput {
    return this.validerEchecsClasse(query, headers);
  }

  public static validerPerequation(query: unknown, headers: unknown): ConsulterPerequationClasseInput {
    return this.validerEchecsClasse(query, headers);
  }

  public static validerRepechage(query: unknown, headers: unknown): ConsulterRepechageClasseInput {
    return this.validerEchecsClasse(query, headers);
  }

  public static validerDeliberation(query: unknown, headers: unknown): ConsulterDeliberationClasseInput {
    return this.validerEchecsClasse(query, headers);
  }

  public static validerSecondeSession(query: unknown, headers: unknown): ConsulterSecondeSessionClasseInput {
    return this.validerEchecsClasse(query, headers);
  }

  public static validerComparatifClasses(query: unknown, headers: unknown): ConsulterComparatifClassesInput {
    const donnees = ValidationHttpBulletinsEvaluations.obtenirObjet(query, 'query');
    const idsClasses = ValidationHttpBulletinsEvaluations.lireChaineRequise(
      donnees,
      'idClassesPedagogiques',
    )
      .split(',')
      .map((valeur) => valeur.trim())
      .filter((valeur) => valeur.length > 0);

    if (idsClasses.length === 0) {
      throw new ValidationError(
        'Le champ "idClassesPedagogiques" doit contenir au moins une classe.',
        'VALIDATION_HTTP_CHAMP_INVALIDE',
        { nomChamp: 'idClassesPedagogiques' },
      );
    }

    return {
      idClassesPedagogiques: idsClasses,
      idEcole: ValidationHttpBulletinsEvaluations.lireHeaderChaineRequise(headers, 'x-tenant-id'),
      idAnneeScolaire: ValidationHttpBulletinsEvaluations.lireChaineRequise(donnees, 'idAnneeScolaire'),
      codeColonne: ValidationHttpBulletinsEvaluations.lireEnumRequis(donnees, 'codeColonne', CodeColonneBulletin),
      idUtilisateur: ValidationHttpBulletinsEvaluations.lireHeaderChaineRequise(headers, 'x-user-id'),
      idOrganisation: ValidationHttpBulletinsEvaluations.lireHeaderChaine(headers, 'x-organisation-id'),
    };
  }

  public static validerEvolutionResultat(params: unknown, query: unknown, headers: unknown): ConsulterEvolutionResultatInput {
    const donneesParams = ValidationHttpBulletinsEvaluations.obtenirObjet(params, 'params');
    const donneesQuery = ValidationHttpBulletinsEvaluations.obtenirObjet(query, 'query');
    const codeColonne = ValidationHttpBulletinsEvaluations.lireChaineOptionnelle(donneesQuery, 'codeColonne');

    return {
      idEleve: ValidationHttpBulletinsEvaluations.lireChaineRequise(donneesParams, 'idEleve'),
      idAnneeScolaire: ValidationHttpBulletinsEvaluations.lireChaineRequise(donneesParams, 'idAnneeScolaire'),
      codeColonne: codeColonne === undefined
        ? undefined
        : ValidationHttpBulletinsEvaluations.lireEnumRequis(
            { codeColonne } as Record<string, unknown>,
            'codeColonne',
            CodeColonneBulletin,
          ),
      idUtilisateur: ValidationHttpBulletinsEvaluations.lireHeaderChaineRequise(headers, 'x-user-id'),
      idOrganisation: ValidationHttpBulletinsEvaluations.lireHeaderChaine(headers, 'x-organisation-id'),
    };
  }
}
