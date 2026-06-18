import { FacadeInfrastructureConfiguration } from '../../infrastructure';
import type { PlanExecutionReloadConfiguration } from './PlanExecutionReloadConfiguration';

// Ce fichier declare l orchestration operational de reload.

export class OperationalReloadConfiguration {
  constructor(private readonly facade = new FacadeInfrastructureConfiguration()) {}

  public async executer(plan: PlanExecutionReloadConfiguration): Promise<void> {
    await this.facade.composants().rechargeurRuntime.rechargerConfigurationRuntime(
      plan.configurationId,
      plan.forcer,
    );
  }
}
