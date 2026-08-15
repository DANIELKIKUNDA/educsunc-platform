import { EtatComposant } from '../../domain';
import type { MonitoringContextInputDto } from '../../application';

// Etat minimal du processus local. Aucune latence arbitraire n est inventee.
export class CollecteurEtatComposantsMonitoring {
  public async collecter(contexte: MonitoringContextInputDto): Promise<readonly EtatComposant[]> {
    return [
      new EtatComposant({
        nom: contexte.composant ?? contexte.module ?? 'monitoring-core',
        niveau: 'HEALTHY',
        message: `Processus Node actif depuis ${Math.floor(process.uptime())} s`,
        dernierControleLe: new Date(),
        contexte: { ...contexte },
      }),
    ];
  }
}
