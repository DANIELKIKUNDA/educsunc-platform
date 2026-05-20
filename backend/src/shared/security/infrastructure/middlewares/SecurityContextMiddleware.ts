import type { SessionContextPort } from '../../application';

// Ce middleware injecte le contexte actif utilisateur pour les etapes HTTP suivantes.
export class SecurityContextMiddleware {
  constructor(private readonly sessionContextPort: SessionContextPort) {}

  public async enrichir(requete: Record<string, unknown>): Promise<Record<string, unknown>> {
    const utilisateur = await this.sessionContextPort.obtenirUtilisateurAuthentifie();
    return {
      ...requete,
      securityContext: utilisateur,
    };
  }
}
