import type { TraceOperation } from '../entities';
import type { FiltreMonitoring } from '../value-objects';

// Ce fichier declare le port de persistence des traces.

/** Cette interface represente le repository domaine des traces. */
export interface PortRepositoryTrace {
  sauvegarder(trace: TraceOperation): Promise<void> | void;
  rechercherParFiltre(filtre: FiltreMonitoring): Promise<readonly TraceOperation[]> | readonly TraceOperation[];
}
