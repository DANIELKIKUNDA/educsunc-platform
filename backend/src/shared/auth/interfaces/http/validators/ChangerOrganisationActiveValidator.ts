import type { ChangerOrganisationActiveInput } from 'shared/auth/application/dto/input';
import { ValidationHttpAuth } from './ValidationHttpAuth';

// Ce validateur controle la demande de changement d'organisation active.
export class ChangerOrganisationActiveValidator {
  // Cette methode lit la session courante et l'organisation cible depuis HTTP.
  public static valider(corps: unknown, headers: unknown): ChangerOrganisationActiveInput {
    const donnees = ValidationHttpAuth.obtenirObjet(corps, 'body');

    return {
      sessionId:
        ValidationHttpAuth.lireHeaderChaine(headers, 'x-session-id')
        ?? ValidationHttpAuth.lireChaineRequise(donnees, 'sessionId'),
      organisationActiveId: ValidationHttpAuth.lireChaineRequise(donnees, 'organisationActiveId'),
    };
  }
}
