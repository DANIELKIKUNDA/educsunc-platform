import type {
  ConfigurerIdentiteDocumentaireEcoleInput,
  ConfigurerSignatureDocumentaireInput,
  ConsulterAssetRecuInput,
} from '../../../application/dto/input/AssetsRecuEntreeDTO';
import { ParamValidator } from './ParamValidator';
import { ValidationHttpPaiementsFacturation } from './ValidationHttpPaiementsFacturation';

function lireAssetOptionnel(
  body: Record<string, unknown>,
  champ: string,
): { contenuBase64: string; extension: 'png' | 'jpg' | 'jpeg' | 'svg' } | undefined {
  const valeur = body[champ];
  if (valeur === undefined || valeur === null) {
    return undefined;
  }

  const objet = ValidationHttpPaiementsFacturation.obtenirObjet(valeur, champ);
  const extension = ValidationHttpPaiementsFacturation.lireChaineRequise(objet, 'extension')
    .toLowerCase();

  if (!['png', 'jpg', 'jpeg', 'svg'].includes(extension)) {
    throw new Error(`L extension ${champ} est invalide.`);
  }

  return {
    contenuBase64: ValidationHttpPaiementsFacturation.lireChaineRequise(
      objet,
      'contenuBase64',
    ),
    extension: extension as 'png' | 'jpg' | 'jpeg' | 'svg',
  };
}

export class AssetsRecusValidator {
  public static validerConsultation(
    _parametres: unknown,
    headers: unknown,
  ): ConsulterAssetRecuInput {
    return {
      idOrganisation: ParamValidator.lireIdentifiantOrganisation({}, headers),
      idEcole: ParamValidator.lireIdentifiantEcole({}, headers),
      idUtilisateur: ParamValidator.lireIdentifiantUtilisateur({}, headers, 'idUtilisateur'),
      roleActif: ValidationHttpPaiementsFacturation.lireHeaderChaine(headers, 'x-role-actif'),
    };
  }

  public static validerIdentiteEcole(
    body: unknown,
    headers: unknown,
  ): ConfigurerIdentiteDocumentaireEcoleInput {
    const donnees = ValidationHttpPaiementsFacturation.obtenirObjet(body, 'body');

    return {
      idOrganisation: ParamValidator.lireIdentifiantOrganisation(donnees, headers),
      idEcole: ParamValidator.lireIdentifiantEcole(donnees, headers),
      idUtilisateur: ParamValidator.lireIdentifiantUtilisateur(donnees, headers, 'idUtilisateur'),
      roleActif: ValidationHttpPaiementsFacturation.lireHeaderChaine(headers, 'x-role-actif'),
      logo: lireAssetOptionnel(donnees, 'logo'),
      cachet: lireAssetOptionnel(donnees, 'cachet'),
    };
  }

  public static validerSignatureUtilisateur(
    body: unknown,
    headers: unknown,
  ): ConfigurerSignatureDocumentaireInput {
    const donnees = ValidationHttpPaiementsFacturation.obtenirObjet(body, 'body');

    return {
      idOrganisation: ParamValidator.lireIdentifiantOrganisation(donnees, headers),
      idEcole: ParamValidator.lireIdentifiantEcole(donnees, headers),
      idUtilisateur: ParamValidator.lireIdentifiantUtilisateur(donnees, headers, 'idUtilisateur'),
      roleActif: ValidationHttpPaiementsFacturation.lireHeaderChaine(headers, 'x-role-actif'),
      signature: lireAssetOptionnel(donnees, 'signature'),
    };
  }
}
