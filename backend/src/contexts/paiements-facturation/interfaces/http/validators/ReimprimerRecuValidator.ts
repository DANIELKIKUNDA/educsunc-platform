import type { ReimprimerRecuInput } from '../../../application/dto/input/RecusEntreeDTO';
import { ParamValidator } from './ParamValidator';
import { ValidationHttpPaiementsFacturation } from './ValidationHttpPaiementsFacturation';

export class ReimprimerRecuValidator {
  public static valider(parametres: unknown, headers: unknown): ReimprimerRecuInput {
    const donnees = ValidationHttpPaiementsFacturation.obtenirObjet(parametres, 'params');

    return {
      idOrganisation: ParamValidator.lireIdentifiantOrganisation(donnees, headers),
      idEcole: ParamValidator.lireIdentifiantEcole(donnees, headers),
      idUtilisateur: ParamValidator.lireIdentifiantUtilisateur(donnees, headers, 'idUtilisateur'),
      idRecu: ValidationHttpPaiementsFacturation.lireChaineRequise(donnees, 'idRecu'),
    };
  }
}
