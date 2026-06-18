import type { GenerateDiagnosticCommand } from '../../application';
import { InitialiseurRuntimeMonitoring } from '../../runtime';
import type { ResultatWorkerMonitoring } from '../TypesWorkersMonitoring';

// Ce fichier declare le worker de diagnostics Monitoring.

export class WorkerDiagnosticsMonitoring {
  private readonly runtime = new InitialiseurRuntimeMonitoring().initialiser();

  public async executer(commande: GenerateDiagnosticCommand): Promise<ResultatWorkerMonitoring> {
    const resultat = await this.runtime.diagnostics.incidents.generer(commande);
    return {
      worker: 'DIAGNOSTICS',
      succes: true,
      resultat,
    };
  }
}
