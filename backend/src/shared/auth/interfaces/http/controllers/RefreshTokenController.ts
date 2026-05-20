import type { RefreshTokenUseCase } from 'shared/auth/application/use-cases/RefreshTokenUseCase';
import { LoginPresenter } from '../presenters/LoginPresenter';
import { RefreshTokenValidator } from '../validators/RefreshTokenValidator';

// Ce controleur renouvelle un JWT et fait tourner le refresh token.
export class RefreshTokenController {
  constructor(private readonly refreshTokenUseCase: RefreshTokenUseCase) {}

  // Cette methode lit le refresh token et lance sa rotation.
  public async rafraichir(corps: unknown, cookies: unknown): Promise<{ donnee: unknown }> {
    const entree = RefreshTokenValidator.valider(corps, cookies);
    const sortie = await this.refreshTokenUseCase.executer(entree);

    return LoginPresenter.presenter({
      ...sortie,
      sessionId: '',
      utilisateur: {
        idUtilisateur: '',
        nomComplet: '',
        email: '',
        etatCompte: '',
      },
    });
  }
}
