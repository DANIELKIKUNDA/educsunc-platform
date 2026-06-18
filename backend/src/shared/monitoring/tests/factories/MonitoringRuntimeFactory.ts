import { InitialiseurRuntimeMonitoring } from '../../../monitoring';

// Ce fichier declare la fabrique de runtime des tests Monitoring.

export class MonitoringRuntimeFactory {
  public static creer() {
    return new InitialiseurRuntimeMonitoring().initialiser();
  }
}
