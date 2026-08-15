import type { RealtimeMonitoringSignal } from '../RealtimeMonitoringIntegrationTypes';

export class RealtimeMonitoringEventListener {
  public consommer(signal: RealtimeMonitoringSignal): RealtimeMonitoringSignal {
    return signal;
  }
}
