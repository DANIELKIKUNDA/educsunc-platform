import { EtatSysteme } from '../aggregates';
import { EtatComposant, EtatDependance, EtatRuntime } from '../entities';
import type { ContexteMonitoring } from '../value-objects';

// Ce fichier declare le service de calcul de l etat systeme global.

/** Cette classe represente le calculateur d etat systeme. */
export class ServiceCalculEtatSysteme {
  /** Cette methode compose l etat systeme a partir des sources disponibles. */
  public calculer(
    contexte: ContexteMonitoring,
    composants: readonly EtatComposant[],
    dependances: readonly EtatDependance[],
    runtime: EtatRuntime,
  ): EtatSysteme {
    return new EtatSysteme(contexte, composants, dependances, runtime);
  }
}
