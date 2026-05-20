import type { FastifyReply } from 'fastify';

// Ce helper construit le cookie de refresh token et sa rotation.
export class RefreshTokenCookie {
  public static readonly NOM = 'refresh_token';

  // Cette methode attache le refresh token a la reponse HTTP.
  public static appliquer(reponse: FastifyReply, token: string): void {
    reponse.header('set-cookie', this.serialiser(token, 30 * 24 * 60 * 60));
  }

  // Cette methode force la suppression du refresh token client.
  public static supprimer(reponse: FastifyReply): void {
    reponse.header('set-cookie', this.serialiser('', 0));
  }

  // Cette methode produit la representation texte finale du cookie.
  private static serialiser(valeur: string, maxAgeSecondes: number): string {
    return `${this.NOM}=${encodeURIComponent(valeur)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAgeSecondes}; Secure`;
  }
}
