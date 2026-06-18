import type { CreateAlertCommand, RegisterSignalCommand } from '../commands';
import { CreateAlertUseCase, RegisterSignalUseCase } from '../use-cases';

// Ce fichier declare la saga d alertes Monitoring.

/** Cette classe orchestre une reaction applicative signal vers alerte. */
export class MonitoringAlertSaga {
  constructor(
    private readonly registerSignalUseCase: RegisterSignalUseCase,
    private readonly createAlertUseCase: CreateAlertUseCase,
  ) {}

  /** Cette methode enchaine l enregistrement du signal puis la creation d alerte. */
  public async executer(signal: RegisterSignalCommand, alerte: CreateAlertCommand): Promise<void> {
    await this.registerSignalUseCase.executer(signal);
    await this.createAlertUseCase.executer(alerte);
  }
}
