import { FacadeInfrastructureConfiguration } from '../../infrastructure';
import type { PlanExecutionPropagationConfiguration } from './PlanExecutionPropagationConfiguration';

// Ce fichier declare l orchestration operational de propagation.

export class OperationalPropagationConfiguration {
  constructor(private readonly facade = new FacadeInfrastructureConfiguration()) {}

  public async executer(plan: PlanExecutionPropagationConfiguration): Promise<void> {
    await this.facade.composants().propagateur.propagerConfiguration(
      plan.configurationId,
      plan.canauxCibles,
    );
  }
}
