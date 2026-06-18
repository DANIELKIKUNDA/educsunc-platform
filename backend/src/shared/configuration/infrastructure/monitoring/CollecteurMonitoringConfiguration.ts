import { PortMonitoringConfiguration } from '../../application';
import {
  ObservationMonitoringConfiguration,
  SignalMonitoringConfiguration,
} from './TypesMonitoringConfiguration';

// Ce fichier declare le collecteur principal de monitoring.

/** Cette classe represente l adapter infrastructure de monitoring. */
export class CollecteurMonitoringConfiguration implements PortMonitoringConfiguration {
  private readonly observations: ObservationMonitoringConfiguration[] = [];

  /** Cette methode publie un signal technique de monitoring. */
  public async publierSignalConfiguration(
    signal: SignalMonitoringConfiguration,
    configurationId: string,
  ): Promise<void> {
    this.observations.push({
      signal,
      configurationId,
      observeLe: new Date(),
    });
  }

  /** Cette methode expose les observations techniques memorisees. */
  public journal(): readonly ObservationMonitoringConfiguration[] {
    return [...this.observations];
  }
}
