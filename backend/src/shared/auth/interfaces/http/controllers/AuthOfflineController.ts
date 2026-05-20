import type { AuthentificationOfflineUseCase } from 'shared/auth/application/use-cases/AuthentificationOfflineUseCase';
import { OfflineAuthValidator } from '../validators/OfflineAuthValidator';

// Ce controleur prepare la synchronisation et la reprise d'authentification offline.
export class AuthOfflineController {
  constructor(private readonly authentificationOfflineUseCase: AuthentificationOfflineUseCase) {}

  // Cette methode valide la demande offline puis lance le cas d'usage.
  public async synchroniser(corps: unknown, headers: unknown): Promise<{ donnee: { succes: boolean } }> {
    const entree = OfflineAuthValidator.valider(corps, headers);
    await this.authentificationOfflineUseCase.executer(entree);
    return { donnee: { succes: true } };
  }
}
