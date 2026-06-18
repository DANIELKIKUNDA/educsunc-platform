import { RealtimeConfigurationPolicyBridge } from '../bridges/RealtimeConfigurationPolicyBridge';
import { RealtimeConfigurationMapper } from '../mappers/RealtimeConfigurationMapper';
import type {
  RealtimeConfigurationEvenement,
  RealtimeConfigurationProjection,
} from '../RealtimeConfigurationIntegrationTypes';

export class RealtimeConfigurationIntegrationOrchestrator {
  public readonly policy = new RealtimeConfigurationPolicyBridge();

  public async synchroniserEvenement(evenement: RealtimeConfigurationEvenement): Promise<void> {
    const projection = RealtimeConfigurationMapper.appliquer(
      this.policy.lireProjection(),
      evenement,
    );
    this.policy.appliquerProjection(projection);
  }

  public snapshot(): RealtimeConfigurationProjection {
    return this.policy.lireProjection();
  }
}
