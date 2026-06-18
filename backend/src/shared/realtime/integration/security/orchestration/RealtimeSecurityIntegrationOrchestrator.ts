import { RealtimeSecurityPolicyBridge } from '../bridges/RealtimeSecurityPolicyBridge';
import { RealtimeSecurityAudienceMapper } from '../mappers/RealtimeSecurityAudienceMapper';
import type {
  RealtimeSecurityEvenement,
  RealtimeSecurityProjection,
} from '../RealtimeSecurityIntegrationTypes';

export class RealtimeSecurityIntegrationOrchestrator {
  public readonly policy = new RealtimeSecurityPolicyBridge();

  public async synchroniserEvenement(evenement: RealtimeSecurityEvenement): Promise<void> {
    const projection = RealtimeSecurityAudienceMapper.appliquer(
      this.policy.lireProjection(),
      evenement,
    );
    this.policy.appliquerProjection(projection);
  }

  public snapshot(): RealtimeSecurityProjection {
    return this.policy.lireProjection();
  }
}
