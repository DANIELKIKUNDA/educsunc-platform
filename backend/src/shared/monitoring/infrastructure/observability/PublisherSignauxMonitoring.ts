import type { MonitoringObservabilityPort } from '../../application';
import type { SignalSysteme } from '../../domain';

// Ce fichier declare l adapter de publication des signaux Monitoring.

/** Cette classe represente le publisher local des signaux d observabilite. */
export class PublisherSignauxMonitoring implements MonitoringObservabilityPort {
  private readonly signaux: SignalSysteme[] = [];

  /** Cette methode publie un signal dans le journal local. */
  public async publierSignal(signal: SignalSysteme): Promise<void> {
    this.signaux.push(signal);
  }

  /** Cette methode expose les signaux deja publies. */
  public lister(): readonly SignalSysteme[] {
    return [...this.signaux];
  }
}
