import { AuthenticationMiddleware as InfrastructureAuthenticationMiddleware } from 'shared/auth/infrastructure/middlewares/AuthenticationMiddleware';

// Ce middleware HTTP adapte le validateur JWT technique a la couche interface.
export class JwtAuthenticationMiddleware {
  constructor(private readonly authenticationMiddleware: InfrastructureAuthenticationMiddleware) {}

  // Cette methode authentifie une requete et retourne la charge utile du JWT.
  public async authentifier(headers: unknown): Promise<Record<string, unknown> | null> {
    if (typeof headers !== 'object' || headers === null) {
      return null;
    }

    const dictionnaire = headers as Record<string, unknown>;
    const authorizationHeader =
      typeof dictionnaire.authorization === 'string'
        ? dictionnaire.authorization
        : typeof dictionnaire.Authorization === 'string'
          ? dictionnaire.Authorization
          : undefined;

    return this.authenticationMiddleware.authentifier(authorizationHeader);
  }
}
