import type { ConfigurationSecurityDecision, ConfigurationSecurityEvenement, ConfigurationSecuritySnapshot } from '../ConfigurationSecurityIntegrationTypes';
import { ConfigurationSecurityEventMapper } from '../mappers/ConfigurationSecurityEventMapper';
import { ConfigurationSecurityPolicyBridge } from '../policies/ConfigurationSecurityPolicyBridge';
import { ConfigurationSecurityForensicBridge } from '../forensic/ConfigurationSecurityForensicBridge';

// Ce fichier orchestre le pont Security vers Configuration.

export class ConfigurationSecurityIntegrationOrchestrator {
  public readonly policy = new ConfigurationSecurityPolicyBridge();
  public readonly forensic = new ConfigurationSecurityForensicBridge();

  public async evaluer(evenement: ConfigurationSecurityEvenement): Promise<ConfigurationSecurityDecision> {
    const decision = this.policy.evaluer(evenement);
    if (!decision.autorise || decision.niveau !== 'INFO') {
      this.forensic.enregistrer(ConfigurationSecurityEventMapper.versIncident(evenement, decision));
    }
    return decision;
  }

  public snapshot(): ConfigurationSecuritySnapshot {
    const incidents = this.forensic.journal();
    return {
      incidents,
      totalIncidents: incidents.length,
    };
  }
}
