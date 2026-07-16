import type { FastifyReply } from 'fastify';

// Ce helper construit le cookie d'access token selon les conventions AUTH.
export class AccessTokenCookie {
  public static readonly NOM = 'access_token';

  // Cette methode attache le cookie d'access token a la reponse HTTP.
  public static appliquer(reponse: FastifyReply, token: string, maxAgeSecondes = 15 * 60): void {
    reponse.header('set-cookie', this.serialiser(token, maxAgeSecondes));
  }

  // Cette methode demande la suppression du cookie d'access token.
  public static supprimer(reponse: FastifyReply): void {
    reponse.header('set-cookie', this.serialiser('', 0));
  }

  // Cette methode serialise un cookie simple sans dependre d'un plugin externe.
  private static serialiser(valeur: string, maxAgeSecondes: number): string {
    return `${this.NOM}=${encodeURIComponent(valeur)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAgeSecondes}; Secure`;
  }
}
