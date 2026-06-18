import type { ConfigurationContext } from '../../../context';
import type {
  ConfigurationAuthContexteActif,
  ConfigurationAuthDemandeAutorisation,
  ConfigurationAuthEvenement,
  ConfigurationAuthPreferenceProjection,
  ConfigurationAuthSnapshot,
} from '../ConfigurationAuthIntegrationTypes';
import { ConfigurationAuthContextMapper } from '../mappers/ConfigurationAuthContextMapper';
import { ConfigurationAuthSessionBridge } from '../sessions/ConfigurationAuthSessionBridge';

// Ce fichier orchestre le pont Auth vers Configuration.

export class ConfigurationAuthIntegrationOrchestrator {
  public readonly sessions = new ConfigurationAuthSessionBridge();

  public async synchroniserEvenement(evenement: ConfigurationAuthEvenement): Promise<void> {
    this.sessions.synchroniserEvenement(evenement);
  }

  public async autoriser(demande: ConfigurationAuthDemandeAutorisation): Promise<boolean> {
    const contexte = this.sessions.rechercher({
      utilisateurId: demande.utilisateurId,
    });
    if (!contexte) {
      return false;
    }
    if (contexte.estSuperAdmin) {
      return true;
    }
    return this.sessions.estAutorise(demande.utilisateurId, demande.action);
  }

  public async resoudreContexte(
    contexte: ConfigurationContext,
    params: { readonly utilisateurId?: string; readonly sessionId?: string },
  ): Promise<ConfigurationContext> {
    return ConfigurationAuthContextMapper.versContexteConfiguration(
      contexte,
      this.sessions.rechercher(params),
    );
  }

  public async rechercherContexte(params: {
    readonly utilisateurId?: string;
    readonly sessionId?: string;
  }): Promise<ConfigurationAuthContexteActif | null> {
    return this.sessions.rechercher(params);
  }

  public async construireProjectionPreferences(
    configurationContext: ConfigurationContext,
  ): Promise<ConfigurationAuthPreferenceProjection> {
    return {
      utilisateurId: configurationContext.actorId,
      sessionId: configurationContext.sessionId,
      configurationContext,
    };
  }

  public snapshot(): ConfigurationAuthSnapshot {
    return this.sessions.snapshot();
  }
}
