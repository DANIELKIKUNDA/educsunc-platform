import type { MonitoringSecurityEvenement } from '../../integration';
import { InitialiseurRuntimeMonitoring } from '../../runtime';
import type { ResultatWorkerMonitoring } from '../TypesWorkersMonitoring';

// Ce fichier declare le worker de diagnostics forensic Monitoring.

export class WorkerForensicDiagnosticsMonitoring {
  private readonly runtime = new InitialiseurRuntimeMonitoring().initialiser();

  public executer(evenement: MonitoringSecurityEvenement): ResultatWorkerMonitoring {
    this.runtime.diagnostics.forensic.enregistrer(evenement);
    return {
      worker: 'DIAGNOSTICS_FORENSIC',
      succes: true,
      resultat: this.runtime.diagnostics.forensic.lister(),
    };
  }
}
