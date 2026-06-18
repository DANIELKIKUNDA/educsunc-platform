import { InitialiseurRuntimeMonitoring } from '../../runtime';
import { HealthcheckOperationalMonitoring } from '../health-checks/HealthcheckOperationalMonitoring';
import { DiagnosticOperationalMonitoring } from '../diagnostics/DiagnosticOperationalMonitoring';
import { OperationalRetentionMonitoring } from '../retention/OperationalRetentionMonitoring';

// Ce fichier declare la fabrique operationnelle du module Monitoring.

export class FabriqueOperationalMonitoring {
  public creer() {
    const runtime = new InitialiseurRuntimeMonitoring().initialiser();

    return {
      runtime,
      healthchecks: new HealthcheckOperationalMonitoring(runtime),
      diagnostics: new DiagnosticOperationalMonitoring(runtime),
      retention: new OperationalRetentionMonitoring(),
    };
  }
}
