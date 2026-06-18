import type { PortConfigurationRealtime } from '../../application';
import { PolitiqueDiffusion, PrioriteRealtime, TypeDiffusionRealtime } from '../../domain';

export class AdaptateurConfigurationRealtimeLocal implements PortConfigurationRealtime {
  public async obtenirPolitiqueCourante(): Promise<PolitiqueDiffusion> {
    return new PolitiqueDiffusion({
      prioriteParDefaut: PrioriteRealtime.NORMALE,
      typeDiffusionParDefaut: TypeDiffusionRealtime.MULTICAST,
      offlineFirst: true,
      canauxAutorises: [
        'finance',
        'evaluations',
        'bulletins',
        'notifications',
        'monitoring',
        'synchronisation',
        'administration',
      ],
    });
  }
}
