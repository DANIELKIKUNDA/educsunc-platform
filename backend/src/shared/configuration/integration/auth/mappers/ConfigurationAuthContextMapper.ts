import type { ConfigurationContext } from '../../../context';
import type {
  ConfigurationAuthContexteActif,
  ConfigurationAuthEvenement,
} from '../ConfigurationAuthIntegrationTypes';

// Ce fichier declare le mapper de contexte Auth vers Configuration.

export class ConfigurationAuthContextMapper {
  public static depuisEvenement(evenement: ConfigurationAuthEvenement): ConfigurationAuthContexteActif {
    return {
      utilisateurId: evenement.utilisateurId,
      acteurId: evenement.utilisateurId,
      sessionId: evenement.sessionId,
      organisationId: evenement.organisationId,
      ecoleId: evenement.ecoleId,
      estSuperAdmin: evenement.estSuperAdmin ?? false,
    };
  }

  public static versContexteConfiguration(
    contexte: ConfigurationContext,
    auth: ConfigurationAuthContexteActif | null,
  ): ConfigurationContext {
    if (!auth) {
      return contexte;
    }

    return {
      ...contexte,
      organisationId: contexte.organisationId ?? auth.organisationId,
      ecoleId: contexte.ecoleId ?? auth.ecoleId,
      actorId: contexte.actorId ?? auth.acteurId,
      sessionId: contexte.sessionId ?? auth.sessionId,
    };
  }
}
