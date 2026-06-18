import type { SignalSysteme } from '../../domain';

// Ce fichier declare le port applicatif d observabilite transverse.

/** Cette interface represente le pont vers l observabilite transverse. */
export interface MonitoringObservabilityPort {
  publierSignal(signal: SignalSysteme): Promise<void>;
}
