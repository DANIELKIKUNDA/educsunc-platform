import { InitialiseurRuntimeRealtime } from '../../runtime';
import { DiagnosticOperationalRealtime } from '../diagnostics/DiagnosticOperationalRealtime';
import { HealthcheckOperationalRealtime } from '../health-checks/HealthcheckOperationalRealtime';
import { OperationalRecoveryRealtime } from '../recovery/OperationalRecoveryRealtime';

export class FabriqueOperationalRealtime {
  public creer() {
    const runtime = new InitialiseurRuntimeRealtime().initialiser();

    return {
      runtime,
      healthchecks: new HealthcheckOperationalRealtime(runtime),
      diagnostics: new DiagnosticOperationalRealtime(runtime),
      recovery: new OperationalRecoveryRealtime(runtime),
    };
  }
}
