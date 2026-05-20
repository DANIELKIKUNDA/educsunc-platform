import { UseCase } from '../../../application/UseCase';
import { AuthOfflineInput } from '../dto/input';
import { AuthApplicationService } from '../services/AuthApplicationService';

// Ce cas d'usage prepare l'authentification offline et sa synchronisation future.
export class AuthentificationOfflineUseCase implements UseCase<AuthOfflineInput, void> {
  constructor(private readonly authApplicationService: AuthApplicationService) {}

  public async executer(entree: AuthOfflineInput): Promise<void> {
    await this.authApplicationService.authentifierOffline(entree.utilisateurId, entree.deviceId);
  }
}
