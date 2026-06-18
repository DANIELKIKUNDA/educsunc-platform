import type { ConfigurationSecurityEvenement } from '../ConfigurationSecurityIntegrationTypes';
import { ConfigurationSecurityForensicBridge } from '../forensic/ConfigurationSecurityForensicBridge';
import { ConfigurationSecurityEventMapper } from '../mappers/ConfigurationSecurityEventMapper';
import { ConfigurationSecurityPolicyBridge } from '../policies/ConfigurationSecurityPolicyBridge';

// Ce fichier declare le listener Security.

export class ConfigurationSecurityEventListener {
  constructor(
    private readonly policy = new ConfigurationSecurityPolicyBridge(),
    private readonly forensic = new ConfigurationSecurityForensicBridge(),
  ) {}

  public async consommer(evenement: ConfigurationSecurityEvenement): Promise<void> {
    const decision = this.policy.evaluer(evenement);
    if (!decision.autorise || decision.niveau !== 'INFO') {
      this.forensic.enregistrer(ConfigurationSecurityEventMapper.versIncident(evenement, decision));
    }
  }

  public traces(): ConfigurationSecurityForensicBridge {
    return this.forensic;
  }
}
