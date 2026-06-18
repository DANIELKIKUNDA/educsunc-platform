import type { ConfigurationSecurityDecision, ConfigurationSecurityEvenement } from '../ConfigurationSecurityIntegrationTypes';

// Ce fichier declare le bridge de politique Security.

export class ConfigurationSecurityPolicyBridge {
  public evaluer(evenement: ConfigurationSecurityEvenement): ConfigurationSecurityDecision {
    if (!evenement.contexte.actorId) {
      return {
        autorise: false,
        raison: 'Un changement de configuration exige un actorId.',
        niveau: 'BLOCK',
      };
    }

    return {
      autorise: true,
      niveau: 'INFO',
      raison: 'Contexte securise suffisant.',
    };
  }
}
