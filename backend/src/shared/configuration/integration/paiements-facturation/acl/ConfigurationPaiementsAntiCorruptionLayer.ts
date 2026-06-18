import type { ConfigurationPaiementsEvenement } from '../ConfigurationPaiementsIntegrationTypes';

export class ConfigurationPaiementsAntiCorruptionLayer {
  public normaliser(payload: Readonly<Record<string, unknown>>): ConfigurationPaiementsEvenement {
    const contexte = payload.contexte as ConfigurationPaiementsEvenement['contexte'];
    return {
      type: (payload.type as ConfigurationPaiementsEvenement['type']) ?? 'PLAN_FACTURATION_CHANGE',
      contexte,
      compteFacturationId: String(payload.compteFacturationId ?? contexte.configurationId),
      metadata: { ...payload },
    };
  }
}
