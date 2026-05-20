import { ObtenirSessionActiveQuery, SessionUtilisateurReadModel } from '../../../../application';
import { PostgresSessionUtilisateurRepository } from '../repositories/PostgresSessionUtilisateurRepository';

// Cette query fournit une lecture optimisee de session active AUTH.
export class ObtenirSessionActiveSQL implements ObtenirSessionActiveQuery {
  constructor(private readonly repository: PostgresSessionUtilisateurRepository) {}

  public async executer(idSessionUtilisateur: string): Promise<SessionUtilisateurReadModel | null> {
    const session = await this.repository.trouverSessionActive(idSessionUtilisateur);
    if (!session) {
      return null;
    }

    return {
      sessionId: session.obtenirId(),
      utilisateurId: session.obtenirIdUtilisateur(),
      organisationActiveId: session.obtenirOrganisationActiveId(),
      ecoleActiveId: session.obtenirEcoleActiveId(),
      estOffline: session.obtenirEstOffline(),
    };
  }
}
