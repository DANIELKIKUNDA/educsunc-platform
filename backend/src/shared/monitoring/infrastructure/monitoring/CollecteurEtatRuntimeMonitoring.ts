import { EtatRuntime } from '../../domain';
import type { MonitoringContextInputDto } from '../../application';

// Ce fichier declare le collecteur local de runtime.

/** Cette classe represente le collecteur memoire du runtime Monitoring. */
export class CollecteurEtatRuntimeMonitoring {
  /** Cette methode collecte l etat runtime courant. */
  public async collecter(_contexte: MonitoringContextInputDto): Promise<EtatRuntime> {
    return new EtatRuntime({
      niveau: 'HEALTHY',
      filesActives: ['monitoring-local'],
      workersActifs: ['collecteur-health', 'collecteur-observabilite'],
      jobsEnCours: 0,
      jobsEnRetard: 0,
      misAJourLe: new Date(),
    });
  }
}
