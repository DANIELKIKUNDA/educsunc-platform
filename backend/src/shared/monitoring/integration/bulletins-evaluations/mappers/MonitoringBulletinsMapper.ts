import type { MonitoringBulletinsEvenement } from '../MonitoringBulletinsIntegrationTypes';

// Ce fichier declare le mapper Bulletins vers Monitoring.

export class MonitoringBulletinsMapper {
  public static versProjection(evenement: MonitoringBulletinsEvenement): {
    readonly type: string;
    readonly cible: string;
  } {
    return {
      type: evenement.type,
      cible: evenement.bulletinId ?? 'bulletins-global',
    };
  }
}
