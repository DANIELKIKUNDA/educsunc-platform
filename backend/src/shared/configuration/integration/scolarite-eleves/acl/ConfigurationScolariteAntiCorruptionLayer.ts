import type { ConfigurationScolariteEvenement } from '../ConfigurationScolariteIntegrationTypes';

export class ConfigurationScolariteAntiCorruptionLayer {
  public normaliser(payload: Readonly<Record<string, unknown>>): ConfigurationScolariteEvenement {
    const contexte = payload.contexte as ConfigurationScolariteEvenement['contexte'];
    return {
      type: (payload.type as ConfigurationScolariteEvenement['type']) ?? 'AFFECTATION_CLASSE',
      contexte,
      eleveId: String(payload.eleveId ?? contexte.configurationId),
      metadata: { ...payload },
    };
  }
}
