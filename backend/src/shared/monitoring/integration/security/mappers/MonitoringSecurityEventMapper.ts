import type { MonitoringSecurityEvenement } from '../MonitoringSecurityIntegrationTypes';

// Ce fichier declare le mapper d evenements Security vers Monitoring.

export class MonitoringSecurityEventMapper {
  public static versSignal(evenement: MonitoringSecurityEvenement): {
    readonly type: string;
    readonly nom: string;
    readonly valeur: number;
  } {
    return {
      type: 'security-event',
      nom: evenement.type,
      valeur: evenement.gravite === 'CRITICAL' ? 100 : evenement.gravite === 'HIGH' ? 75 : 25,
    };
  }
}
