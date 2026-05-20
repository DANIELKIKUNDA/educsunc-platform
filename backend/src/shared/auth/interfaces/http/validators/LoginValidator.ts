import type { LoginInput } from 'shared/auth/application/dto/input';
import { ValidationHttpAuth } from './ValidationHttpAuth';

// Ce validateur transforme une requete de login HTTP en entree applicative fiable.
export class LoginValidator {
  // Cette methode controle les champs minimaux attendus par le login AUTH.
  public static valider(corps: unknown, headers: unknown): LoginInput {
    const donnees = ValidationHttpAuth.obtenirObjet(corps, 'body');

    return {
      email: ValidationHttpAuth.lireEmailRequis(donnees, 'email'),
      motDePasse: ValidationHttpAuth.lireChaineRequise(donnees, 'motDePasse'),
      organisationActiveId: ValidationHttpAuth.lireChaineOptionnelle(donnees, 'organisationActiveId'),
      ecoleActiveId: ValidationHttpAuth.lireChaineOptionnelle(donnees, 'ecoleActiveId'),
      deviceId: ValidationHttpAuth.lireChaineOptionnelle(donnees, 'deviceId')
        ?? ValidationHttpAuth.lireHeaderChaine(headers, 'x-device-id'),
      userAgent: ValidationHttpAuth.lireHeaderChaine(headers, 'user-agent'),
      adresseIp: ValidationHttpAuth.lireHeaderChaine(headers, 'x-forwarded-for')
        ?? ValidationHttpAuth.lireHeaderChaine(headers, 'x-real-ip'),
      modeOffline: ValidationHttpAuth.lireBooleenOptionnel(donnees, 'modeOffline'),
    };
  }
}
