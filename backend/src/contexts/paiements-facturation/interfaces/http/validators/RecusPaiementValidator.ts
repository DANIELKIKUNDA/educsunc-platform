import type { ConsulterRecusPaiementInput } from '../../../application/dto/input/RecusEntreeDTO';
import { ParamValidator } from './ParamValidator';
import { ValidationHttpPaiementsFacturation } from './ValidationHttpPaiementsFacturation';

export class RecusPaiementValidator {
  public static validerConsultation(
    query: unknown,
    headers: unknown,
  ): ConsulterRecusPaiementInput {
    const donnees = ValidationHttpPaiementsFacturation.obtenirObjet(query, 'query');

    return {
      idOrganisation: ParamValidator.lireIdentifiantOrganisation(donnees, headers),
      idEcole: ParamValidator.lireIdentifiantEcole(donnees, headers),
      idUtilisateur: ParamValidator.lireIdentifiantUtilisateur(donnees, headers, 'idUtilisateur'),
      idEleve: ValidationHttpPaiementsFacturation.lireChaineOptionnelle(donnees, 'idEleve'),
      numeroRecu: ValidationHttpPaiementsFacturation.lireChaineOptionnelle(donnees, 'numeroRecu'),
      dateDebut: ValidationHttpPaiementsFacturation.lireChaineOptionnelle(donnees, 'dateDebut'),
      dateFin: ValidationHttpPaiementsFacturation.lireChaineOptionnelle(donnees, 'dateFin'),
    };
  }
}
