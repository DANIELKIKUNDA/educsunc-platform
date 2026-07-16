import { SessionApplicationService } from '../../application/services/SessionApplicationService';
import type { SessionOutput } from '../../application/dto/output';

// Ce middleware technique verifie qu'une session AUTH reste active.
export class SessionValidationMiddleware {
  constructor(private readonly sessionApplicationService: SessionApplicationService) {}

  public async verifier(idSessionUtilisateur: string): Promise<SessionOutput> {
    return this.sessionApplicationService.obtenirSessionActive(idSessionUtilisateur);
  }
}
