import type { TypeTrace } from '../enums';

// Ce fichier declare la politique de retention du domaine Monitoring.

/** Cette classe represente la politique de retention des donnees. */
export class PolitiqueRetentionMonitoring {
  /** Cette methode retourne le nombre de jours de retention par type de trace. */
  public retentionJoursPourTrace(type: TypeTrace): number {
    switch (type) {
      case 'FORENSIC':
        return 180;
      case 'DIAGNOSTIC':
        return 90;
      case 'JOB':
      case 'EVENT':
        return 30;
      case 'REQUEST':
      default:
        return 15;
    }
  }
}
