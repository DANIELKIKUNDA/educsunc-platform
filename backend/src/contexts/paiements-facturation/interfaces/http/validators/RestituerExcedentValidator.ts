import type { RestituerExcedentInput } from '../../../application/dto/input/AnnulationsEntreeDTO';
import { ParamValidator } from './ParamValidator';
import { ValidationHttpPaiementsFacturation } from './ValidationHttpPaiementsFacturation';

// Ce validator prepare la restitution applicative avec contexte de securite complet.
export class RestituerExcedentValidator {
  // Cette methode transforme le corps HTTP en DTO applicatif de restitution.
  public static valider(corps: unknown, headers: unknown): RestituerExcedentInput {
    const donnees = ValidationHttpPaiementsFacturation.obtenirObjet(corps, 'body');

    return {
      idOrganisation: ParamValidator.lireIdentifiantOrganisation(donnees, headers),
      idPaiement: ValidationHttpPaiementsFacturation.lireChaineRequise(donnees, 'idPaiement'),
      idEcole: ParamValidator.lireIdentifiantEcole(donnees, headers),
      idUtilisateur: ParamValidator.lireIdentifiantUtilisateur(donnees, headers, 'idUtilisateur'),
      idEleve: ValidationHttpPaiementsFacturation.lireChaineRequise(donnees, 'idEleve'),
      effectuePar: ParamValidator.lireIdentifiantUtilisateur(donnees, headers, 'effectuePar'),
    };
  }
}
