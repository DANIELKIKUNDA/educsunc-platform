import type { VerifierDiffusabiliteRealtimeQuery } from '../queries';
import { ServiceApplicationDiffusionRealtime } from '../services';

export class VerifierDiffusabiliteRealtimeUseCase {
  constructor(private readonly service: ServiceApplicationDiffusionRealtime) {}

  public async executer(query: VerifierDiffusabiliteRealtimeQuery): Promise<boolean> {
    return this.service.verifier(query.evenement);
  }
}
