import type { ConfigurationAuthContexteActif, ConfigurationAuthDemandeAutorisation } from '../ConfigurationAuthIntegrationTypes';

// Ce fichier declare le port local de politique Auth.

export interface ConfigurationAuthPolicyPort {
  autoriser(demande: ConfigurationAuthDemandeAutorisation): Promise<boolean>;
  resoudreContexte(params: { readonly utilisateurId?: string; readonly sessionId?: string }): Promise<ConfigurationAuthContexteActif | null>;
}
