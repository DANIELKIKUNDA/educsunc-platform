import type { SignalSysteme } from '../../domain';

// Ce fichier declare le mapper de signaux Monitoring.

/** Cette classe projette les signaux en vues techniques. */
export class MonitoringSignalMapper {
  /** Cette methode projette un signal en vue persistable. */
  public versVue(signal: SignalSysteme): ReturnType<SignalSysteme['valeur']> {
    return signal.valeur();
  }
}
