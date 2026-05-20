import { ContexteActifReadModel, ObtenirContexteActifQuery } from '../../../../application';
import { PostgresContexteActifAuthRepository } from '../repositories/PostgresContexteActifAuthRepository';

// Cette query fournit une lecture optimisee du contexte actif AUTH.
export class ObtenirContexteActifSQL implements ObtenirContexteActifQuery {
  constructor(private readonly repository: PostgresContexteActifAuthRepository) {}

  public async executer(idUtilisateur: string): Promise<ContexteActifReadModel | null> {
    const contexte = await this.repository.trouverContexteUtilisateur(idUtilisateur);
    if (!contexte) {
      return null;
    }

    return {
      organisationActiveId: contexte.obtenirOrganisationActiveId(),
      ecoleActiveId: contexte.obtenirEcoleActiveId(),
    };
  }
}
