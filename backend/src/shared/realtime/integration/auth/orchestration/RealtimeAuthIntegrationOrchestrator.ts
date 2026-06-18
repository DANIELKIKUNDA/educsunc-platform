import { RealtimeAuthSessionBridge } from '../bridges/RealtimeAuthSessionBridge';
import { RealtimeAuthContextMapper } from '../mappers/RealtimeAuthContextMapper';
import type { RealtimeAuthEvenement, RealtimeAuthProjection } from '../RealtimeAuthIntegrationTypes';

export class RealtimeAuthIntegrationOrchestrator {
  public readonly session = new RealtimeAuthSessionBridge();

  public async synchroniserEvenement(evenement: RealtimeAuthEvenement): Promise<void> {
    const projection = RealtimeAuthContextMapper.appliquer(this.session.lireProjection(), evenement);
    this.session.appliquerProjection(projection);
  }

  public snapshot(): RealtimeAuthProjection {
    return this.session.lireProjection();
  }
}
