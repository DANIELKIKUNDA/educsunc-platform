import type { ChangerEcoleActiveInput } from 'shared/auth/application/dto/input';
import { ValidationHttpAuth } from './ValidationHttpAuth';

// Ce validateur controle la demande de changement d'ecole active.
export class ChangerEcoleActiveValidator {
  // Cette methode lit la session courante et l'ecole cible depuis HTTP.
  public static valider(corps: unknown, headers: unknown): ChangerEcoleActiveInput {
    const donnees = ValidationHttpAuth.obtenirObjet(corps, 'body');

    return {
      sessionId:
        ValidationHttpAuth.lireHeaderChaine(headers, 'x-session-id')
        ?? ValidationHttpAuth.lireChaineRequise(donnees, 'sessionId'),
      ecoleActiveId: ValidationHttpAuth.lireChaineRequise(donnees, 'ecoleActiveId'),
    };
  }
}
