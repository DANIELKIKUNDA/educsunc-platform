import type { ConfigurationBulletinsEvenement } from '../ConfigurationBulletinsIntegrationTypes';

export class ConfigurationBulletinsAntiCorruptionLayer {
  public normaliser(payload: Readonly<Record<string, unknown>>): ConfigurationBulletinsEvenement {
    const contexte = payload.contexte as ConfigurationBulletinsEvenement['contexte'];
    return {
      type: (payload.type as ConfigurationBulletinsEvenement['type']) ?? 'REGLE_EVALUATION_CHANGE',
      contexte,
      bulletinId: String(payload.bulletinId ?? contexte.configurationId),
      metadata: { ...payload },
    };
  }
}
