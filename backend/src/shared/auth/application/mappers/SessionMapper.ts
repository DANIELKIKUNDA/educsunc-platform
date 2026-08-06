import { SessionUtilisateur } from '../../domain';
import { SessionOutput } from '../dto/output';
import { SessionUtilisateurReadModel } from '../read-models';

// Ce mapper transforme une session domaine ou de lecture vers un DTO applicatif.
export class SessionMapper {
  public static depuisDomaine(session: SessionUtilisateur): SessionOutput {
    return {
      sessionId: session.obtenirId(),
      utilisateurId: session.obtenirIdUtilisateur(),
      roleActif: session.obtenirRoleActif(),
      organisationActiveId: session.obtenirOrganisationActiveId(),
      ecoleActiveId: session.obtenirEcoleActiveId(),
      estOffline: session.obtenirEstOffline(),
    };
  }

  public static depuisLecture(session: SessionUtilisateurReadModel): SessionOutput {
    return {
      sessionId: session.sessionId,
      utilisateurId: session.utilisateurId,
      roleActif: session.roleActif,
      organisationActiveId: session.organisationActiveId,
      ecoleActiveId: session.ecoleActiveId,
      estOffline: session.estOffline,
    };
  }
}
