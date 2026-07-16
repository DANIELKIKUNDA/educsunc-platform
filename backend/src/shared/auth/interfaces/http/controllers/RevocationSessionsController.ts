import type { RevoquerToutesSessionsUtilisateurUseCase } from 'shared/auth/application/use-cases/RevoquerToutesSessionsUtilisateurUseCase';

// Ce controleur revoque toutes les sessions d'un utilisateur AUTH.
export class RevocationSessionsController {
  constructor(
    private readonly revoquerToutesSessionsUtilisateurUseCase: RevoquerToutesSessionsUtilisateurUseCase,
  ) {}

  // Cette methode force la revocation globale des sessions utilisateur.
  public async revoquer(_headers: unknown, payloadJwt: Record<string, unknown> | null): Promise<{ donnee: { succes: boolean } }> {
    const utilisateurId = typeof payloadJwt?.sub === 'string' ? payloadJwt.sub : undefined;

    if (!utilisateurId) {
      throw new Error("L'identifiant utilisateur est obligatoire.");
    }

    await this.revoquerToutesSessionsUtilisateurUseCase.executer({ utilisateurId });
    return { donnee: { succes: true } };
  }
}
