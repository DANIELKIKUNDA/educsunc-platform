import type { RefreshTokenInput } from 'shared/auth/application/dto/input';
import { ValidationError } from 'shared/exceptions/ValidationError';
import { ValidationHttpAuth } from './ValidationHttpAuth';

// Ce validateur lit un refresh token depuis le corps ou les cookies HTTP.
export class RefreshTokenValidator {
  // Cette methode garantit qu'un refresh token est bien present.
  public static valider(corps: unknown, cookies: unknown): RefreshTokenInput {
    const donnees = typeof corps === 'object' && corps !== null ? (corps as Record<string, unknown>) : {};
    const refreshToken =
      ValidationHttpAuth.lireChaineOptionnelle(donnees, 'refreshToken')
      ?? ValidationHttpAuth.lireCookieChaine(cookies, 'refresh_token');

    if (!refreshToken) {
      throw new ValidationError('Le refresh token est obligatoire.');
    }

    return { refreshToken };
  }
}
