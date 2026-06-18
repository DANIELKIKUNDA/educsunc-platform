import { RealtimeMonitoringMapper } from '../mappers/RealtimeMonitoringMapper';
import { RealtimeMonitoringPublisher } from '../publishers/RealtimeMonitoringPublisher';
import type {
  RealtimeMonitoringEvenement,
  RealtimeMonitoringProjection,
} from '../RealtimeMonitoringIntegrationTypes';

export class RealtimeMonitoringIntegrationOrchestrator {
  public readonly publisher = new RealtimeMonitoringPublisher();
  private projection: RealtimeMonitoringProjection = {
    totalSignaux: 0,
  };

  public async publier(evenement: RealtimeMonitoringEvenement): Promise<void> {
    await this.publisher.publier(evenement);
    this.projection = RealtimeMonitoringMapper.appliquer(this.projection, evenement);
  }

  public snapshot(): RealtimeMonitoringProjection {
    return { ...this.projection };
  }
}
