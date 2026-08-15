import { RealtimeMonitoringMapper } from '../mappers/RealtimeMonitoringMapper';
import { RealtimeMonitoringPublisher, type RealtimeMonitoringSink } from '../publishers/RealtimeMonitoringPublisher';
import type { RealtimeMonitoringProjection, RealtimeMonitoringSignal, RealtimeMonitoringSnapshot } from '../RealtimeMonitoringIntegrationTypes';

export class RealtimeMonitoringIntegrationOrchestrator {
  public readonly publisher: RealtimeMonitoringPublisher;
  private projection: RealtimeMonitoringProjection = { totalSignaux: 0 };
  private readonly antiTempete = new Map<string, number>();

  constructor(sink?: RealtimeMonitoringSink, private readonly fenetreDedupMs = 1_000) {
    this.publisher = new RealtimeMonitoringPublisher(sink);
  }

  public async publier(signal: RealtimeMonitoringSignal): Promise<boolean> {
    const maintenant = Date.now();
    const cle = `${signal.type}:${signal.correlationId ?? signal.evenementId}`;
    const derniere = this.antiTempete.get(cle);
    if (derniere !== undefined && maintenant - derniere < this.fenetreDedupMs) return false;
    this.antiTempete.set(cle, maintenant);
    if (this.antiTempete.size > 500) {
      for (const [k, instant] of this.antiTempete) if (maintenant - instant > this.fenetreDedupMs * 4) this.antiTempete.delete(k);
    }
    const commande = RealtimeMonitoringMapper.versCommande(signal);
    await this.publisher.publier(commande);
    this.projection = RealtimeMonitoringMapper.appliquer(this.projection, signal);
    return true;
  }

  public snapshot(): RealtimeMonitoringSnapshot {
    return { ...this.projection, messages: this.publisher.journal() };
  }
}
