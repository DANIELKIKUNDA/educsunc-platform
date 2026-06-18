import type {
  AccorderExonerationInput,
  AnnulerExonerationInput,
} from '../../../application/dto/input/ExonerationsEntreeDTO';
import { TypeExoneration } from '../../../domain/value-objects/TypeExoneration';
import { ParamValidator } from './ParamValidator';
import { ValidationHttpPaiementsFacturation } from './ValidationHttpPaiementsFacturation';

function lireNombreOptionnel(source: Record<string, unknown>, nomChamp: string): number | undefined {
  const valeur = source[nomChamp];
  if (valeur === undefined || valeur === null) {
    return undefined;
  }

  if (typeof valeur !== 'number' || !Number.isInteger(valeur)) {
    throw new Error(`Le champ "${nomChamp}" doit etre un entier.`);
  }

  return valeur;
}

export class ExonerationValidator {
  public static validerAccorder(corps: unknown, headers: unknown): AccorderExonerationInput {
    const donnees = ValidationHttpPaiementsFacturation.obtenirObjet(corps, 'body');

    return {
      idOrganisation: ParamValidator.lireIdentifiantOrganisation(donnees, headers),
      idEcole: ParamValidator.lireIdentifiantEcole(donnees, headers),
      idUtilisateur: ParamValidator.lireIdentifiantUtilisateur(donnees, headers, 'idUtilisateur'),
      idEleve: ValidationHttpPaiementsFacturation.lireChaineRequise(donnees, 'idEleve'),
      idObligation: ValidationHttpPaiementsFacturation.lireChaineRequise(donnees, 'idObligation'),
      roleActif: ValidationHttpPaiementsFacturation.lireHeaderChaine(headers, 'x-role-actif'),
      typeExoneration: ValidationHttpPaiementsFacturation.lireEnumRequis(
        donnees,
        'typeExoneration',
        TypeExoneration,
      ),
      montantExonere: donnees.montantExonere === undefined
        ? undefined
        : ValidationHttpPaiementsFacturation.lireMontantRequis(donnees, 'montantExonere'),
      pourcentage: lireNombreOptionnel(donnees, 'pourcentage'),
      raison: ValidationHttpPaiementsFacturation.lireChaineRequise(donnees, 'raison'),
      validePar: ParamValidator.lireIdentifiantUtilisateur(donnees, headers, 'validePar'),
    };
  }

  public static validerAnnuler(
    parametres: unknown,
    corps: unknown,
    headers: unknown,
  ): AnnulerExonerationInput {
    const donneesParams = ValidationHttpPaiementsFacturation.obtenirObjet(parametres, 'params');
    const donneesCorps = ValidationHttpPaiementsFacturation.obtenirObjet(corps, 'body');

    return {
      idOrganisation: ParamValidator.lireIdentifiantOrganisation(donneesCorps, headers),
      idEcole: ParamValidator.lireIdentifiantEcole(donneesCorps, headers),
      idUtilisateur: ParamValidator.lireIdentifiantUtilisateur(donneesCorps, headers, 'idUtilisateur'),
      roleActif: ValidationHttpPaiementsFacturation.lireHeaderChaine(headers, 'x-role-actif'),
      idExoneration: ValidationHttpPaiementsFacturation.lireChaineRequise(
        donneesParams,
        'idExoneration',
      ),
    };
  }
}
