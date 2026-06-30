import {
  ActiverQualificationFinanciereEleveInput,
  DesactiverQualificationFinanciereEleveInput,
  ListerQualificationsFinancieresEleveInput,
} from '../../../application/dto/input/QualificationsFinancieresEntreeDTO';
import { CodeQualificationFinanciereEleve } from '../../../domain/value-objects/CodeQualificationFinanciereEleve';
import { ValidationHttpPaiementsFacturation } from './ValidationHttpPaiementsFacturation';

export class QualificationFinanciereEleveValidator {
  public static validerActivation(corps: unknown, headers: unknown): ActiverQualificationFinanciereEleveInput {
    const payload = ValidationHttpPaiementsFacturation.obtenirObjet(corps, 'body');

    return {
      idOrganisation: ValidationHttpPaiementsFacturation.lireHeaderChaine(headers, 'x-organisation-id') ?? '',
      idEcole: ValidationHttpPaiementsFacturation.lireHeaderChaine(headers, 'x-tenant-id') ?? '',
      idUtilisateur: ValidationHttpPaiementsFacturation.lireHeaderChaine(headers, 'x-user-id') ?? '',
      roleActif: ValidationHttpPaiementsFacturation.lireHeaderChaine(headers, 'x-role-actif'),
      idEleve: ValidationHttpPaiementsFacturation.lireChaineRequise(payload, 'idEleve'),
      codeQualification: ValidationHttpPaiementsFacturation.lireEnumRequis(
        payload,
        'codeQualification',
        CodeQualificationFinanciereEleve,
      ),
      raison: ValidationHttpPaiementsFacturation.lireChaineOptionnelle(payload, 'raison'),
      dateDebutEffet: ValidationHttpPaiementsFacturation.lireChaineOptionnelle(payload, 'dateDebutEffet'),
      details: (payload.details ?? undefined) as Record<string, unknown> | undefined,
    };
  }

  public static validerDesactivation(
    parametres: unknown,
    corps: unknown,
    headers: unknown,
  ): DesactiverQualificationFinanciereEleveInput {
    const params = ValidationHttpPaiementsFacturation.obtenirObjet(parametres, 'params');
    const payload = ValidationHttpPaiementsFacturation.obtenirObjet(corps, 'body');

    return {
      idOrganisation: ValidationHttpPaiementsFacturation.lireHeaderChaine(headers, 'x-organisation-id') ?? '',
      idEcole: ValidationHttpPaiementsFacturation.lireHeaderChaine(headers, 'x-tenant-id') ?? '',
      idUtilisateur: ValidationHttpPaiementsFacturation.lireHeaderChaine(headers, 'x-user-id') ?? '',
      roleActif: ValidationHttpPaiementsFacturation.lireHeaderChaine(headers, 'x-role-actif'),
      idQualification: ValidationHttpPaiementsFacturation.lireChaineRequise(params, 'idQualification'),
      raison: ValidationHttpPaiementsFacturation.lireChaineOptionnelle(payload, 'raison'),
      dateFinEffet: ValidationHttpPaiementsFacturation.lireChaineOptionnelle(payload, 'dateFinEffet'),
    };
  }

  public static validerListe(parametres: unknown, headers: unknown): ListerQualificationsFinancieresEleveInput {
    const params = ValidationHttpPaiementsFacturation.obtenirObjet(parametres, 'params');

    return {
      idOrganisation: ValidationHttpPaiementsFacturation.lireHeaderChaine(headers, 'x-organisation-id') ?? '',
      idEcole: ValidationHttpPaiementsFacturation.lireHeaderChaine(headers, 'x-tenant-id') ?? '',
      idUtilisateur: ValidationHttpPaiementsFacturation.lireHeaderChaine(headers, 'x-user-id') ?? '',
      roleActif: ValidationHttpPaiementsFacturation.lireHeaderChaine(headers, 'x-role-actif'),
      idEleve: ValidationHttpPaiementsFacturation.lireChaineRequise(params, 'idEleve'),
    };
  }
}
