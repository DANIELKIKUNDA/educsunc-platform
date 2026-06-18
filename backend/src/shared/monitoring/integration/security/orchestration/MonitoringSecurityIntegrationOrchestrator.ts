import type { MonitoringSecurityDecision, MonitoringSecurityEvenement } from '../MonitoringSecurityIntegrationTypes';
import { MonitoringSecurityForensicBridge } from '../forensic/MonitoringSecurityForensicBridge';

// Ce fichier orchestre le pont Security vers Monitoring.

export class MonitoringSecurityIntegrationOrchestrator {
  public readonly forensic = new MonitoringSecurityForensicBridge();

  public async synchroniserEvenement(evenement: MonitoringSecurityEvenement): Promise<void> {
    this.forensic.enregistrer(evenement);
  }

  public async evaluer(type: string): Promise<MonitoringSecurityDecision> {
    const critique = this.forensic.lister().some((evenement) => evenement.type === type && evenement.gravite === 'CRITICAL');
    return critique
      ? { autorise: false, raison: 'Evenement critique deja observe' }
      : { autorise: true };
  }
}
