import { UseCase } from '../../../application/UseCase';
import { LogoutInput } from '../dto/input';
import { AuthApplicationService } from '../services/AuthApplicationService';

// Ce cas d'usage ferme une session et revoque les jetons associes.
export class LogoutUseCase implements UseCase<LogoutInput, void> {
  constructor(private readonly authApplicationService: AuthApplicationService) {}

  public async executer(entree: LogoutInput): Promise<void> {
    await this.authApplicationService.logout(entree.sessionId);
  }
}
