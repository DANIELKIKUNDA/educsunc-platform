import type {
  CollectHealthSnapshotCommand,
} from '../commands';
import type { RegisterSignalCommand } from '../commands';
import type { GetObservabilitySnapshotQuery } from '../queries';
import type { HealthSnapshotDto, ObservabilitySnapshotDto } from '../dto/output';
import {
  CollectHealthSnapshotUseCase,
  GetObservabilitySnapshotUseCase,
  RegisterSignalUseCase,
} from '../use-cases';

// Ce fichier declare l orchestrateur principal Monitoring.

/** Cette classe orchestre les workflows transverses de monitoring. */
export class MonitoringWorkflowOrchestrator {
  constructor(
    private readonly collectHealthSnapshotUseCase: CollectHealthSnapshotUseCase,
    private readonly registerSignalUseCase: RegisterSignalUseCase,
    private readonly getObservabilitySnapshotUseCase: GetObservabilitySnapshotUseCase,
  ) {}

  /** Cette methode execute un cycle court de supervision. */
  public async superviser(
    commandeSante: CollectHealthSnapshotCommand,
    signaux: readonly RegisterSignalCommand[],
    queryObservabilite: GetObservabilitySnapshotQuery,
  ): Promise<{ readonly sante: HealthSnapshotDto; readonly observabilite: ObservabilitySnapshotDto }> {
    for (const signal of signaux) {
      await this.registerSignalUseCase.executer(signal);
    }

    return {
      sante: await this.collectHealthSnapshotUseCase.executer(commandeSante),
      observabilite: await this.getObservabilitySnapshotUseCase.executer(queryObservabilite),
    };
  }
}
