import type { ObtenirContexteActifUseCase } from 'shared/auth/application/use-cases/ObtenirContexteActifUseCase';
import { SessionApplicationService } from 'shared/auth/application/services/SessionApplicationService';
import { ContexteActifPresenter } from '../presenters/ContexteActifPresenter';
import { SessionPresenter } from '../presenters/SessionPresenter';
import { ValidationHttpAuth } from '../validators/ValidationHttpAuth';

// Ce controleur expose la session active et le contexte actif du client.
export class SessionUtilisateurController {
  constructor(
    private readonly sessionApplicationService: SessionApplicationService,
    private readonly obtenirContexteActifUseCase: ObtenirContexteActifUseCase,
  ) {}

  // Cette methode retourne la session active courante.
  public async obtenirSession(headers: unknown): Promise<{ donnee: unknown }> {
    const sessionId = ValidationHttpAuth.lireHeaderChaine(headers, 'x-session-id');
    if (!sessionId) {
      throw new Error("L'identifiant de session est obligatoire.");
    }

    const sortie = await this.sessionApplicationService.obtenirSessionActive(sessionId);
    return SessionPresenter.presenter(sortie);
  }

  // Cette methode retourne le contexte actif du client authentifie.
  public async obtenirContexte(headers: unknown, payloadJwt: Record<string, unknown> | null): Promise<{ donnee: unknown }> {
    const utilisateurId =
      typeof payloadJwt?.sub === 'string'
        ? payloadJwt.sub
        : ValidationHttpAuth.lireHeaderChaine(headers, 'x-user-id');

    if (!utilisateurId) {
      throw new Error("L'identifiant utilisateur est obligatoire.");
    }

    const sortie = await this.obtenirContexteActifUseCase.executer({ utilisateurId });
    return ContexteActifPresenter.presenter(sortie);
  }
}
