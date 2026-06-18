import type { ConfigurationAuthContexteActif, ConfigurationAuthEvenement, ConfigurationAuthSnapshot } from '../ConfigurationAuthIntegrationTypes';
import { ConfigurationAuthContextMapper } from '../mappers/ConfigurationAuthContextMapper';

// Ce fichier declare le bridge de sessions Auth.

export class ConfigurationAuthSessionBridge {
  private readonly contextes = new Map<string, ConfigurationAuthContexteActif>();
  private readonly permissions = new Map<string, readonly string[]>();

  public synchroniserEvenement(evenement: ConfigurationAuthEvenement): void {
    this.contextes.set(evenement.utilisateurId, ConfigurationAuthContextMapper.depuisEvenement(evenement));
    if (evenement.actionsAutorisees) {
      this.permissions.set(evenement.utilisateurId, [...evenement.actionsAutorisees]);
    }
  }

  public rechercher(params: { readonly utilisateurId?: string; readonly sessionId?: string }): ConfigurationAuthContexteActif | null {
    if (params.utilisateurId) {
      return this.contextes.get(params.utilisateurId) ?? null;
    }
    if (params.sessionId) {
      return [...this.contextes.values()].find((contexte) => contexte.sessionId === params.sessionId) ?? null;
    }
    return null;
  }

  public estAutorise(utilisateurId: string | undefined, action: string): boolean {
    if (!utilisateurId) {
      return false;
    }
    return (this.permissions.get(utilisateurId) ?? []).includes(action);
  }

  public snapshot(): ConfigurationAuthSnapshot {
    return {
      totalContextes: this.contextes.size,
      contextes: [...this.contextes.values()],
    };
  }
}
