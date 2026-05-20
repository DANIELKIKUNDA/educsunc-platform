import type { ContexteActifUtilisateur } from '../../../security/domain';
import type { ContexteActifOutput } from '../dto/output';
export class ContexteActifMapper {
  public static depuisDomaine(contexte: ContexteActifUtilisateur): ContexteActifOutput {
    return {
      idOrganisationActive: contexte.obtenirIdOrganisationActive(),
      idEcoleActive: contexte.obtenirIdEcoleActive(),
    };
  }
}
