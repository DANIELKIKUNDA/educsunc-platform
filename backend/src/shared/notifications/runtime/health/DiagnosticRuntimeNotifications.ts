import { RegistreRuntimeNotifications } from '../registry/RegistreRuntimeNotifications';
import { SanteRuntimeNotifications } from './SanteRuntimeNotifications';

// Ce fichier expose un diagnostic runtime complet du moteur Notifications.

/** Cette classe assemble les informations de sante et d'executions recentes du runtime. */
export class DiagnosticRuntimeNotifications {
  /** Ce constructeur relie le diagnostic a la sante runtime et au registre central. */
  constructor(
    private readonly santeRuntimeNotifications: SanteRuntimeNotifications,
    private readonly registreRuntimeNotifications: RegistreRuntimeNotifications,
  ) {}

  /** Cette methode retourne un diagnostic complet exploitable en support operationnel. */
  public async diagnostiquer(): Promise<{
    readonly sante: Awaited<ReturnType<SanteRuntimeNotifications['observer']>>;
    readonly runtime: ReturnType<RegistreRuntimeNotifications['observer']>;
  }> {
    return {
      sante: await this.santeRuntimeNotifications.observer(),
      runtime: this.registreRuntimeNotifications.observer(),
    };
  }
}
