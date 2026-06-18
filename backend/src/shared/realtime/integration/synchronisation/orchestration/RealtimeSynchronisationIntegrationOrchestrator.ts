import { RealtimeSynchronisationBridge } from '../bridges/RealtimeSynchronisationBridge';
import { RealtimeSynchronisationMapper } from '../mappers/RealtimeSynchronisationMapper';
import type {
  RealtimeSynchronisationEvenement,
  RealtimeSynchronisationProjection,
} from '../RealtimeSynchronisationIntegrationTypes';

export class RealtimeSynchronisationIntegrationOrchestrator {
  public readonly bridge = new RealtimeSynchronisationBridge();

  public async synchroniserEvenement(evenement: RealtimeSynchronisationEvenement): Promise<void> {
    const projection = RealtimeSynchronisationMapper.appliquer(
      this.bridge.lireProjection(),
      evenement,
    );
    this.bridge.appliquerProjection(projection);
  }

  public snapshot(): RealtimeSynchronisationProjection {
    return this.bridge.lireProjection();
  }
}
