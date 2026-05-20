import type { LogoutUseCase } from 'shared/auth/application/use-cases/LogoutUseCase';
import { ValidationHttpAuth } from '../validators/ValidationHttpAuth';

// Ce controleur ferme une session AUTH et prepare la suppression des cookies.
export class LogoutController {
  constructor(private readonly logoutUseCase: LogoutUseCase) {}

  // Cette methode revoque la session transmise par le client.
  public async logout(corps: unknown, headers: unknown): Promise<{ donnee: { succes: boolean } }> {
    const sessionId =
      ValidationHttpAuth.lireHeaderChaine(headers, 'x-session-id')
      ?? (typeof corps === 'object' && corps !== null
        ? ValidationHttpAuth.lireChaineOptionnelle(corps as Record<string, unknown>, 'sessionId')
        : undefined);

    if (!sessionId) {
      throw new Error("L'identifiant de session est obligatoire.");
    }

    await this.logoutUseCase.executer({ sessionId });
    return { donnee: { succes: true } };
  }
}
