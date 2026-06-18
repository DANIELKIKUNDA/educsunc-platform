import type { AlertDto } from '../../application';

// Ce fichier declare le runtime de suppression logique des alertes.

export class RuntimeSuppressionAlertsMonitoring {
  public supprimer(alerte: AlertDto): AlertDto {
    return {
      ...alerte,
      statut: 'SUPPRESSED',
    };
  }
}
