import type { CreateAlertCommand, ResolveAlertCommand } from '../../application';
import { CreateAlertUseCase, ResolveAlertUseCase } from '../../application';

// Ce fichier declare le runtime de gestion des alertes.

export class RuntimeAlertsMonitoring {
  constructor(
    private readonly createAlertUseCase: CreateAlertUseCase,
    private readonly resolveAlertUseCase: ResolveAlertUseCase,
  ) {}

  public async declencher(commande: CreateAlertCommand) {
    return this.createAlertUseCase.executer(commande);
  }

  public async resoudre(commande: ResolveAlertCommand) {
    return this.resolveAlertUseCase.executer(commande);
  }
}
