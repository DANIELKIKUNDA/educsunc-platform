import type { AnnulerPaiementInput } from '../../../application/dto/input/AnnulationsEntreeDTO';
import { ParamValidator } from './ParamValidator';
import { ValidationHttpPaiementsFacturation } from './ValidationHttpPaiementsFacturation';

// Ce validator prepare l'annulation technique d'un paiement depuis la requete HTTP.
export class AnnulerPaiementValidator {
  // Cette methode construit le DTO applicatif attendu par le cas d'usage d'annulation.
  public static valider(parametres: unknown, corps: unknown, headers: unknown): AnnulerPaiementInput {
    const donneesParametres =
      ValidationHttpPaiementsFacturation.obtenirObjet(parametres, 'params');
    const donneesCorps = ValidationHttpPaiementsFacturation.obtenirObjet(corps, 'body');

    return {
      idPaiement: ValidationHttpPaiementsFacturation.lireChaineRequise(
        donneesParametres,
        'idPaiement',
      ),
      raison: ValidationHttpPaiementsFacturation.lireChaineRequise(donneesCorps, 'raison'),
      annulePar: ParamValidator.lireIdentifiantUtilisateur(
        donneesCorps,
        headers,
        'annulePar',
      ),
    };
  }
}
