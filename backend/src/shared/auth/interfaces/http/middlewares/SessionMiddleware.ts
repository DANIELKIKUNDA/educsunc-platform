import { SessionValidationMiddleware as InfrastructureSessionValidationMiddleware } from 'shared/auth/infrastructure/middlewares/SessionValidationMiddleware';
import { ValidationError } from 'shared/exceptions/ValidationError';

// Ce middleware HTTP s'assure qu'une session transmise par le client reste valide.
export class SessionMiddleware {
  constructor(private readonly sessionValidationMiddleware: InfrastructureSessionValidationMiddleware) {}

  // Cette methode impose la presence d'un identifiant de session actif.
  public async verifierSession(headers: unknown, corps?: unknown): Promise<string> {
    const sessionId = this.extraireSessionId(headers, corps);
    if (!sessionId) {
      throw new ValidationError("L'identifiant de session est obligatoire.");
    }

    await this.sessionValidationMiddleware.verifier(sessionId);
    return sessionId;
  }

  // Cette methode retrouve l'identifiant de session depuis les headers ou le body.
  private extraireSessionId(headers: unknown, corps?: unknown): string | undefined {
    if (typeof headers === 'object' && headers !== null) {
      const dictionnaire = headers as Record<string, unknown>;
      const valeur = dictionnaire['x-session-id'];
      if (typeof valeur === 'string' && valeur.trim() !== '') {
        return valeur.trim();
      }
    }

    if (typeof corps === 'object' && corps !== null) {
      const dictionnaire = corps as Record<string, unknown>;
      const valeur = dictionnaire.sessionId;
      if (typeof valeur === 'string' && valeur.trim() !== '') {
        return valeur.trim();
      }
    }

    return undefined;
  }
}
