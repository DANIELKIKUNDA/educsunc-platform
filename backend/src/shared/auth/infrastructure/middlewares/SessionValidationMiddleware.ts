import { SessionApplicationService } from '../../application/services/SessionApplicationService';

// Ce middleware technique verifie qu'une session AUTH reste active.
export class SessionValidationMiddleware {
  constructor(private readonly sessionApplicationService: SessionApplicationService) {}

  public async verifier(idSessionUtilisateur: string): Promise<void> {
    await this.sessionApplicationService.obtenirSessionActive(idSessionUtilisateur);
  }
}
