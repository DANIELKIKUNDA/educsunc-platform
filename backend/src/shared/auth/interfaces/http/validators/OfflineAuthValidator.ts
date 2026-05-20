import type { AuthOfflineInput } from 'shared/auth/application/dto/input';
import { ValidationHttpAuth } from './ValidationHttpAuth';

// Ce validateur prepare une requete de synchronisation ou reprise offline.
export class OfflineAuthValidator {
  // Cette methode verifie la presence d'un utilisateur et d'un appareil valides.
  public static valider(corps: unknown, headers: unknown): AuthOfflineInput {
    const donnees = ValidationHttpAuth.obtenirObjet(corps, 'body');

    return {
      utilisateurId:
        ValidationHttpAuth.lireChaineOptionnelle(donnees, 'utilisateurId')
        ?? ValidationHttpAuth.lireHeaderChaine(headers, 'x-user-id')
        ?? ValidationHttpAuth.lireChaineRequise(donnees, 'utilisateurId'),
      deviceId:
        ValidationHttpAuth.lireChaineOptionnelle(donnees, 'deviceId')
        ?? ValidationHttpAuth.lireHeaderChaine(headers, 'x-device-id')
        ?? ValidationHttpAuth.lireChaineRequise(donnees, 'deviceId'),
    };
  }
}
