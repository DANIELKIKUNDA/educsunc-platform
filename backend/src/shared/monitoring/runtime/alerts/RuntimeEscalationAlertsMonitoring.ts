import type { EscalateIncidentCommand } from '../../application';
import { EscalateIncidentUseCase } from '../../application';

// Ce fichier declare le runtime d escalade d alertes/incidents.

export class RuntimeEscalationAlertsMonitoring {
  constructor(private readonly useCase: EscalateIncidentUseCase) {}

  public async escalader(commande: EscalateIncidentCommand) {
    return this.useCase.executer(commande);
  }
}
