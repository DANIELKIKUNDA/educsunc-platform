import { StrategieDegradationRealtime } from '../../infrastructure';
import { RuntimeRealtimeRegistry } from '../registry';

export class RuntimeHealthRealtime {
  constructor(
    private readonly registry: RuntimeRealtimeRegistry,
    private readonly degradation = new StrategieDegradationRealtime(),
  ) {}

  public lire() {
    return {
      runtime: this.registry.snapshot(),
      degradation: this.degradation.appliquer(this.registry.snapshot().demarre),
    };
  }
}
