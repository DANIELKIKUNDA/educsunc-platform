import type { ConfigurationReferentielEvenement } from '../ConfigurationReferentielIntegrationTypes';

export class ConfigurationReferentielAntiCorruptionLayer {
  public normaliser(payload: Readonly<Record<string, unknown>>): ConfigurationReferentielEvenement {
    const contexte = payload.contexte as ConfigurationReferentielEvenement['contexte'];
    return {
      type: (payload.type as ConfigurationReferentielEvenement['type']) ?? 'STRUCTURE_MISE_A_JOUR',
      contexte,
      referentielId: String(payload.referentielId ?? contexte.configurationId),
      metadata: { ...payload },
    };
  }
}
