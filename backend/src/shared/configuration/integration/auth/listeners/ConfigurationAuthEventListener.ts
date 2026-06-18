import type { ConfigurationAuthEvenement } from '../ConfigurationAuthIntegrationTypes';
import { ConfigurationAuthSessionBridge } from '../sessions/ConfigurationAuthSessionBridge';

// Ce fichier declare le listener d evenements Auth.

export class ConfigurationAuthEventListener {
  constructor(private readonly sessions = new ConfigurationAuthSessionBridge()) {}

  public async consommer(evenement: ConfigurationAuthEvenement): Promise<void> {
    this.sessions.synchroniserEvenement(evenement);
  }

  public pont(): ConfigurationAuthSessionBridge {
    return this.sessions;
  }
}
