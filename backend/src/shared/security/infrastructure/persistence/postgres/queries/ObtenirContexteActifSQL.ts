import type { ContexteActifReadModel, ObtenirContexteActifQuery } from '../../../../application';
import { obtenirMemoireSecurityStore } from '../repositories/_memoireSecurityStore';

// Cette query retourne le contexte actif connu pour un utilisateur.
export class ObtenirContexteActifSQL implements ObtenirContexteActifQuery {
  public async executer(idUtilisateur: string): Promise<ContexteActifReadModel | null> {
    const record = obtenirMemoireSecurityStore().contextesActifs.get(idUtilisateur);
    if (!record) {
      return null;
    }
    return {
      idOrganisationActive: record.id_organisation_active,
      idEcoleActive: record.id_ecole_active,
    };
  }
}
