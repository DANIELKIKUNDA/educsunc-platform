import type { CreateAlertCommand, ResolveAlertCommand } from '../commands';
import type { AlertDto } from '../dto/output';
import { CreateAlertUseCase, ResolveAlertUseCase } from '../use-cases';

// Ce fichier declare l orchestrateur de workflow alertes.

/** Cette classe orchestre le cycle de vie applicatif d une alerte. */
export class AlertWorkflowOrchestrator {
  constructor(
    private readonly createAlertUseCase: CreateAlertUseCase,
    private readonly resolveAlertUseCase: ResolveAlertUseCase,
  ) {}

  /** Cette methode cree puis resout eventuellement une alerte. */
  public async executer(
    creation: CreateAlertCommand,
    resolution?: ResolveAlertCommand,
  ): Promise<{ readonly alerte: AlertDto; readonly alerteResolue?: AlertDto }> {
    const alerte = await this.createAlertUseCase.executer(creation);
    const alerteResolue = resolution ? await this.resolveAlertUseCase.executer(resolution) : undefined;
    return { alerte, alerteResolue };
  }
}
